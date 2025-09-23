import React, { useContext, useEffect, useState } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LoadingScreen from "../components/Loading"
import {
	ChatWindow,
	ChatroomItem,
	SectionHeader,
} from "../components/messaging"
import AppContext from "../contexts/AppContext"
import { useChatContext } from "../contexts/ChatContext"
import { theme } from "../helpers/theme"
import { fetcher } from "../services/api"
import { chat_message, chats } from "../types/chat"

type SectionItem = {
	type: "section"
	title: string
}

type ChatItem = {
	type: "chat"
	data: chats
}

type ListItem = SectionItem | ChatItem

export default function MessagingScreen() {
	const {
		chats,
		chatLoading,
		selectedStudent,
		refreshChat,
		addOptimisticMessage,
		removeOptimisticMessage,
	} = useContext(AppContext)!
	const { setIsChatWindowOpen } = useChatContext()
	const [selectedChat, setSelectedChat] = useState<chats | null>(null)

	const handleSendMessage = async (content: string) => {
		if (!selectedStudent?.id || !selectedChat) return

		// Create optimistic message
		const optimisticMessage: chat_message = {
			id: `temp-${Date.now()}-${Math.random()}`,
			sender_alias: "guardian",
			content,
			created_at: new Date().toISOString(),
		}

		// Add optimistic message immediately
		addOptimisticMessage(
			selectedChat.staff.id,
			selectedStudent.id,
			optimisticMessage
		)

		try {
			// Send message to server
			const res = await fetcher(`/mobile/chat/${selectedStudent.id}`, {
				method: "POST",
				body: JSON.stringify({ content, staff_id: selectedChat.staff.id }),
			})

			console.log({ res })

			// Refresh to get real data - SWR will merge the real data seamlessly
			refreshChat()
		} catch (error) {
			// Remove optimistic message on error
			removeOptimisticMessage(
				selectedChat.staff.id,
				selectedStudent.id,
				optimisticMessage.id
			)
			console.error("Failed to send message:", error)
			// You could show an error toast here
			throw error
		}
	}

	const handleChatPress = (chat: chats) => {
		setSelectedChat(chat)
		setIsChatWindowOpen(true)
	}

	const handleBackToList = () => {
		setSelectedChat(null)
		setIsChatWindowOpen(false)
	}

	useEffect(() => {
		// Clean up when component unmounts
		return () => {
			setIsChatWindowOpen(false)
		}
	}, [])

	if (chatLoading) {
		return <LoadingScreen />
	}

	// If a chat is selected, show the chat window
	if (selectedChat) {
		return (
			<ChatWindow
				staff_id={selectedChat.staff.id}
				onBack={handleBackToList}
				onSendMessage={handleSendMessage}
			/>
		)
	}

	const adminChats = chats?.filter((chat) => chat.role === "admin") || []
	const teacherChats = chats?.filter((chat) => chat.role === "teacher") || []

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Mensajes</Text>
			</SafeAreaView>
			<FlatList<ListItem>
				data={[
					...(adminChats.length > 0
						? [{ type: "section" as const, title: "Administración" }]
						: []),
					...adminChats.map((chat) => ({ type: "chat" as const, data: chat })),
					...(teacherChats.length > 0
						? [{ type: "section" as const, title: "Docentes" }]
						: []),
					...teacherChats.map((chat) => ({
						type: "chat" as const,
						data: chat,
					})),
				]}
				keyExtractor={(item) =>
					item.type === "section"
						? `section-${item.title}`
						: `chat-${item.data.staff_id}-${item.data.student_id}`
				}
				renderItem={({ item }) => {
					if (item.type === "section") {
						return <SectionHeader title={item.title} />
					}
					return (
						<ChatroomItem
							item={item.data}
							onPress={() => handleChatPress(item.data)}
						/>
					)
				}}
				style={styles.chatList}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	heading: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	chatList: {
		flex: 1,
		paddingHorizontal: theme.spacing.md,
	},
})
