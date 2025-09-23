import React from "react"
import { Text, View, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"
import { chat_message } from "../../types/chat"
import { Avatar } from "./Avatar"

interface MessageBubbleProps {
	message: chat_message
	isUser: boolean
	senderName: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	isUser,
	senderName,
}) => {
	return (
		<View
			style={[
				styles.messageContainer,
				isUser ? styles.userMessageContainer : styles.staffMessageContainer,
				message.isOptimistic && { opacity: 0.75 },
			]}
		>
			{!isUser && (
				<View style={styles.avatarWrapper}>
					<Avatar
						name={senderName}
						size="small"
						variant="staff"
					/>
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
					{message.isOptimistic
						? "Enviando..."
						: new Date(message.created_at).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
						  })}
				</Text>
			</View>

			{isUser && (
				<View style={styles.avatarWrapper}>
					<Avatar
						name={senderName}
						size="small"
						variant="user"
					/>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
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
	avatarWrapper: {
		marginHorizontal: theme.spacing.xs,
		marginTop: 2,
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
		backgroundColor: theme.colors.white,
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
})