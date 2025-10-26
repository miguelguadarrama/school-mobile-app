import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react"
import useSWR from "swr"
import { fetcher } from "../services/api"
import { chat_message, chats } from "../types/chat"

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
	sendMessage: (staffId: string, content: string) => Promise<void>

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
		async (staffId: string, content: string) => {
			if (!selectedStudentId) return

			// Create optimistic message
			const optimisticMessage: chat_message = {
				id: `temp-${Date.now()}-${Math.random()}`,
				sender_alias: "guardian",
				content,
				created_at: new Date().toISOString(),
			}

			// Add optimistic message immediately
			addOptimisticMessage(staffId, selectedStudentId, optimisticMessage)

			try {
				// Send message to server
				const res = await fetcher(`/mobile/chat/${selectedStudentId}`, {
					method: "POST",
					body: JSON.stringify({ content, staff_id: staffId }),
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
