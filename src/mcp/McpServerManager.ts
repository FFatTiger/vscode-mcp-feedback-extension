import * as vscode from "vscode"
import express from "express"
import cors from "cors"
import { randomUUID } from "node:crypto"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"

export interface ToolCallData {
	id: string
	toolName: string
	arguments: any
	timestamp: Date
	status: 'pending' | 'completed' | 'error'
	result?: any
	userFeedback?: string
}

export class McpServerManager {
	private app: express.Application
	private server: any
	private transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}
	private mcpServer: McpServer
	private outputChannel: vscode.OutputChannel
	private webviewProvider?: any
	private toolCalls: Map<string, ToolCallData> = new Map()
	private port: number = 7423

	constructor(outputChannel: vscode.OutputChannel) {
		this.outputChannel = outputChannel
		// 从配置中读取端口
		const config = vscode.workspace.getConfiguration("mcpFeedbackServer")
		this.port = config.get("port", 7423)
		this.app = express()
		this.setupExpress()
		this.setupMcpServer()
	}

	private setupExpress() {
		this.app.use(cors())
		this.app.use(express.json())

		// Handle POST requests for client-to-server communication
		this.app.post('/mcp', async (req, res) => {
			try {
				const sessionId = req.headers['mcp-session-id'] as string | undefined
				let transport: StreamableHTTPServerTransport

				if (sessionId && this.transports[sessionId]) {
					transport = this.transports[sessionId]
				} else if (!sessionId && isInitializeRequest(req.body)) {
					transport = new StreamableHTTPServerTransport({
						sessionIdGenerator: () => randomUUID(),
						onsessioninitialized: (sessionId) => {
							this.transports[sessionId] = transport
							this.outputChannel.appendLine(`MCP session initialized: ${sessionId}`)
						}
					})

					transport.onclose = () => {
						if (transport.sessionId) {
							delete this.transports[transport.sessionId]
							this.outputChannel.appendLine(`MCP session closed: ${transport.sessionId}`)
						}
					}

					await this.mcpServer.connect(transport)
				} else {
					res.status(400).json({
						jsonrpc: '2.0',
						error: {
							code: -32000,
							message: 'Bad Request: No valid session ID provided',
						},
						id: null,
					})
					return
				}

				await transport.handleRequest(req, res, req.body)
			} catch (error) {
				this.outputChannel.appendLine(`MCP POST error: ${error}`)
				res.status(500).json({
					jsonrpc: '2.0',
					error: {
						code: -32603,
						message: 'Internal server error',
					},
					id: null,
				})
			}
		})

		// Handle GET requests for server-to-client notifications via SSE
		this.app.get('/mcp', async (req, res) => {
			await this.handleSessionRequest(req, res)
		})

		// Handle DELETE requests for session termination
		this.app.delete('/mcp', async (req, res) => {
			await this.handleSessionRequest(req, res)
		})
	}

	private async handleSessionRequest(req: express.Request, res: express.Response) {
		const sessionId = req.headers['mcp-session-id'] as string | undefined
		if (!sessionId || !this.transports[sessionId]) {
			res.status(400).send('Invalid or missing session ID')
			return
		}
		
		const transport = this.transports[sessionId]
		await transport.handleRequest(req, res)
	}

	private setupMcpServer() {
		this.mcpServer = new McpServer({
			name: "mcp-feedback",
			version: "1.0.0"
		})

		// 注册一个等待用户反馈的工具
		this.mcpServer.tool(
			"request-user-feedback",
			{
				message: z.string().describe("The message or question to show to the user"),
				context: z.string().optional().describe("Additional context for the user"),
				toolName: z.string().optional().describe("Name of the tool being called")
			},
			async ({ message, context, toolName }) => {
				const toolCallId = randomUUID()
				const toolCall: ToolCallData = {
					id: toolCallId,
					toolName: toolName || "request-user-feedback",
					arguments: { message, context },
					timestamp: new Date(),
					status: 'pending'
				}

				this.toolCalls.set(toolCallId, toolCall)
				
				// 通知webview有新的工具调用
				this.notifyWebview('tool-call', toolCall)

				// 等待用户反馈
				return new Promise((resolve) => {
					const checkFeedback = () => {
						const updatedCall = this.toolCalls.get(toolCallId)
						if (updatedCall && updatedCall.status === 'completed') {
							resolve({
								content: [{
									type: "text",
									text: updatedCall.userFeedback || "No feedback provided"
								}]
							})
						} else {
							setTimeout(checkFeedback, 1000) // 每秒检查一次
						}
					}
					checkFeedback()
				})
			}
		)

		// 注册一个示例工具
		this.mcpServer.tool(
			"get-user-confirmation",
			{
				action: z.string().describe("The action that needs user confirmation"),
				details: z.string().optional().describe("Additional details about the action")
			},
			async ({ action, details }) => {
				const toolCallId = randomUUID()
				const toolCall: ToolCallData = {
					id: toolCallId,
					toolName: "get-user-confirmation",
					arguments: { action, details },
					timestamp: new Date(),
					status: 'pending'
				}

				this.toolCalls.set(toolCallId, toolCall)
				this.notifyWebview('tool-call', toolCall)

				return new Promise((resolve) => {
					const checkFeedback = () => {
						const updatedCall = this.toolCalls.get(toolCallId)
						if (updatedCall && updatedCall.status === 'completed') {
							const feedback = updatedCall.userFeedback?.toLowerCase()
							const confirmed = feedback === 'yes' || feedback === 'y' || feedback === 'confirm' || feedback === 'ok'
							resolve({
								content: [{
									type: "text",
									text: confirmed ? "Action confirmed by user" : "Action rejected by user"
								}]
							})
						} else {
							setTimeout(checkFeedback, 1000)
						}
					}
					checkFeedback()
				})
			}
		)
	}

	public setWebviewProvider(provider: any) {
		this.webviewProvider = provider
	}

	private notifyWebview(type: string, data: any) {
		if (this.webviewProvider && this.webviewProvider.view) {
			this.webviewProvider.view.webview.postMessage({
				type,
				data
			})
		}
	}

	public submitUserFeedback(toolCallId: string, feedback: string): boolean {
		const toolCall = this.toolCalls.get(toolCallId)
		if (toolCall && toolCall.status === 'pending') {
			toolCall.userFeedback = feedback
			toolCall.status = 'completed'
			toolCall.result = feedback
			this.toolCalls.set(toolCallId, toolCall)
			
			this.notifyWebview('tool-call-updated', toolCall)
			return true
		}
		return false
	}

	public getToolCalls(): ToolCallData[] {
		return Array.from(this.toolCalls.values()).sort((a, b) => 
			b.timestamp.getTime() - a.timestamp.getTime()
		)
	}

	public async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			const tryStartServer = (port: number) => {
				this.server = this.app.listen(port, () => {
					this.port = port
					this.outputChannel.appendLine(`MCP Server started on port ${this.port}`)
					// 通知webview端口信息
					if (this.webviewProvider) {
						this.webviewProvider.notifyPortChange(this.port)
					}
					resolve()
				})

				this.server.on('error', (error: any) => {
					if (error.code === 'EADDRINUSE') {
						// 生成随机端口 (7424-9999)
						const randomPort = Math.floor(Math.random() * (9999 - 7424 + 1)) + 7424
						this.outputChannel.appendLine(`Port ${port} in use, trying random port ${randomPort}`)
						tryStartServer(randomPort)
					} else {
						reject(error)
					}
				})
			}

			tryStartServer(this.port)
		})
	}

	public stop(): Promise<void> {
		return new Promise((resolve) => {
			if (this.server) {
				// 关闭所有活跃的传输连接
				Object.values(this.transports).forEach(transport => {
					try {
						if (transport.sessionId) {
							delete this.transports[transport.sessionId]
						}
					} catch (error) {
						this.outputChannel.appendLine(`Error closing transport: ${error}`)
					}
				})
				this.transports = {}

				// 关闭HTTP服务器
				this.server.close((error: any) => {
					if (error) {
						this.outputChannel.appendLine(`Error stopping server: ${error}`)
					} else {
						this.outputChannel.appendLine("MCP Server stopped")
					}
					this.server = null
					resolve()
				})
			} else {
				resolve()
			}
		})
	}

	public async restart(): Promise<void> {
		this.outputChannel.appendLine("Restarting MCP Server...")
		await this.stop()
		// 等待一小段时间确保端口释放
		await new Promise(resolve => setTimeout(resolve, 2000))
		await this.start()
	}

	public getServerUrl(): string {
		return `http://localhost:${this.port}/mcp`
	}

	public getPort(): number {
		return this.port
	}

	public setPort(port: number): void {
		this.port = port
	}

	public async updatePort(port: number): Promise<void> {
		if (this.port !== port) {
			this.outputChannel.appendLine(`Updating port from ${this.port} to ${port}`)
			this.port = port
			await this.restart()
		}
	}
}
