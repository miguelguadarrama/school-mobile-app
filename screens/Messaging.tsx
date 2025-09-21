import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useRef, useState } from "react"
import {
	BackHandler,
	FlatList,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import LoadingScreen from "../components/Loading"
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

const MessageBubble = ({
	message,
	isUser,
	senderName,
}: {
	message: chat_message
	isUser: boolean
	senderName: string
}) => {
	return (
		<View
			style={[
				styles.messageContainer,
				isUser ? styles.userMessageContainer : styles.staffMessageContainer,
			]}
		>
			{isUser ? null : (
				<View
					style={[
						styles.messageAvatar,
						isUser ? styles.userAvatar : styles.staffAvatar,
					]}
				>
					<Text
						style={[
							styles.messageAvatarText,
							isUser ? styles.userAvatarText : styles.staffAvatarText,
						]}
					>
						{senderName.charAt(0).toUpperCase()}
					</Text>
				</View>
			)}

			<View
				style={[
					styles.messageBubble,
					isUser ? styles.userBubble : styles.staffBubble,
				]}
			>
				<Text
					style={[
						styles.messageText,
						isUser ? styles.userMessageText : styles.staffMessageText,
					]}
				>
					{message.content}
				</Text>
				<Text
					style={[
						styles.messageTime,
						isUser ? styles.userMessageTime : styles.staffMessageTime,
					]}
				>
					{new Date(message.created_at).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Text>
			</View>
			{!isUser ? null : (
				<View
					style={[
						styles.messageAvatar,
						isUser ? styles.userAvatar : styles.staffAvatar,
					]}
				>
					<Text
						style={[
							styles.messageAvatarText,
							isUser ? styles.userAvatarText : styles.staffAvatarText,
						]}
					>
						{senderName.charAt(0).toUpperCase()}
					</Text>
				</View>
			)}
		</View>
	)
}

const ChatWindow = ({
	chat,
	onBack,
	onSendMessage,
}: {
	chat: chats
	onBack: () => void
	onSendMessage: (content: string) => Promise<void>
}) => {
	const scrollViewRef = useRef<ScrollView>(null)
	const { selectedStudent, chats } = useContext(AppContext)!

	// Get the current chat data from context to ensure we have the latest messages
	const currentChat =
		chats?.find(
			(c) => c.staff.id === chat.staff.id && c.student_id === chat.student_id
		) || chat
	const [messageText, setMessageText] = useState("")
	const [isSending, setIsSending] = useState(false)
	const [keyboardHeight, setKeyboardHeight] = useState(0)
	const insets = useSafeAreaInsets()

	useEffect(() => {
		// Auto-scroll to bottom when messages change or on initial load
		const timer = setTimeout(() => {
			scrollViewRef.current?.scrollToEnd({ animated: false })
		}, 300)

		return () => clearTimeout(timer)
	}, [currentChat.messages])

	useEffect(() => {
		// Handle Android back button
		const handleBackPress = () => {
			onBack()
			return true // Prevent default behavior
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	useEffect(() => {
		// Listen for keyboard events
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			(e) => {
				setKeyboardHeight(e.endCoordinates.height)
			}
		)

		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardHeight(0)
			}
		)

		return () => {
			keyboardDidShowListener.remove()
			keyboardDidHideListener.remove()
		}
	}, [])

	// Also scroll to bottom on layout changes
	const handleContentSizeChange = () => {
		scrollViewRef.current?.scrollToEnd({ animated: false })
	}

	const handleSend = async () => {
		if (!messageText.trim() || isSending) return

		setIsSending(true)
		try {
			await onSendMessage(messageText.trim())
			setMessageText("")
		} catch (error) {
			console.error("Failed to send message:", error)
		} finally {
			setIsSending(false)
		}
	}

	return (
		<View style={styles.chatWindowContainer}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
					<View style={styles.headerInfo}>
						<Text style={styles.staffNameHeader}>
							{currentChat.staff.full_name}
						</Text>
						<Text style={styles.roleHeader}>
							{currentChat.role === "admin" ? "Administración" : "Profesor"}
						</Text>
					</View>
				</View>
			</SafeAreaView>

			<View style={styles.chatContainer}>
				<ScrollView
					ref={scrollViewRef}
					style={styles.chatContent}
					contentContainerStyle={[
						styles.chatContentContainer,
						{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 130 : 20 },
					]}
					showsVerticalScrollIndicator={false}
					onContentSizeChange={handleContentSizeChange}
				>
					{currentChat.messages.map((message) => (
						<MessageBubble
							key={message.id}
							message={message}
							isUser={message.sender_alias === "guardian"}
							senderName={
								message.sender_alias === "guardian"
									? selectedStudent
										? `${selectedStudent.first_name} ${selectedStudent.last_name}`
										: "Usuario"
									: currentChat.staff.full_name
							}
						/>
					))}
				</ScrollView>

				<View
					style={[
						styles.inputContainer,
						keyboardHeight > 0 && {
							position: "absolute",
							bottom: keyboardHeight + 48,
							left: 0,
							right: 0,
						},
					]}
				>
					<SafeAreaView edges={keyboardHeight > 0 ? [] : ["bottom"]}>
						<View style={styles.inputWrapper}>
							<TextInput
								style={styles.textInput}
								placeholder="Escribe un mensaje..."
								placeholderTextColor={theme.colors.muted}
								multiline
								value={messageText}
								onChangeText={setMessageText}
								editable={!isSending}
							/>
							<TouchableOpacity
								style={[
									styles.sendButton,
									messageText.trim() && !isSending
										? styles.sendButtonActive
										: null,
								]}
								onPress={handleSend}
								disabled={!messageText.trim() || isSending}
							>
								<Ionicons
									name="send"
									size={20}
									color={
										messageText.trim() && !isSending
											? theme.colors.primary
											: theme.colors.muted
									}
								/>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				</View>
			</View>
		</View>
	)
}

const ChatroomItem = ({
	item,
	onPress,
}: {
	item: chats
	onPress: () => void
}) => {
	const lastMessage = item.messages[item.messages.length - 1]

	return (
		<TouchableOpacity style={styles.chatroomItem} onPress={onPress}>
			<View style={styles.avatarContainer}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>
						{item.staff.full_name.charAt(0).toUpperCase()}
					</Text>
				</View>
			</View>
			<View style={styles.chatroomContent}>
				<Text style={styles.staffName}>{item.staff.full_name}</Text>
				<Text style={styles.lastMessage} numberOfLines={1}>
					{lastMessage?.content || "-"}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default function MessagingScreen() {
	const { chats, chatLoading, selectedStudent, refreshChat } =
		useContext(AppContext)!
	const { setIsChatWindowOpen } = useChatContext()
	const [selectedChat, setSelectedChat] = useState<chats | null>(null)

	const handleSendMessage = async (content: string) => {
		if (!selectedStudent?.id) return
		await fetcher(`/mobile/chat/${selectedStudent.id}`, {
			method: "POST",
			body: JSON.stringify({ content, staff_id: selectedChat?.staff.id }),
		})
		refreshChat()
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
				chat={selectedChat}
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
						return (
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>{item.title}</Text>
							</View>
						)
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
	chatWindowContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
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
	chatroomItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		backgroundColor: "transparent",
	},
	avatarContainer: {
		marginRight: theme.spacing.md,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.surface,
		fontWeight: "600",
	},
	chatroomContent: {
		flex: 1,
	},
	staffName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.text,
		fontWeight: "600",
		marginBottom: 2,
	},
	lastMessage: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	sectionHeader: {
		paddingVertical: theme.spacing.md,
		paddingTop: theme.spacing.lg,
	},
	sectionTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.primary,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	headerInfo: {
		flex: 1,
	},
	staffNameHeader: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
	},
	roleHeader: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
	chatContainer: {
		flex: 1,
	},
	chatContent: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	chatContentContainer: {
		padding: theme.spacing.md,
		paddingBottom: theme.spacing.lg,
	},
	messageContainer: {
		flexDirection: "row",
		marginVertical: theme.spacing.xs,
		alignItems: "flex-start",
	},
	userMessageContainer: {
		justifyContent: "flex-end",
	},
	staffMessageContainer: {
		justifyContent: "flex-start",
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: theme.spacing.xs,
		marginTop: 2,
	},
	userAvatar: {
		backgroundColor: theme.colors.primary,
	},
	staffAvatar: {
		backgroundColor: "#6b7280",
	},
	messageAvatarText: {
		fontFamily: theme.typography.family.bold,
		fontSize: 12,
		fontWeight: "600",
	},
	userAvatarText: {
		color: theme.colors.surface,
	},
	staffAvatarText: {
		color: theme.colors.surface,
	},
	messageBubble: {
		maxWidth: "70%",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: 16,
	},
	userBubble: {
		backgroundColor: theme.colors.primary,
	},
	staffBubble: {
		backgroundColor: "#f3f4f6",
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	messageText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		lineHeight: 20,
	},
	userMessageText: {
		color: theme.colors.surface,
	},
	staffMessageText: {
		color: theme.colors.text,
	},
	messageTime: {
		fontFamily: theme.typography.family.regular,
		fontSize: 10,
		marginTop: theme.spacing.xs,
	},
	userMessageTime: {
		color: "rgba(255, 255, 255, 0.7)",
	},
	staffMessageTime: {
		color: theme.colors.muted,
	},
	inputContainer: {
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	inputContainerAbsolute: {
		position: "absolute",
		left: 0,
		right: 0,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
		paddingBottom: theme.spacing.sm,
	},
	textInput: {
		flex: 1,
		backgroundColor: theme.colors.background,
		borderRadius: 20,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		marginRight: theme.spacing.sm,
		maxHeight: 50,
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.text,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.background,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	sendButtonActive: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
})
