// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { WebviewProvider } from "./webview/WebviewProvider"
import { McpServerManager } from "./mcp/McpServerManager"

/*
Built using https://github.com/microsoft/vscode-webview-ui-toolkit

Inspired by
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra

*/

let outputChannel: vscode.OutputChannel
let mcpServerManager: McpServerManager

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("mcp-feedback")
	context.subscriptions.push(outputChannel)

	outputChannel.appendLine("mcp-feedback extension activated")

	// 启动MCP服务器
	mcpServerManager = new McpServerManager(outputChannel)
	mcpServerManager.start().then(() => {
		const serverUrl = mcpServerManager.getServerUrl()
		const port = mcpServerManager.getPort()
		outputChannel.appendLine(`MCP Server URL: ${serverUrl}`)
		vscode.window.showInformationMessage(`MCP服务器已启动，端口: ${port}`)
	}).catch((error) => {
		outputChannel.appendLine(`Failed to start MCP server: ${error}`)
		vscode.window.showErrorMessage(`MCP服务器启动失败: ${error}`)
	})

	const sidebarWebview = new WebviewProvider(context, outputChannel, mcpServerManager)
	mcpServerManager.setWebviewProvider(sidebarWebview)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebviewProvider.sideBarId, sidebarWebview, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	const openDemoInNewTab = async () => {
		outputChannel.appendLine("Opening MCP Feedback in new tab")
		const tabWebview = new WebviewProvider(context, outputChannel)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		// Check if there are any visible text editors, otherwise open a new group to the right
		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(WebviewProvider.tabPanelId, "MCP Feedback", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "icon.png"),
			dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "icon.png"),
		}
		tabWebview.resolveWebviewView(panel)
	}

	context.subscriptions.push(vscode.commands.registerCommand("sidebarDemo.openInNewTab", openDemoInNewTab))
}

// This method is called when your extension is deactivated
export async function deactivate() {
	outputChannel.appendLine("mcp-feedback extension deactivated")
	if (mcpServerManager) {
		await mcpServerManager.stop()
	}
}
