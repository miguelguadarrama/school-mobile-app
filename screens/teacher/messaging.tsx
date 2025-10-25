import { Ionicons } from "@expo/vector-icons"
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"
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
import AppContext from "../../contexts/AppContext"
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
	const { pendingNotification, clearPendingNotification } =
		useContext(AppContext)!
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
	const [isSearchVisible, setIsSearchVisible] = useState(false)

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

	// Handle notification tap - open the correct chat
	useEffect(() => {
		if (
			pendingNotification?.type === "chat_message" &&
			(pendingNotification.targetRole === "staff" ||
				pendingNotification.targetRole === "admin") &&
			pendingNotification.chatPartnerId &&
			chats
		) {
			// Find the chat with the student (chatPartnerId is student_id for teachers)
			const targetChat = chats.find(
				(c) => c.student_id === pendingNotification.chatPartnerId
			)
			if (targetChat) {
				handleChatPress(targetChat)
				clearPendingNotification()
			}
		}
	}, [pendingNotification, chats])

	useEffect(() => {
		// Clean up when component unmounts
		return () => {
			setIsChatWindowOpen(false)
		}
	}, [setIsChatWindowOpen])

	// ALL DATA PROCESSING AND MEMOIZATION MUST HAPPEN BEFORE EARLY RETURNS
	// Separate chats into those with messages and those without
	const sortedChats = useMemo(() => {
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
		return [...chatsWithMessages, ...chatsWithoutMessages]
	}, [chats])

	// Filter by search query - memoized to prevent unnecessary recalculations
	const filteredChats = useMemo(() => {
		return sortedChats.filter((chat) => {
			if (!searchQuery.trim()) return true
			return chat.userInfo.full_name
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
		})
	}, [sortedChats, searchQuery])

	// Memoize FlatList data to prevent recreating array on every render
	const flatListData = useMemo(() => {
		return [
			...(filteredChats.length > 0
				? [{ type: "section" as const, title: "Alumnos" }]
				: []),
			...filteredChats.map((chat) => ({
				type: "chat" as const,
				data: chat,
			})),
		]
	}, [filteredChats])

	// Memoize callbacks
	const keyExtractor = useCallback(
		(item: ListItem) =>
			item.type === "section"
				? `section-${item.title}`
				: `chat-${item.data.staff_id}-${item.data.student_id}`,
		[]
	)

	const renderItem = useCallback(
		({ item }: { item: ListItem }) => {
			if (item.type === "section") {
				return <SectionHeader title={item.title} />
			}
			return (
				<TeacherChatroomItem
					item={item.data}
					onPress={() => handleChatPress(item.data)}
				/>
			)
		},
		[handleChatPress]
	)

	// Optimized getItemLayout for fixed height items (improves scroll performance)
	const getItemLayout = useCallback(
		(_data: ArrayLike<ListItem> | null | undefined, index: number) => ({
			length: index === 0 ? 40 : 80, // Section header ~40px, chat items ~80px
			offset: index === 0 ? 0 : 40 + (index - 1) * 80,
			index,
		}),
		[]
	)

	// EARLY RETURNS MUST COME AFTER ALL HOOKS
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

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.headerRow}>
					<Text style={styles.heading}>Mensajes</Text>
					<TouchableOpacity
						onPress={() => {
							if (isSearchVisible) {
								setIsSearchVisible(false)
								setSearchQuery("")
							} else {
								setIsSearchVisible(true)
							}
						}}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						style={styles.searchIconButton}
						activeOpacity={0.6}
					>
						<Ionicons
							name={isSearchVisible ? "close" : "search"}
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
				</View>
				{isSearchVisible ? (
					<View style={styles.searchContainer}>
						<TextInput
							style={styles.searchInput}
							placeholder="Buscar..."
							placeholderTextColor={theme.colors.muted}
							value={searchQuery}
							onChangeText={setSearchQuery}
							autoCapitalize="none"
							autoCorrect={false}
							autoFocus
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity
								style={styles.clearButton}
								onPress={() => setSearchQuery("")}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								activeOpacity={0.6}
							>
								<Ionicons
									name="close-circle"
									size={20}
									color={theme.colors.muted}
								/>
							</TouchableOpacity>
						)}
					</View>
				) : null}
			</SafeAreaView>
			<FlatList<ListItem>
				data={flatListData}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				getItemLayout={getItemLayout}
				initialNumToRender={15}
				maxToRenderPerBatch={10}
				windowSize={5}
				removeClippedSubviews={true}
				updateCellsBatchingPeriod={50}
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
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	heading: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.primary,
		flex: 1,
	},
	searchIconButton: {
		padding: theme.spacing.xs,
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
