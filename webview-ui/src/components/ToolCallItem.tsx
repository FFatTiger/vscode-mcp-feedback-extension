import React from "react"
import { ToolCall, FileAttachment } from "../types"
import { formatTimestamp } from "../utils/formatters"
import FeedbackForm from "./FeedbackForm"

interface ToolCallItemProps {
	call: ToolCall
	feedback: string
	attachments: FileAttachment[]
	onFeedbackChange: (value: string) => void
	onSubmitFeedback: () => void
	onFileUpload: (files: FileList) => void
	onRemoveAttachment: (index: number) => void
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({
	call,
	feedback,
	attachments,
	onFeedbackChange,
	onSubmitFeedback,
	onFileUpload,
	onRemoveAttachment
}) => {
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			gap: "16px"
		}}>
			{/* AI助手消息气泡 */}
			<div style={{
				alignSelf: "flex-start",
				maxWidth: "80%",
				backgroundColor: "var(--vscode-sideBar-background)",
				border: "1px solid var(--vscode-panel-border)",
				borderRadius: "18px 18px 18px 6px",
				padding: "20px 24px",
				position: "relative",
				marginLeft: "40px",
				boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
				backdropFilter: "blur(10px)"
			}}>
				{/* AI图标 */}
				<div style={{
					position: "absolute",
					left: "-40px",
					top: "16px",
					width: "32px",
					height: "32px",
					backgroundColor: "var(--vscode-button-background)",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "16px",
					boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
					border: "2px solid var(--vscode-editor-background)"
				}}>
					🤖
				</div>
				
				{/* 工具调用信息 */}
				<div>
					<div style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "12px"
					}}>
						<span style={{
							fontSize: "15px",
							fontWeight: "600",
							color: "var(--vscode-editor-foreground)",
							display: "flex",
							alignItems: "center",
							gap: "8px"
						}}>
							<span style={{
								fontSize: "11px",
								backgroundColor: "var(--vscode-badge-background)",
								color: "var(--vscode-badge-foreground)",
								padding: "4px 8px",
								borderRadius: "6px",
								fontWeight: "600",
								textTransform: "uppercase",
								letterSpacing: "0.5px"
							}}>
								工具调用
							</span>
							{call.toolName}
						</span>
						<span style={{
							fontSize: "12px",
							color: "var(--vscode-descriptionForeground)",
							backgroundColor: "var(--vscode-textCodeBlock-background)",
							padding: "4px 8px",
							borderRadius: "6px",
							fontWeight: "500"
						}}>
							{formatTimestamp(call.timestamp)}
						</span>
					</div>
					
					{/* 参数显示 */}
					<div style={{
						fontSize: "14px",
						color: "var(--vscode-editor-foreground)",
						lineHeight: "1.6"
					}}>
						{call.arguments.message && (
							<div style={{
								marginBottom: "12px",
								padding: "12px 16px",
								backgroundColor: "var(--vscode-textCodeBlock-background)",
								borderRadius: "8px",
								border: "1px solid var(--vscode-panel-border)",
								fontWeight: "500"
							}}>
								{call.arguments.message}
							</div>
						)}
						{call.arguments.context && (
							<div style={{
								fontSize: "13px",
								color: "var(--vscode-descriptionForeground)",
								fontStyle: "italic",
								marginTop: "8px",
								padding: "8px 12px",
								backgroundColor: "var(--vscode-input-background)",
								borderRadius: "6px",
								borderLeft: "3px solid var(--vscode-descriptionForeground)"
							}}>
								上下文: {call.arguments.context}
							</div>
						)}
						{call.arguments.action && (
							<div style={{
								marginBottom: "12px",
								padding: "12px 16px",
								backgroundColor: "var(--vscode-inputValidation-warningBackground)",
								borderRadius: "8px",
								border: "1px solid var(--vscode-inputValidation-warningBorder)"
							}}>
								<strong style={{ color: "var(--vscode-inputValidation-warningForeground)" }}>
									需要确认的操作:
								</strong> {call.arguments.action}
								{call.arguments.details && (
									<div style={{
										marginTop: "8px",
										fontSize: "13px",
										opacity: 0.9,
										lineHeight: "1.5"
									}}>
										{call.arguments.details}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 用户反馈区域 */}
			{call.status === 'pending' && (
				<FeedbackForm
					toolCallId={call.id}
					feedback={feedback}
					attachments={attachments}
					onFeedbackChange={onFeedbackChange}
					onSubmit={onSubmitFeedback}
					onFileUpload={onFileUpload}
					onRemoveAttachment={onRemoveAttachment}
				/>
			)}

			{/* 已完成的反馈显示 */}
			{call.status === 'completed' && call.userFeedback && (
				<div style={{
					alignSelf: "flex-end",
					maxWidth: "80%",
					backgroundColor: "var(--vscode-testing-iconPassed)",
					color: "white",
					borderRadius: "18px 18px 6px 18px",
					padding: "20px 24px",
					position: "relative",
					marginRight: "40px",
					boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
					backdropFilter: "blur(10px)"
				}}>
					{/* 用户图标 */}
					<div style={{
						position: "absolute",
						right: "-40px",
						top: "16px",
						width: "32px",
						height: "32px",
						backgroundColor: "var(--vscode-testing-iconPassed)",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "16px",
						boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
						border: "2px solid var(--vscode-editor-background)"
					}}>
						✅
					</div>

					<div style={{
						fontSize: "13px",
						marginBottom: "8px",
						opacity: 0.9,
						fontWeight: "600",
						textTransform: "uppercase",
						letterSpacing: "0.5px"
					}}>
						已提交反馈:
					</div>
					<div style={{
						fontSize: "15px",
						lineHeight: "1.6",
						fontWeight: "500"
					}}>
						{call.userFeedback}
					</div>
				</div>
			)}
		</div>
	)
}

export default ToolCallItem
