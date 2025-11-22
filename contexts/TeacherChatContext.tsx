import React, { createContext, useCallback, useContext, useState } from "react"
import useSWR from "swr"
import { uploadFileToSas } from "../helpers/fileCompression"
import { fetcher } from "../services/api"
import { AttachmentData, chat_message, chats } from "../types/chat"
import AppContext from "./AppContext"

interface TeacherChatContextType {
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
		studentId: string,
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

const TeacherChatContext = createContext<TeacherChatContextType | undefined>(
	undefined
)

export const TeacherChatProvider: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	// UI State
	const [isChatWindowOpen, setIsChatWindowOpen] = useState(false)
	const [selectedChat, setSelectedChat] = useState<chats | null>(null)
	const { selectedRole } = useContext(AppContext)!
	// Optimistic messages state
	const [optimisticMessages, setOptimisticMessages] = useState<{
		[key: string]: chat_message[]
	}>({})

	// SWR for teacher chat data
	const {
		data: rawChats,
		isLoading,
		mutate: refreshChats,
	} = useSWR<chats[]>(
		selectedRole === "admin" ? "/mobile/chat/admin" : "/mobile/chat/teacher",
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

	// Send message operation for teachers
	const sendMessage = useCallback(
		async (studentId: string, content: string, attachment?: AttachmentData) => {
			// Create optimistic message
			const optimisticMessage: chat_message = {
				id: `temp-${Date.now()}-${Math.random()}`,
				sender_alias: "staff",
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

			// For teachers, we use the staff_id from the chat
			const currentStaffId = selectedChat?.staff_id
			if (!currentStaffId) return

			// Add optimistic message immediately
			addOptimisticMessage(currentStaffId, studentId, optimisticMessage)

			try {
				let attachmentBlobUrl: string | undefined

				// If there's an attachment, upload it first
				if (attachment) {
					// Step 1: Request SAS URL
					const sasResponse = await fetcher(`/mobile/chat/teacher/sas`, {
						method: "POST",
						body: JSON.stringify({
							student_id: studentId,
							attachment_type: attachment.type,
							attachment_file_name: attachment.fileName,
							attachment_mime_type: attachment.mimeType,
							attachment_file_size: attachment.fileSize,
						}),
					})

					console.log("SAS Response (Teacher):", sasResponse)

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

					console.log("SAS URL:", sasUrl)
					console.log("Blob URL:", blobPath)

					// Step 2: Upload file to blob storage
					const uploadSuccess = await uploadFileToSas(
						attachment.localUri,
						sasUrl
					)

					if (!uploadSuccess) {
						throw new Error("Failed to upload attachment to blob storage")
					}

					console.log("Upload successful, setting blobUrl:", blobPath)
					attachmentBlobUrl = blobPath
				}

				// Step 3: Send message to server - teacher endpoint
				const messagePayload: any = {
					student_id: studentId,
					// Use fallback message for attachments (backwards compatibility)
					content: attachment
						? "📎 Archivo adjunto. Actualiza la app para verlo."
						: content,
				}

				if (attachment && attachmentBlobUrl) {
					messagePayload.message_type = "attachment"
					messagePayload.attachment_url = attachmentBlobUrl
					messagePayload.attachment_type = attachment.type
					messagePayload.attachment_mime_type = attachment.mimeType
					messagePayload.attachment_file_name = attachment.fileName
					messagePayload.attachment_file_size = attachment.fileSize
				}

				await fetcher(`/mobile/chat/teacher`, {
					method: "POST",
					body: JSON.stringify(messagePayload),
				})

				// Refresh to get real data
				refreshChats()
			} catch (error) {
				// Remove optimistic message on error
				removeOptimisticMessage(currentStaffId, studentId, optimisticMessage.id)
				console.error("Failed to send message:", error)
				throw error
			}
		},
		[selectedChat, addOptimisticMessage, removeOptimisticMessage, refreshChats]
	)

	return (
		<TeacherChatContext.Provider
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
		</TeacherChatContext.Provider>
	)
}

export const useTeacherChatContext = () => {
	const context = useContext(TeacherChatContext)
	if (context === undefined) {
		throw new Error(
			"useTeacherChatContext must be used within a TeacherChatProvider"
		)
	}
	return context
}
