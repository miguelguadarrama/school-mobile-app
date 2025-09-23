import React, { useState } from "react"
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../../helpers/theme"

interface MessageInputProps {
	onSendMessage: (content: string) => Promise<void>
	keyboardHeight: number
	placeholder?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
	onSendMessage,
	keyboardHeight,
	placeholder = "Escribe un mensaje...",
}) => {
	const [messageText, setMessageText] = useState("")
	const [isSending, setIsSending] = useState(false)

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
		<View
			style={[
				styles.inputContainer,
				keyboardHeight > 0 && {
					position: "absolute",
					bottom: keyboardHeight + (Platform.OS === "ios" ? 0 : 48),
					left: 0,
					right: 0,
				},
			]}
		>
			<SafeAreaView edges={keyboardHeight > 0 ? [] : ["bottom"]}>
				<View style={styles.inputWrapper}>
					<TextInput
						style={styles.textInput}
						placeholder={placeholder}
						placeholderTextColor={theme.colors.muted}
						multiline
						value={messageText}
						onChangeText={setMessageText}
						onSubmitEditing={handleSend}
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
									? theme.colors.white
									: theme.colors.muted
							}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	)
}

const styles = StyleSheet.create({
	inputContainer: {
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