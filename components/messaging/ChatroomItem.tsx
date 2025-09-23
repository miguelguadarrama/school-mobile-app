import React from "react"
import { Text, View, TouchableOpacity, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"
import { chats } from "../../types/chat"
import { Avatar } from "./Avatar"
import { UnreadBadge } from "./UnreadBadge"

interface ChatroomItemProps {
	item: chats
	onPress: () => void
}

export const ChatroomItem: React.FC<ChatroomItemProps> = ({ item, onPress }) => {
	const lastMessage = item.messages[item.messages.length - 1]
	const unreadCount = item.messages.filter(
		(message) => message.sender_alias === "staff" && message.read_at === null
	).length

	return (
		<TouchableOpacity style={styles.chatroomItem} onPress={onPress}>
			<View style={styles.avatarContainer}>
				<Avatar
					name={item.staff.full_name}
					size="large"
					variant="primary"
				/>
			</View>
			<View style={styles.chatroomContent}>
				<Text style={styles.staffName}>{item.staff.full_name}</Text>
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
})