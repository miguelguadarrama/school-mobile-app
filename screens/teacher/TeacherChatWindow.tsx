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
	Text,
	View,
} from "react-native"
import LoadingScreen from "../../components/Loading"
import {
	ChatHeader,
	MessageBubble,
	MessageInput,
} from "../../components/messaging"
import AppContext from "../../contexts/AppContext"
import { useTeacherChatContext } from "../../contexts/TeacherChatContext"
import { studentPhotoUri } from "../../helpers/students"
import { theme } from "../../helpers/theme"
import { fetcher } from "../../services/api"
import { chat_message } from "../../types/chat"

interface TeacherChatWindowProps {
	studentId: string
	onBack: () => void
	onSendMessage: (content: string) => Promise<void>
}

export const TeacherChatWindow: React.FC<TeacherChatWindowProps> = ({
	studentId,
	onBack,
	onSendMessage,
}) => {
	const flatListRef = useRef<FlatList<chat_message>>(null)
	const { academic_year_id } = useContext(AppContext)!
	const { chats } = useTeacherChatContext()
	const [keyboardHeight, setKeyboardHeight] = useState(0)

	// Find the current chat based on studentId
	const currentChat = chats?.find((c) => c.student_id === studentId)

	useEffect(() => {
		if (currentChat) {
			// Mark messages as read for teacher
			fetcher(`/mobile/chat/teacher/read`, {
				method: "PUT",
				body: JSON.stringify({ student_id: studentId }),
			})
		}
	}, [currentChat, studentId])

	const scrollToBottom = useCallback(
		(animated = true) => {
			if (!currentChat?.messages?.length || !flatListRef.current) {
				console.log("No messages to scroll to bottom of")
				return
			}

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

	// For teachers, userInfo contains the student's information
	const studentName = currentChat.userInfo.full_name
	const studentPhotoUrl = studentPhotoUri(academic_year_id, studentId)

	// Check if any guardians have used the app
	const hasActiveGuardians =
		currentChat.student_guardians?.filter((g) => g.users.sso_account).length ??
		0 > 0

	return (
		<View style={styles.chatWindowContainer}>
			<ChatHeader
				staffName={studentName}
				role="student"
				onBack={onBack}
				photoUrl={studentPhotoUrl}
			/>

			<View style={styles.chatContainer}>
				{currentChat?.student_guardians?.length && !hasActiveGuardians && (
					<View style={styles.warningContainer}>
						<Text style={styles.warningText}>
							⚠️ Ningún representante de este alumno ha usado la aplicación
							móvil. No recibirán notificaciones de estos mensajes.
						</Text>
					</View>
				)}

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
							isUser={message.sender_alias === "staff"}
							senderName={
								message.sender_alias === "staff"
									? "Yo" // Teacher's messages
									: studentName // Student's messages
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
	warningContainer: {
		backgroundColor: "#FFF3CD",
		borderLeftWidth: 4,
		borderLeftColor: "#FFC107",
		padding: theme.spacing.md,
		marginHorizontal: theme.spacing.md,
		marginTop: theme.spacing.sm,
		borderRadius: theme.radius.md,
	},
	warningText: {
		color: "#856404",
		fontSize: theme.typography.size.sm,
		lineHeight: 20,
	},
})
