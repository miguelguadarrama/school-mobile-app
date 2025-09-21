import React, { createContext, useContext, useState } from "react"
import { chats } from "../types/chat"

interface ChatContextType {
	isChatWindowOpen: boolean
	setIsChatWindowOpen: (open: boolean) => void
	selectedChat: chats | null
	setSelectedChat: (chat: chats | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isChatWindowOpen, setIsChatWindowOpen] = useState(false)
	const [selectedChat, setSelectedChat] = useState<chats | null>(null)

	return (
		<ChatContext.Provider
			value={{
				isChatWindowOpen,
				setIsChatWindowOpen,
				selectedChat,
				setSelectedChat,
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