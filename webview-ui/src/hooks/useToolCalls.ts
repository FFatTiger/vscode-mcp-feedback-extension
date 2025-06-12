import { useEffect, useState } from "react"
import { vscode } from "../utils/vscode"
import { ToolCall, FileAttachment } from "../types"

export const useToolCalls = () => {
	const [message, setMessage] = useState("Loading...")
	const [mcpServerUrl, setMcpServerUrl] = useState("")
	const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
	const [feedbackInputs, setFeedbackInputs] = useState<{[key: string]: string}>({})
	const [attachments, setAttachments] = useState<{[key: string]: FileAttachment[]}>({})

	useEffect(() => {
		// Request configuration from extension
		vscode.postMessage({ type: "getConfig" })
		vscode.postMessage({ type: "getToolCalls" })

		// Listen for messages from the extension
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			switch (message.type) {
				case "config":
					setMessage(message.message)
					setMcpServerUrl(message.mcpServerUrl || "")
					break
				case "toolCalls":
					setToolCalls(message.data || [])
					break
				case "tool-call":
					setToolCalls(prev => [...prev, message.data])
					break
				case "tool-call-updated":
					setToolCalls(prev => prev.map(call => 
						call.id === message.data.id ? message.data : call
					))
					break
				case "feedbackSubmitted":
					if (message.success) {
						setFeedbackInputs(prev => ({
							...prev,
							[message.toolCallId]: ""
						}))
						setAttachments(prev => ({
							...prev,
							[message.toolCallId]: []
						}))
					}
					break
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const handleSubmitFeedback = (toolCallId: string) => {
		const feedback = feedbackInputs[toolCallId]
		const toolAttachments = attachments[toolCallId] || []
		
		if (feedback?.trim() || toolAttachments.length > 0) {
			vscode.postMessage({
				type: "submitFeedback",
				toolCallId,
				feedback: feedback?.trim() || "",
				attachments: toolAttachments
			})
		}
	}

	const handleFeedbackChange = (toolCallId: string, value: string) => {
		setFeedbackInputs(prev => ({
			...prev,
			[toolCallId]: value
		}))
	}

	const handleFileUpload = (toolCallId: string, files: FileList) => {
		const filePromises = Array.from(files).map(file => {
			return new Promise<FileAttachment>((resolve) => {
				const reader = new FileReader()
				reader.onload = () => {
					resolve({
						name: file.name,
						type: file.type,
						size: file.size,
						data: reader.result as string
					})
				}
				reader.readAsDataURL(file)
			})
		})

		Promise.all(filePromises).then(newAttachments => {
			setAttachments(prev => ({
				...prev,
				[toolCallId]: [...(prev[toolCallId] || []), ...newAttachments]
			}))
		})
	}

	const removeAttachment = (toolCallId: string, index: number) => {
		setAttachments(prev => ({
			...prev,
			[toolCallId]: (prev[toolCallId] || []).filter((_, i) => i !== index)
		}))
	}

	return {
		message,
		mcpServerUrl,
		toolCalls,
		feedbackInputs,
		attachments,
		handleSubmitFeedback,
		handleFeedbackChange,
		handleFileUpload,
		removeAttachment
	}
}
