import * as vscode from "vscode"
import { getNonce } from "./getNonce"
import { getUri } from "./getUri"
import { McpServerManager } from "../mcp/McpServerManager"

export class WebviewProvider implements vscode.WebviewViewProvider {
	public static readonly sideBarId = "sidebar-demo.SidebarProvider"
	public static readonly tabPanelId = "sidebar-demo.TabPanelProvider"
	private static activeInstances: Set<WebviewProvider> = new Set()
	public view?: vscode.WebviewView | vscode.WebviewPanel
	private disposables: vscode.Disposable[] = []

	constructor(
		readonly context: vscode.ExtensionContext,
		private readonly outputChannel: vscode.OutputChannel,
		private readonly mcpServerManager?: McpServerManager,
	) {
		WebviewProvider.activeInstances.add(this)
	}

	async dispose() {
		if (this.view && "dispose" in this.view) {
			this.view.dispose()
		}
		while (this.disposables.length) {
			const x = this.disposables.pop()
			if (x) {
				x.dispose()
			}
		}
		WebviewProvider.activeInstances.delete(this)
	}

	public static getVisibleInstance(): WebviewProvider | undefined {
		return Array.from(this.activeInstances).find((instance) => instance.view?.visible === true)
	}

	public static getAllInstances(): WebviewProvider[] {
		return Array.from(this.activeInstances)
	}

	public static getSidebarInstance() {
		return Array.from(this.activeInstances).find((instance) => instance.view && "onDidChangeVisibility" in instance.view)
	}

	public static getTabInstances(): WebviewProvider[] {
		return Array.from(this.activeInstances).filter((instance) => instance.view && "onDidChangeViewState" in instance.view)
	}

	async resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel) {
		this.view = webviewView

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		}

		webviewView.webview.html = this.getHtmlContent(webviewView.webview)

		// Sets up an event listener to listen for messages passed from the webview view context
		// and executes code based on the message that is received
		this.setWebviewMessageListener(webviewView.webview)

		this.outputChannel.appendLine("Webview view resolved")
	}

	/**
	 * Defines and returns the HTML that should be rendered within the webview panel.
	 */
	private getHtmlContent(webview: vscode.Webview): string {
		// Get the local path to main script run in the webview,
		// then convert it to a uri we can use in the webview.
		const scriptUri = getUri(webview, this.context.extensionUri, ["webview-ui", "dist", "assets", "index.js"])
		const stylesUri = getUri(webview, this.context.extensionUri, ["webview-ui", "dist", "assets", "index.css"])

		const nonce = getNonce()

		// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
					<link rel="stylesheet" type="text/css" href="${stylesUri}">
					<title>MCP Feedback</title>
				</head>
				<body>
					<div id="root"></div>
					<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
				</body>
			</html>
		`
	}

	/**
	 * Sets up an event listener to listen for messages passed from the webview context and
	 * executes code based on the message that is received.
	 */
	private setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(
			(message) => {
				this.handleWebviewMessage(message)
			},
			null,
			this.disposables,
		)
	}

	private handleWebviewMessage(message: any) {
		switch (message.type) {
			case "showMessage":
				vscode.window.showInformationMessage(message.text || "Hello from MCP Feedback!")
				break
			case "getConfig":
				const config = vscode.workspace.getConfiguration("sidebarDemo")
				const demoMessage = config.get("message", "MCP反馈服务器已启动")
				this.view?.webview.postMessage({
					type: "config",
					message: demoMessage,
					mcpServerUrl: this.mcpServerManager?.getServerUrl()
				})
				break
			case "getToolCalls":
				if (this.mcpServerManager) {
					const toolCalls = this.mcpServerManager.getToolCalls()
					this.view?.webview.postMessage({
						type: "toolCalls",
						data: toolCalls
					})
				}
				break
			case "submitFeedback":
				if (this.mcpServerManager && message.toolCallId && (message.feedback || message.attachments)) {
					const feedbackData = {
						text: message.feedback || "",
						attachments: message.attachments || []
					}
					const success = this.mcpServerManager.submitUserFeedback(message.toolCallId, JSON.stringify(feedbackData))
					this.view?.webview.postMessage({
						type: "feedbackSubmitted",
						success,
						toolCallId: message.toolCallId
					})
				}
				break
			case "getSettings":
				this.handleGetSettings()
				break
			case "updateSettings":
				this.handleUpdateSettings(message.settings)
				break
			case "restartServer":
				this.handleRestartServer()
				break
			case "updateTimeout":
				this.handleUpdateTimeout(message.timeout)
				break
			default:
				this.outputChannel.appendLine(`Unknown message type: ${message.type}`)
				break
		}
	}

	private handleGetSettings() {
		const config = vscode.workspace.getConfiguration("mcpFeedbackServer")
		const settings = {
			enabledTools: config.get("enabledTools", {
				"request-user-feedback": true,
				"get-user-confirmation": true
			}),
			timeout: config.get("timeout", 30000),
			port: config.get("port", 7423),
			autoRestart: config.get("autoRestart", false)
		}

		this.view?.webview.postMessage({
			type: "settings",
			data: settings
		})
	}

	private async handleUpdateSettings(settings: any) {
		try {
			const config = vscode.workspace.getConfiguration("mcpFeedbackServer")
			const currentPort = this.mcpServerManager?.getPort() || 7423

			// 更新配置
			await config.update("enabledTools", settings.enabledTools, vscode.ConfigurationTarget.Global)
			await config.update("timeout", settings.timeout, vscode.ConfigurationTarget.Global)
			await config.update("port", settings.port, vscode.ConfigurationTarget.Global)
			await config.update("autoRestart", settings.autoRestart, vscode.ConfigurationTarget.Global)

			// 检查是否需要重启服务器
			const needsRestart = settings.port !== currentPort

			if (this.mcpServerManager) {
				if (needsRestart) {
					this.outputChannel.appendLine(`Port changed from ${currentPort} to ${settings.port}, restarting server...`)

					// 发送重启开始通知
					this.view?.webview.postMessage({
						type: "serverRestarting",
						message: "正在重启服务器以应用端口更改..."
					})

					// 更新端口并重启
					await this.mcpServerManager.updatePort(settings.port)

					// 发送重启完成通知
					this.view?.webview.postMessage({
						type: "serverRestarted",
						success: true,
						serverUrl: this.mcpServerManager.getServerUrl()
					})

					vscode.window.showInformationMessage(`MCP服务器已重启，新端口: ${settings.port}`)
				}
			}

			this.view?.webview.postMessage({
				type: "settingsUpdated",
				success: true,
				settings: settings
			})

			this.outputChannel.appendLine("Settings updated successfully")
		} catch (error) {
			this.outputChannel.appendLine(`Failed to update settings: ${error}`)
			this.view?.webview.postMessage({
				type: "settingsUpdated",
				success: false,
				error: error
			})
			vscode.window.showErrorMessage(`设置更新失败: ${error}`)
		}
	}

	private async handleRestartServer() {
		try {
			if (this.mcpServerManager) {
				this.outputChannel.appendLine("Restarting MCP server...")
				await this.mcpServerManager.restart()

				this.view?.webview.postMessage({
					type: "serverRestarted",
					success: true,
					serverUrl: this.mcpServerManager.getServerUrl()
				})

				vscode.window.showInformationMessage("MCP服务器已重启")
				this.outputChannel.appendLine("MCP server restarted successfully")
			}
		} catch (error) {
			this.outputChannel.appendLine(`Failed to restart server: ${error}`)
			this.view?.webview.postMessage({
				type: "serverRestarted",
				success: false,
				error: error
			})
			vscode.window.showErrorMessage(`MCP服务器重启失败: ${error}`)
		}
	}

	public notifyPortChange(port: number) {
		this.view?.webview.postMessage({
			type: "portChanged",
			port: port,
			serverUrl: this.mcpServerManager?.getServerUrl()
		})
	}

	private async handleUpdateTimeout(timeout: number) {
		try {
			const config = vscode.workspace.getConfiguration("mcpFeedbackServer")
			await config.update("timeout", timeout, vscode.ConfigurationTarget.Global)
			this.outputChannel.appendLine(`Timeout updated to ${timeout}ms`)
		} catch (error) {
			this.outputChannel.appendLine(`Failed to update timeout: ${error}`)
		}
	}
}
