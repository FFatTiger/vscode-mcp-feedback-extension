import React from "react"

interface WorkflowPanelProps {
	onClose: () => void
}

const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ onClose }) => {
	const workflowSteps = [
		{
			title: "AI助手调用MCP工具",
			description: "外部AI助手通过MCP协议调用工具",
			icon: "🤖",
			color: "var(--vscode-textCodeBlock-background)"
		},
		{
			title: "显示调用信息",
			description: "工具调用信息显示在聊天界面",
			icon: "📋",
			color: "var(--vscode-textCodeBlock-background)"
		},
		{
			title: "等待用户反馈",
			description: "用户在输入框中提供反馈，可附加文件和图片",
			icon: "⏳",
			color: "var(--vscode-inputValidation-warningBackground)"
		},
		{
			title: "返回结果",
			description: "用户反馈作为工具调用结果返回给AI助手",
			icon: "✅",
			color: "var(--vscode-testing-iconPassed)"
		}
	]

	return (
		<div style={{
			position: "absolute",
			top: 0,
			right: 0,
			width: "320px",
			height: "100%",
			backgroundColor: "var(--vscode-editor-background)",
			border: "1px solid var(--vscode-panel-border)",
			borderRadius: "8px 0 0 8px",
			padding: "20px",
			overflowY: "auto",
			boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
			zIndex: 10
		}}>
			<div style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: "24px"
			}}>
				<h3 style={{ 
					margin: "0", 
					fontSize: "16px", 
					fontWeight: "600",
					color: "var(--vscode-editor-foreground)",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				}}>
					<span style={{ fontSize: "18px" }}>📊</span>
					工作流程
				</h3>
				<button
					onClick={onClose}
					style={{
						background: "none",
						border: "1px solid var(--vscode-button-border)",
						color: "var(--vscode-icon-foreground)",
						cursor: "pointer",
						padding: "6px 8px",
						borderRadius: "6px",
						fontSize: "12px",
						fontWeight: "500"
					}}
					title="关闭工作流程面板"
				>
					关闭
				</button>
			</div>

			<div style={{ fontSize: "13px", lineHeight: "1.6" }}>
				{workflowSteps.map((step, index) => (
					<div key={index}>
						<div style={{
							padding: "16px",
							backgroundColor: step.color,
							borderRadius: "8px",
							marginBottom: "12px",
							border: "1px solid var(--vscode-panel-border)",
							position: "relative"
						}}>
							<div style={{ 
								display: "flex",
								alignItems: "flex-start",
								gap: "12px"
							}}>
								<div style={{
									fontSize: "20px",
									flexShrink: 0,
									marginTop: "2px"
								}}>
									{step.icon}
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ 
										fontWeight: "600", 
										marginBottom: "6px",
										fontSize: "14px",
										color: step.color === "var(--vscode-testing-iconPassed)" 
											? "white" 
											: "var(--vscode-editor-foreground)"
									}}>
										{index + 1}. {step.title}
									</div>
									<div style={{ 
										color: step.color === "var(--vscode-testing-iconPassed)" 
											? "rgba(255,255,255,0.9)" 
											: "var(--vscode-descriptionForeground)",
										lineHeight: "1.4"
									}}>
										{step.description}
									</div>
								</div>
							</div>
						</div>

						{/* 连接箭头 */}
						{index < workflowSteps.length - 1 && (
							<div style={{ 
								textAlign: "center", 
								margin: "8px 0",
								color: "var(--vscode-descriptionForeground)",
								fontSize: "16px"
							}}>
								↓
							</div>
						)}
					</div>
				))}
			</div>

			{/* 底部提示 */}
			<div style={{
				marginTop: "24px",
				padding: "12px",
				backgroundColor: "var(--vscode-textCodeBlock-background)",
				borderRadius: "6px",
				border: "1px solid var(--vscode-panel-border)",
				fontSize: "12px",
				color: "var(--vscode-descriptionForeground)",
				lineHeight: "1.4"
			}}>
				<div style={{ fontWeight: "500", marginBottom: "4px" }}>💡 提示</div>
				<div>
					您可以在设置中配置工具开关、超时时间和端口等参数，以优化MCP服务器的行为。
				</div>
			</div>
		</div>
	)
}

export default WorkflowPanel
