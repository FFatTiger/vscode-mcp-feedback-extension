import { useState, useEffect } from "react"
import Header from "./components/Header"
import ToolCallList from "./components/ToolCallList"
import WorkflowPanel from "./components/WorkflowPanel"
import { useToolCalls } from "./hooks/useToolCalls"
import { vscode } from "./utils/vscode"

const App = () => {
	const [showWorkflow, setShowWorkflow] = useState(false)
	const [timeout, setTimeout] = useState(30000) // 默认30秒

	// 使用自定义hooks
	const {
		message,
		mcpServerUrl,
		toolCalls,
		feedbackInputs,
		attachments,
		handleSubmitFeedback,
		handleFeedbackChange,
		handleFileUpload,
		removeAttachment
	} = useToolCalls()

	// 获取初始timeout配置
	useEffect(() => {
		vscode.postMessage({ type: "getSettings" })

		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "settings") {
				setTimeout(message.data.timeout || 30000)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const handleUpdateTimeout = (newTimeout: number) => {
		setTimeout(newTimeout)
		// 更新配置
		vscode.postMessage({
			type: "updateTimeout",
			timeout: newTimeout
		})
	}



	return (
		<div style={{
			fontFamily: "var(--vscode-font-family)",
			height: "100vh",
			display: "flex",
			flexDirection: "column",
			backgroundColor: "var(--vscode-editor-background)",
			color: "var(--vscode-sideBar-foreground)"
		}}>
			{/* 顶部标题栏 */}
			<Header
				mcpServerUrl={mcpServerUrl}
				showWorkflow={showWorkflow}
				timeout={timeout}
				onToggleWorkflow={() => setShowWorkflow(!showWorkflow)}
				onUpdateTimeout={handleUpdateTimeout}
			/>

			{/* 主要内容区域 */}
			<div style={{ flex: 1, display: "flex", position: "relative" }}>
				{/* 工具调用列表 */}
				<ToolCallList
					toolCalls={toolCalls}
					feedbackInputs={feedbackInputs}
					attachments={attachments}
					message={message}
					onFeedbackChange={handleFeedbackChange}
					onSubmitFeedback={handleSubmitFeedback}
					onFileUpload={handleFileUpload}
					onRemoveAttachment={removeAttachment}
				/>



				{/* 工作流程侧边栏 */}
				{showWorkflow && (
					<WorkflowPanel onClose={() => setShowWorkflow(false)} />
				)}
			</div>
		</div>
	)
}

export default App
