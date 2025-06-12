import React from "react"
import { FileAttachment } from "../types"
import { formatFileSize } from "../utils/formatters"
import { useFileUpload } from "../hooks/useFileUpload"

interface FeedbackFormProps {
	toolCallId: string
	feedback: string
	attachments: FileAttachment[]
	onFeedbackChange: (value: string) => void
	onSubmit: () => void
	onFileUpload: (files: FileList) => void
	onRemoveAttachment: (index: number) => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
	toolCallId,
	feedback,
	attachments,
	onFeedbackChange,
	onSubmit,
	onFileUpload,
	onRemoveAttachment
}) => {
	const { triggerFileInput, triggerImageInput, setFileInputRef } = useFileUpload()

	const isSubmitDisabled = !feedback?.trim() && attachments.length === 0

	return (
		<div style={{
			alignSelf: "flex-end",
			maxWidth: "80%",
			backgroundColor: "var(--vscode-input-background)",
			border: "1px solid var(--vscode-input-border)",
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
				backgroundColor: "var(--vscode-button-background)",
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: "16px",
				boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
				border: "2px solid var(--vscode-editor-background)"
			}}>
				👤
			</div>

			{/* 反馈输入区域 */}
			<div style={{ marginBottom: "20px" }}>
				<textarea
					value={feedback}
					onChange={(e) => onFeedbackChange(e.target.value)}
					placeholder="请分享您的想法、建议或任何反馈意见..."
					style={{
						width: "100%",
						minHeight: "120px",
						padding: "16px",
						border: "1px solid var(--vscode-input-border)",
						borderRadius: "10px",
						backgroundColor: "var(--vscode-input-background)",
						color: "var(--vscode-input-foreground)",
						fontSize: "14px",
						fontFamily: "var(--vscode-font-family)",
						resize: "vertical",
						outline: "none",
						lineHeight: "1.6",
						transition: "border-color 0.2s ease, box-shadow 0.2s ease"
					}}
					onFocus={(e) => {
						e.target.style.borderColor = "var(--vscode-focusBorder)"
						e.target.style.boxShadow = "0 0 0 2px rgba(0, 122, 255, 0.2)"
					}}
					onBlur={(e) => {
						e.target.style.borderColor = "var(--vscode-input-border)"
						e.target.style.boxShadow = "none"
					}}
				/>
			</div>

			{/* 附件显示 */}
			{attachments.length > 0 && (
				<div style={{ marginBottom: "16px" }}>
					<div style={{ 
						fontSize: "12px", 
						marginBottom: "8px", 
						color: "var(--vscode-descriptionForeground)",
						fontWeight: "500"
					}}>
						附件 ({attachments.length}):
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
						{attachments.map((attachment, index) => (
							<div key={index} style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								padding: "6px 10px",
								backgroundColor: "var(--vscode-badge-background)",
								borderRadius: "6px",
								fontSize: "11px",
								border: "1px solid var(--vscode-badge-background)"
							}}>
								<span style={{ fontSize: "14px" }}>📎</span>
								<span style={{ fontWeight: "500" }}>{attachment.name}</span>
								<span style={{ color: "var(--vscode-descriptionForeground)" }}>
									({formatFileSize(attachment.size)})
								</span>
								<button
									onClick={() => onRemoveAttachment(index)}
									style={{
										background: "none",
										border: "none",
										color: "var(--vscode-errorForeground)",
										cursor: "pointer",
										padding: "2px",
										fontSize: "14px",
										borderRadius: "3px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center"
									}}
									title="移除附件"
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* 底部操作栏 */}
			<div style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center"
			}}>
				{/* 左侧：文件和图片上传按钮 */}
				<div style={{ display: "flex", gap: "8px" }}>
					<button
						onClick={() => triggerFileInput(toolCallId)}
						style={{
							background: "none",
							border: "1px solid var(--vscode-button-border)",
							color: "var(--vscode-icon-foreground)",
							cursor: "pointer",
							padding: "8px",
							borderRadius: "6px",
							fontSize: "14px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "all 0.2s ease"
						}}
						title="上传文件"
					>
						📎
					</button>
					<button
						onClick={() => triggerImageInput(toolCallId)}
						style={{
							background: "none",
							border: "1px solid var(--vscode-button-border)",
							color: "var(--vscode-icon-foreground)",
							cursor: "pointer",
							padding: "8px",
							borderRadius: "6px",
							fontSize: "14px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "all 0.2s ease"
						}}
						title="上传图片"
					>
						📷
					</button>
				</div>

				{/* 右侧：提交按钮 */}
				<button
					onClick={onSubmit}
					disabled={isSubmitDisabled}
					style={{
						padding: "12px 24px",
						backgroundColor: isSubmitDisabled
							? "var(--vscode-button-secondaryBackground)"
							: "var(--vscode-button-background)",
						color: isSubmitDisabled
							? "var(--vscode-button-secondaryForeground)"
							: "var(--vscode-button-foreground)",
						border: "none",
						borderRadius: "10px",
						cursor: isSubmitDisabled ? "not-allowed" : "pointer",
						fontSize: "14px",
						fontWeight: "600",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						transition: "all 0.2s ease",
						boxShadow: isSubmitDisabled ? "none" : "0 2px 8px rgba(0,0,0,0.1)"
					}}
					onMouseEnter={(e) => {
						if (!isSubmitDisabled) {
							const target = e.target as HTMLButtonElement
							target.style.transform = "translateY(-1px)"
							target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)"
						}
					}}
					onMouseLeave={(e) => {
						if (!isSubmitDisabled) {
							const target = e.target as HTMLButtonElement
							target.style.transform = "translateY(0)"
							target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
						}
					}}
				>
					<span style={{ fontSize: "18px" }}>↗</span>
					提交反馈
				</button>
			</div>

			{/* 隐藏的文件输入 */}
			<input
				ref={(el) => setFileInputRef(toolCallId, el)}
				type="file"
				multiple
				style={{ display: "none" }}
				onChange={(e) => {
					if (e.target.files) {
						onFileUpload(e.target.files)
						e.target.value = '' // 重置输入
					}
				}}
			/>
			<input
				ref={(el) => setFileInputRef(toolCallId + '_image', el)}
				type="file"
				accept="image/*"
				multiple
				style={{ display: "none" }}
				onChange={(e) => {
					if (e.target.files) {
						onFileUpload(e.target.files)
						e.target.value = '' // 重置输入
					}
				}}
			/>
		</div>
	)
}

export default FeedbackForm
