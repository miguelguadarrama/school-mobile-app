import React, { createContext, useCallback, useContext, useState } from "react"
import useSWR from "swr"
import { fetcher } from "../services/api"
import { chat_message, chats } from "../types/chat"
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
	sendMessage: (studentId: string, content: string) => Promise<void>

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
		async (studentId: string, content: string) => {
			// Create optimistic message
			const optimisticMessage: chat_message = {
				id: `temp-${Date.now()}-${Math.random()}`,
				sender_alias: "staff",
				content,
				created_at: new Date().toISOString(),
			}

			// For teachers, we use the staff_id from the chat
			const currentStaffId = selectedChat?.staff_id
			if (!currentStaffId) return

			// Add optimistic message immediately
			addOptimisticMessage(currentStaffId, studentId, optimisticMessage)

			try {
				// Send message to server - teacher endpoint
				await fetcher(`/mobile/chat/teacher`, {
					method: "POST",
					body: JSON.stringify({ student_id: studentId, content }),
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
