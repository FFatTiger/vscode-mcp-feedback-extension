import React, { useState } from "react"

interface HeaderProps {
	mcpServerUrl: string
	showWorkflow: boolean
	timeout: number
	onToggleWorkflow: () => void
	onUpdateTimeout: (timeout: number) => void
}

const Header: React.FC<HeaderProps> = ({
	mcpServerUrl,
	showWorkflow,
	timeout,
	onToggleWorkflow,
	onUpdateTimeout
}) => {
	const [tempTimeout, setTempTimeout] = useState((timeout / 1000).toString())

	const handleTimeoutChange = (value: string) => {
		setTempTimeout(value)
		const numValue = parseInt(value)
		if (!isNaN(numValue) && numValue > 0 && numValue <= 300) {
			onUpdateTimeout(numValue * 1000) // 转换为毫秒
		}
	}
	return (
		<div style={{ 
			padding: "12px 16px",
			borderBottom: "1px solid var(--vscode-panel-border)",
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			backgroundColor: "var(--vscode-titleBar-activeBackground)",
			boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
		}}>
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{
						fontSize: "16px",
						fontWeight: "600",
						color: "var(--vscode-titleBar-activeForeground)"
					}}>
						🤖 MCP反馈服务器
					</span>
					{mcpServerUrl && (
						<span style={{
							fontSize: "10px",
							color: "var(--vscode-badge-foreground)",
							backgroundColor: "var(--vscode-testing-iconPassed)",
							padding: "3px 8px",
							borderRadius: "12px",
							fontWeight: "500",
							textTransform: "uppercase",
							letterSpacing: "0.5px"
						}}>
							运行中
						</span>
					)}
				</div>

				{/* Timeout 设置 */}
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{
						fontSize: "12px",
						color: "var(--vscode-titleBar-activeForeground)",
						fontWeight: "500"
					}}>
						⏱️ 超时:
					</span>
					<input
						type="number"
						value={tempTimeout}
						onChange={(e) => handleTimeoutChange(e.target.value)}
						min="1"
						max="300"
						style={{
							width: "50px",
							padding: "2px 6px",
							fontSize: "11px",
							border: "1px solid var(--vscode-input-border)",
							borderRadius: "4px",
							backgroundColor: "var(--vscode-input-background)",
							color: "var(--vscode-input-foreground)",
							outline: "none"
						}}
						title="超时时间（秒）"
					/>
					<span style={{
						fontSize: "11px",
						color: "var(--vscode-titleBar-activeForeground)"
					}}>
						秒
					</span>
				</div>
			</div>
			
			<div style={{ display: "flex", gap: "4px" }}>
				<button
					onClick={onToggleWorkflow}
					style={{
						background: showWorkflow ? "var(--vscode-button-background)" : "none",
						border: "1px solid var(--vscode-button-border)",
						color: showWorkflow ? "var(--vscode-button-foreground)" : "var(--vscode-icon-foreground)",
						cursor: "pointer",
						padding: "6px 8px",
						borderRadius: "6px",
						fontSize: "12px",
						fontWeight: "500",
						display: "flex",
						alignItems: "center",
						gap: "4px",
						transition: "all 0.2s ease"
					}}
					title="显示/隐藏工作流程"
				>
					<span style={{ fontSize: "14px" }}>📊</span>
					<span>流程</span>
				</button>
			</div>
		</div>
	)
}

export default Header
