import { useRef } from "react"

export const useFileUpload = () => {
	const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({})

	const triggerFileInput = (toolCallId: string) => {
		const input = fileInputRefs.current[toolCallId]
		if (input) {
			input.click()
		}
	}

	const triggerImageInput = (toolCallId: string) => {
		const input = fileInputRefs.current[toolCallId + '_image']
		if (input) {
			input.click()
		}
	}

	const setFileInputRef = (key: string, ref: HTMLInputElement | null) => {
		fileInputRefs.current[key] = ref
	}

	return {
		fileInputRefs,
		triggerFileInput,
		triggerImageInput,
		setFileInputRef
	}
}
