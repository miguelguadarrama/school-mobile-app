import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LoadingScreen from "../../components/Loading"
import { SectionHeader } from "../../components/messaging"
import { TeacherChatroomItem } from "../../components/messaging/TeacherChatroomItem"
import { useTeacherChatContext } from "../../contexts/TeacherChatContext"
import { theme } from "../../helpers/theme"
import { chats } from "../../types/chat"
import { TeacherChatWindow } from "./TeacherChatWindow"

type SectionItem = {
	type: "section"
	title: string
}

type ChatItem = {
	type: "chat"
	data: chats
}

type ListItem = SectionItem | ChatItem

export default function TeacherMessagingScreen() {
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
	} = useTeacherChatContext()

	const [searchQuery, setSearchQuery] = useState("")

	const handleSendMessage = async (content: string) => {
		if (!selectedChat) return
		await sendMessage(selectedChat.student_id, content)
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
	}, [setIsChatWindowOpen])

	if (chatLoading) {
		return <LoadingScreen />
	}

	// If a chat is selected, show the chat window
	if (selectedChat) {
		return (
			<TeacherChatWindow
				studentId={selectedChat.student_id}
				onBack={handleBackToList}
				onSendMessage={handleSendMessage}
			/>
		)
	}

	// Separate chats into those with messages and those without
	const chatsWithMessages: chats[] = []
	const chatsWithoutMessages: chats[] = []

	;(chats || []).forEach((chat) => {
		const lastMessage = chat.messages[chat.messages.length - 1]
		if (lastMessage) {
			chatsWithMessages.push(chat)
		} else {
			chatsWithoutMessages.push(chat)
		}
	})

	// Sort chats with messages by latest message timestamp (most recent first)
	chatsWithMessages.sort((a, b) => {
		const aLastMessage = a.messages[a.messages.length - 1]
		const bLastMessage = b.messages[b.messages.length - 1]
		return (
			new Date(bLastMessage.created_at).getTime() -
			new Date(aLastMessage.created_at).getTime()
		)
	})

	// Sort chats without messages alphabetically by student name
	chatsWithoutMessages.sort((a, b) => {
		return a.userInfo.full_name.localeCompare(b.userInfo.full_name, "es")
	})

	// Combine: recent conversations first, then alphabetically sorted ones
	const sortedChats = [...chatsWithMessages, ...chatsWithoutMessages]

	// Filter by search query
	const filteredChats = sortedChats.filter((chat) => {
		if (!searchQuery.trim()) return true
		return chat.userInfo.full_name
			.toLowerCase()
			.includes(searchQuery.toLowerCase())
	})

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Mensajes</Text>
				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchInput}
						placeholder="Buscar..."
						placeholderTextColor={theme.colors.muted}
						value={searchQuery}
						onChangeText={setSearchQuery}
						autoCapitalize="none"
						autoCorrect={false}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							style={styles.clearButton}
							onPress={() => setSearchQuery("")}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons
								name="close-circle"
								size={20}
								color={theme.colors.muted}
							/>
						</TouchableOpacity>
					)}
				</View>
			</SafeAreaView>
			<FlatList<ListItem>
				data={[
					...(filteredChats.length > 0
						? [{ type: "section" as const, title: "Estudiantes" }]
						: []),
					...filteredChats.map((chat) => ({
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
						<TeacherChatroomItem
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
	searchContainer: {
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.md,
		position: "relative",
	},
	searchInput: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: 12,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		paddingRight: 40,
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
	},
	clearButton: {
		position: "absolute",
		right: theme.spacing.md + 12,
		top: "50%",
		transform: [{ translateY: -10 }],
	},
	chatList: {
		flex: 1,
		paddingHorizontal: theme.spacing.md,
	},
})
