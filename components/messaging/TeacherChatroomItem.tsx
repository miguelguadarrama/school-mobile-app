import React from "react"
import { Text, View, TouchableOpacity, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"
import { chats } from "../../types/chat"
import { Avatar } from "./Avatar"
import { UnreadBadge } from "./UnreadBadge"

interface TeacherChatroomItemProps {
	item: chats
	onPress: () => void
}

export const TeacherChatroomItem: React.FC<TeacherChatroomItemProps> = ({ item, onPress }) => {
	const lastMessage = item.messages[item.messages.length - 1]

	// For teachers, count unread messages from guardians (parents)
	const unreadCount = item.messages.filter(
		(message) => message.sender_alias === "guardian" && message.read_at === null
	).length

	// Use actual student name from the chat data (userInfo now contains student info for teachers)
	const studentDisplayName = item.userInfo.full_name

	return (
		<TouchableOpacity style={styles.chatroomItem} onPress={onPress}>
			<View style={styles.avatarContainer}>
				<Avatar
					name={studentDisplayName}
					size="large"
					variant="primary"
				/>
			</View>
			<View style={styles.chatroomContent}>
				<Text style={styles.studentName}>{studentDisplayName}</Text>
				<View style={styles.lastMessageContainer}>
					<UnreadBadge count={unreadCount} />
					<Text style={styles.lastMessage} numberOfLines={1}>
						{lastMessage?.content || "-"}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	chatroomItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		backgroundColor: "transparent",
	},
	avatarContainer: {
		marginRight: theme.spacing.md,
	},
	chatroomContent: {
		flex: 1,
	},
	lastMessageContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	studentName: {
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
})