import React from "react"

interface EmptyStateProps {
	message?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
	return (
		<div style={{ 
			textAlign: "center", 
			color: "var(--vscode-descriptionForeground)",
			padding: "80px 20px",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			height: "100%"
		}}>
			<div style={{ 
				fontSize: "64px", 
				marginBottom: "24px",
				opacity: 0.6,
				filter: "grayscale(0.3)"
			}}>
				🤖
			</div>
			<h3 style={{ 
				margin: "0 0 12px 0", 
				fontSize: "16px",
				fontWeight: "500",
				color: "var(--vscode-editor-foreground)"
			}}>
				等待AI助手调用MCP工具...
			</h3>
			<p style={{ 
				fontSize: "13px", 
				margin: "0 0 8px 0", 
				opacity: 0.8,
				lineHeight: "1.5",
				maxWidth: "300px"
			}}>
				当外部AI助手调用MCP工具时，调用信息将在这里显示
			</p>
			{message && (
				<div style={{ 
					marginTop: "16px",
					padding: "8px 12px",
					backgroundColor: "var(--vscode-inputValidation-infoBackground)",
					border: "1px solid var(--vscode-inputValidation-infoBorder)",
					borderRadius: "6px",
					fontSize: "12px",
					color: "var(--vscode-inputValidation-infoForeground)",
					maxWidth: "400px"
				}}>
					{message}
				</div>
			)}
		</div>
	)
}

export default EmptyState
