import React, { useEffect, useRef } from "react"
import { ToolCall, FileAttachment } from "../types"
import ToolCallItem from "./ToolCallItem"
import EmptyState from "./EmptyState"

interface ToolCallListProps {
	toolCalls: ToolCall[]
	feedbackInputs: { [key: string]: string }
	attachments: { [key: string]: FileAttachment[] }
	message?: string
	onFeedbackChange: (toolCallId: string, value: string) => void
	onSubmitFeedback: (toolCallId: string) => void
	onFileUpload: (toolCallId: string, files: FileList) => void
	onRemoveAttachment: (toolCallId: string, index: number) => void
}

const ToolCallList: React.FC<ToolCallListProps> = ({
	toolCalls,
	feedbackInputs,
	attachments,
	message,
	onFeedbackChange,
	onSubmitFeedback,
	onFileUpload,
	onRemoveAttachment
}) => {
	const scrollRef = useRef<HTMLDivElement>(null)

	// 自动滚动到底部当有新消息时
	useEffect(() => {
		if (scrollRef.current && toolCalls.length > 0) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [toolCalls.length])

	if (toolCalls.length === 0) {
		return <EmptyState message={message} />
	}

	return (
		<div
			ref={scrollRef}
			style={{
				flex: 1,
				padding: "16px 20px",
				overflowY: "auto",
				backgroundColor: "var(--vscode-editor-background)"
			}}>
			{/* 状态信息 */}
			{message && (
				<div style={{
					padding: "16px 20px",
					marginBottom: "24px",
					backgroundColor: "var(--vscode-inputValidation-infoBackground)",
					border: "1px solid var(--vscode-inputValidation-infoBorder)",
					borderRadius: "12px",
					fontSize: "14px",
					color: "var(--vscode-inputValidation-infoForeground)",
					display: "flex",
					alignItems: "center",
					gap: "12px",
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
				}}>
					<span style={{ fontSize: "18px" }}>ℹ️</span>
					{message}
				</div>
			)}

			<div style={{
				display: "flex",
				flexDirection: "column",
				gap: "20px"
			}}>
				{toolCalls.map((call) => (
					<ToolCallItem
						key={call.id}
						call={call}
						feedback={feedbackInputs[call.id] || ""}
						attachments={attachments[call.id] || []}
						onFeedbackChange={(value) => onFeedbackChange(call.id, value)}
						onSubmitFeedback={() => onSubmitFeedback(call.id)}
						onFileUpload={(files) => onFileUpload(call.id, files)}
						onRemoveAttachment={(index) => onRemoveAttachment(call.id, index)}
					/>
				))}
			</div>
		</div>
	)
}

export default ToolCallList
