import React, { useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { formatName } from "../../helpers/students"
import { theme } from "../../helpers/theme"
import { chats } from "../../types/chat"
import { Avatar } from "./Avatar"
import { UnreadBadge } from "./UnreadBadge"

interface ChatroomItemProps {
	item: chats
	onPress: () => void
}

export const ChatroomItem: React.FC<ChatroomItemProps> = ({
	item,
	onPress,
}) => {
	const lastMessage = item.messages[item.messages.length - 1]
	const unreadCount = item.messages.filter(
		(message) => message.sender_alias === "staff" && message.read_at === null
	).length
	const [imageError, setImageError] = useState(false)

	const userPhotoUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL?.replace(
		"/api",
		""
	)}/blob/users/${item.userInfo.id}.jpg`

	return (
		<TouchableOpacity style={styles.chatroomItem} onPress={onPress}>
			<View style={styles.avatarContainer}>
				{!imageError ? (
					<Image
						source={{ uri: userPhotoUrl }}
						style={styles.userPhoto}
						onError={() => setImageError(true)}
					/>
				) : (
					<Avatar
						name={item.userInfo.full_name}
						size="large"
						variant="primary"
					/>
				)}
			</View>
			<View style={styles.chatroomContent}>
				<Text style={styles.staffName}>{formatName(item.userInfo.full_name)}</Text>
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
	userPhoto: {
		width: 48,
		height: 48,
		borderRadius: 24,
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
