import React, { useEffect } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LoadingScreen from "../components/Loading"
import {
	ChatWindow,
	ChatroomItem,
	SectionHeader,
} from "../components/messaging"
import { useChatContext } from "../contexts/ChatContext"
import { theme } from "../helpers/theme"
import { chats } from "../types/chat"

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
		// UI State
		setIsChatWindowOpen,
		selectedChat,
		setSelectedChat,

		// Chat Data
		chats,
		isLoading: chatLoading,

		// Message Operations
		sendMessage,
	} = useChatContext()

	const handleSendMessage = async (content: string) => {
		if (!selectedChat) return
		await sendMessage(selectedChat.staff_id, content)
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
				staff_id={selectedChat.staff_id}
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
					...(teacherChats.length > 0
						? [{ type: "section" as const, title: "Docentes" }]
						: []),
					...teacherChats
						.reduce((acc, chat) => {
							// Avoid duplicates based on staff_id
							if (!acc.find((c) => c.staff_id === chat.staff_id)) {
								acc.push(chat)
							}
							return acc
						}, [] as chats[])
						.map((chat) => ({
							type: "chat" as const,
							data: chat,
						})),
					...(adminChats.length > 0
						? [{ type: "section" as const, title: "Administración" }]
						: []),
					...adminChats
						.reduce((acc, chat) => {
							// Avoid duplicates based on staff_id
							if (!acc.find((c) => c.staff_id === chat.staff_id)) {
								acc.push(chat)
							}
							return acc
						}, [] as chats[])
						.map((chat) => ({ type: "chat" as const, data: chat })),
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
