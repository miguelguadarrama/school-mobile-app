import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import {
	BackHandler,
	FlatList,
	Keyboard,
	Platform,
	StyleSheet,
	View,
} from "react-native"
import LoadingScreen from "../Loading"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"
import { fetcher } from "../../services/api"
import { chat_message } from "../../types/chat"
import { ChatHeader } from "./ChatHeader"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"

interface ChatWindowProps {
	staff_id: string
	onBack: () => void
	onSendMessage: (content: string) => Promise<void>
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
	staff_id,
	onBack,
	onSendMessage,
}) => {
	const flatListRef = useRef<FlatList<chat_message>>(null)
	const { selectedStudent, chats } = useContext(AppContext)!

	const currentChat = chats?.find((c) => c.staff.id === staff_id)!
	const [keyboardHeight, setKeyboardHeight] = useState(0)

	useEffect(() => {
		if (currentChat && selectedStudent) {
			fetcher(`/mobile/chat/${selectedStudent?.id}/read`, {
				method: "PUT",
			})
		}
	}, [currentChat, selectedStudent])

	const scrollToBottom = useCallback(
		(animated = true) => {
			if (!currentChat?.messages?.length || !flatListRef.current) {
				console.log("No messages to scroll to bottom of")
				return
			}
			console.log({ currentChatLength: currentChat.messages.length })

			setTimeout(() => {
				flatListRef.current?.scrollToOffset({
					offset: 0,
					animated,
				})
			}, 100)
		},
		[currentChat?.messages?.length]
	)

	useEffect(() => {
		if (currentChat?.messages?.length) {
			scrollToBottom(false)
		}
	}, [currentChat?.messages?.length, scrollToBottom])

	useEffect(() => {
		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	useEffect(() => {
		const showEvent =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
		const hideEvent =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

		const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
			setKeyboardHeight(e.endCoordinates.height)
			scrollToBottom()
		})

		const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
			setKeyboardHeight(0)
		})

		return () => {
			keyboardShowListener.remove()
			keyboardHideListener.remove()
		}
	}, [scrollToBottom])

	const handleSend = async (content: string) => {
		await onSendMessage(content)
		scrollToBottom()
	}

	if (!currentChat) {
		return <LoadingScreen />
	}

	return (
		<View style={styles.chatWindowContainer}>
			<ChatHeader
				staffName={currentChat.staff.full_name}
				role={currentChat.role}
				onBack={onBack}
			/>

			<View style={styles.chatContainer}>
				<FlatList
					ref={flatListRef}
					style={styles.chatContent}
					contentContainerStyle={[
						styles.chatContentContainer,
						{
							paddingTop:
								keyboardHeight > 0
									? keyboardHeight + (Platform.OS === "ios" ? 100 : 130)
									: 20,
						},
					]}
					data={currentChat.messages.slice().reverse()}
					inverted
					keyExtractor={(item) => item.id}
					onLayout={() => scrollToBottom(false)}
					onContentSizeChange={() => scrollToBottom(false)}
					renderItem={({ item: message }) => (
						<MessageBubble
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
					)}
					showsVerticalScrollIndicator={false}
				/>

				<MessageInput
					onSendMessage={handleSend}
					keyboardHeight={keyboardHeight}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	chatWindowContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
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
})