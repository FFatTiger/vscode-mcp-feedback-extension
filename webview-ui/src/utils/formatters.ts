export const formatTimestamp = (timestamp: string): string => {
	return new Date(timestamp).toLocaleTimeString()
}

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + '...'
}
