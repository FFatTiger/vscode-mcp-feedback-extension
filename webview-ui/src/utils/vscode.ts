/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 */
class VSCodeAPIWrapper {
	private readonly vsCodeApi: any

	constructor() {
		// Check if the acquireVsCodeApi function exists in the current context (i.e. VS Code webview)
		if (typeof acquireVsCodeApi === "function") {
			this.vsCodeApi = acquireVsCodeApi()
		}
	}

	/**
	 * Post a message (i.e. send arbitrary data) to the owner of the webview.
	 */
	public postMessage(message: unknown) {
		if (this.vsCodeApi) {
			this.vsCodeApi.postMessage(message)
		} else {
			console.log("VSCode API not available, message:", message)
		}
	}

	/**
	 * Get the persistent state stored for this webview.
	 */
	public getState(): unknown {
		if (this.vsCodeApi) {
			return this.vsCodeApi.getState()
		} else {
			const state = localStorage.getItem("vscodeState")
			return state ? JSON.parse(state) : undefined
		}
	}

	/**
	 * Set the persistent state stored for this webview.
	 */
	public setState<T extends unknown>(newState: T): T {
		if (this.vsCodeApi) {
			return this.vsCodeApi.setState(newState)
		} else {
			localStorage.setItem("vscodeState", JSON.stringify(newState))
			return newState
		}
	}
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper()
