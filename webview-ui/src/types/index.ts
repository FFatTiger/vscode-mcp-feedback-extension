export interface ToolCall {
	id: string
	toolName: string
	arguments: any
	timestamp: string
	status: 'pending' | 'completed' | 'error'
	result?: any
	userFeedback?: string
}

export interface FileAttachment {
	name: string
	type: string
	size: number
	data: string // base64 encoded
}

export interface Settings {
	enabledTools: { [toolName: string]: boolean }
	timeout: number
	port: number
	autoRestart: boolean
}

export interface AppState {
	message: string
	mcpServerUrl: string
	toolCalls: ToolCall[]
	feedbackInputs: { [key: string]: string }
	attachments: { [key: string]: FileAttachment[] }
	showWorkflow: boolean
	showSettings: boolean
	settings: Settings
}

export type MessageType = 
	| 'getConfig'
	| 'getToolCalls'
	| 'getSettings'
	| 'updateSettings'
	| 'restartServer'
	| 'submitFeedback'
	| 'config'
	| 'toolCalls'
	| 'tool-call'
	| 'tool-call-updated'
	| 'feedbackSubmitted'
	| 'settings'
	| 'settingsUpdated'
	| 'serverRestarted'

export interface VSCodeMessage {
	type: MessageType
	data?: any
	[key: string]: any
}
