import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react"
import useSWR from "swr"
import { uploadFileToSas } from "../helpers/fileCompression"
import { fetcher } from "../services/api"
import { AttachmentData, chat_message, chats } from "../types/chat"

interface ChatContextType {
	// UI State
	isChatWindowOpen: boolean
	setIsChatWindowOpen: (open: boolean) => void
	selectedChat: chats | null
	setSelectedChat: (chat: chats | null) => void

	// Chat Data
	chats: chats[] | undefined
	isLoading: boolean
	refreshChats: () => void

	// Message Operations
	sendMessage: (
		staffId: string,
		content: string,
		attachment?: AttachmentData
	) => Promise<void>

	// Optimistic Updates
	addOptimisticMessage: (
		staffId: string,
		studentId: string,
		message: chat_message
	) => void
	removeOptimisticMessage: (
		staffId: string,
		studentId: string,
		messageId: string
	) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{
	children: React.ReactNode
	selectedStudentId?: string
}> = ({ children, selectedStudentId }) => {
	// UI State
	const [isChatWindowOpen, setIsChatWindowOpen] = useState(false)
	const [selectedChat, setSelectedChat] = useState<chats | null>(null)

	// Optimistic messages state
	const [optimisticMessages, setOptimisticMessages] = useState<{
		[key: string]: chat_message[]
	}>({})

	// SWR for chat data
	const {
		data: rawChats,
		isLoading,
		mutate: refreshChats,
	} = useSWR<chats[]>(
		selectedStudentId ? `/mobile/chat/${selectedStudentId}` : null,
		{
			refreshInterval: 15000,
			dedupingInterval: 10000,
			revalidateOnFocus: true,
		}
	)

	// Merge real data with optimistic messages
	const chats = rawChats
		? rawChats.map((chat: chats) => {
				const chatKey = `${chat.staff_id}-${chat.student_id}`
				const optimistic = optimisticMessages[chatKey] || []

				// Filter out optimistic messages that might have been confirmed by server
				const filteredOptimistic = optimistic
					.filter(
						(optMsg) =>
							!chat.messages.some(
								(realMsg) =>
									realMsg.content === optMsg.content &&
									realMsg.sender_alias === optMsg.sender_alias &&
									Math.abs(
										new Date(realMsg.created_at).getTime() -
											new Date(optMsg.created_at).getTime()
									) < 5000
							)
					)
					.map((msg) => ({ ...msg, isOptimistic: true }))

				return {
					...chat,
					messages: [...chat.messages, ...filteredOptimistic],
				}
		  })
		: rawChats

	// Optimistic message operations
	const addOptimisticMessage = useCallback(
		(staffId: string, studentId: string, message: chat_message) => {
			const chatKey = `${staffId}-${studentId}`
			setOptimisticMessages((prev) => ({
				...prev,
				[chatKey]: [...(prev[chatKey] || []), message],
			}))
		},
		[]
	)

	const removeOptimisticMessage = useCallback(
		(staffId: string, studentId: string, messageId: string) => {
			const chatKey = `${staffId}-${studentId}`
			setOptimisticMessages((prev) => ({
				...prev,
				[chatKey]: (prev[chatKey] || []).filter((msg) => msg.id !== messageId),
			}))
		},
		[]
	)

	// Send message operation
	const sendMessage = useCallback(
		async (staffId: string, content: string, attachment?: AttachmentData) => {
			if (!selectedStudentId) return

			// Create optimistic message
			const optimisticMessage: chat_message = {
				id: `temp-${Date.now()}-${Math.random()}`,
				sender_alias: "guardian",
				// For attachments, use fallback message for backwards compatibility
				// For text, use provided content
				content: attachment
					? "📎 Archivo adjunto. Actualiza la app para verlo."
					: content,
				// Only set message_type if attachment exists (backwards compatibility)
				...(attachment && {
					message_type: "attachment" as const,
					attachment_url: attachment.localUri,
					attachment_type: attachment.type,
					attachment_mime_type: attachment.mimeType,
					attachment_file_name: attachment.fileName,
					attachment_file_size: attachment.fileSize,
				}),
				created_at: new Date().toISOString(),
			}

			// Add optimistic message immediately
			addOptimisticMessage(staffId, selectedStudentId, optimisticMessage)

			try {
				let attachmentBlobUrl: string | undefined

				// If there's an attachment, upload it first
				if (attachment) {
					// Step 1: Request SAS URL
					const sasResponse = await fetcher(
						`/mobile/chat/${selectedStudentId}/sas`,
						{
							method: "POST",
							body: JSON.stringify({
								staff_id: staffId,
								attachment_type: attachment.type,
								attachment_file_name: attachment.fileName,
								attachment_mime_type: attachment.mimeType,
								attachment_file_size: attachment.fileSize,
							}),
						}
					)

					const { sasUrl, blobPath } = sasResponse as {
						sasUrl: string
						blobPath: string
					}

					if (!sasUrl || !blobPath) {
						console.error("Invalid SAS response:", sasResponse)
						throw new Error(
							`Missing SAS URL or blob URL in response. Got: ${JSON.stringify(
								sasResponse
							)}`
						)
					}

					// Step 2: Upload file to blob storage
					const uploadSuccess = await uploadFileToSas(
						attachment.localUri,
						sasUrl
					)

					//console.log({ uploadSuccess, sasUrl, blobPath })

					if (!uploadSuccess) {
						throw new Error("Failed to upload attachment to blob storage")
					}

					const fullBlobUrl = sasUrl.split("chat/")[0] + blobPath

					console.log("Upload successful, setting blobUrl:", fullBlobUrl)
					attachmentBlobUrl = fullBlobUrl
				}

				// Step 3: Send message to server
				const messagePayload: any = {
					student_id: selectedStudentId,
					staff_id: staffId,
					// Use fallback message for attachments (backwards compatibility)
					content: attachment
						? "📎 Archivo adjunto. Actualiza la app para verlo."
						: content,
				}

				console.log("Attachment Blob URL:", attachmentBlobUrl)
				if (attachment && attachmentBlobUrl) {
					messagePayload.message_type = "attachment"
					messagePayload.attachment_url = attachmentBlobUrl
					messagePayload.attachment_type = attachment.type
					messagePayload.attachment_mime_type = attachment.mimeType
					messagePayload.attachment_file_name = attachment.fileName
					messagePayload.attachment_file_size = attachment.fileSize
				}

				const res = await fetcher(`/mobile/chat/${selectedStudentId}`, {
					method: "POST",
					body: JSON.stringify(messagePayload),
				})

				// Refresh to get real data - SWR will merge the real data seamlessly
				refreshChats()
			} catch (error) {
				// Remove optimistic message on error
				removeOptimisticMessage(
					staffId,
					selectedStudentId,
					optimisticMessage.id
				)
				console.error("Failed to send message:", error)
				throw error
			}
		},
		[
			selectedStudentId,
			addOptimisticMessage,
			removeOptimisticMessage,
			refreshChats,
		]
	)

	// Clean up optimistic messages when selected student changes
	useEffect(() => {
		setOptimisticMessages({})
	}, [selectedStudentId])

	return (
		<ChatContext.Provider
			value={{
				// UI State
				isChatWindowOpen,
				setIsChatWindowOpen,
				selectedChat,
				setSelectedChat,

				// Chat Data
				chats,
				isLoading,
				refreshChats,

				// Message Operations
				sendMessage,

				// Optimistic Updates
				addOptimisticMessage,
				removeOptimisticMessage,
			}}
		>
			{children}
		</ChatContext.Provider>
	)
}

export const useChatContext = () => {
	const context = useContext(ChatContext)
	if (context === undefined) {
		throw new Error("useChatContext must be used within a ChatProvider")
	}
	return context
}
