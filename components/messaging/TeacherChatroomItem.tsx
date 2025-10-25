import React, { useContext, useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AppContext from "../../contexts/AppContext"
import { formatName, studentPhotoUri } from "../../helpers/students"
import { theme } from "../../helpers/theme"
import { chats } from "../../types/chat"
import { Avatar } from "./Avatar"
import { UnreadBadge } from "./UnreadBadge"

interface TeacherChatroomItemProps {
	item: chats
	onPress: () => void
}

export const TeacherChatroomItem: React.FC<TeacherChatroomItemProps> = ({
	item,
	onPress,
}) => {
	const { academic_year_id } = useContext(AppContext)!
	const lastMessage = item.messages[item.messages.length - 1]
	const [imageError, setImageError] = useState(false)

	// For teachers, count unread messages from guardians (parents)
	const unreadCount = item.messages.filter(
		(message) => message.sender_alias === "guardian" && message.read_at === null
	).length

	// Use actual student name from the chat data (userInfo now contains student info for teachers)
	const studentDisplayName = item.userInfo.full_name

	const studentPhotoUrl = studentPhotoUri(academic_year_id, item.student_id)

	return (
		<TouchableOpacity style={styles.chatroomItem} onPress={onPress}>
			<View style={styles.avatarContainer}>
				{!imageError ? (
					<Image
						source={{ uri: studentPhotoUrl }}
						style={styles.studentPhoto}
						onError={() => setImageError(true)}
					/>
				) : (
					<Avatar name={studentDisplayName} size="large" variant="primary" />
				)}
			</View>
			<View style={styles.chatroomContent}>
				<Text style={styles.studentName} numberOfLines={1} ellipsizeMode="tail">
					{formatName(studentDisplayName)}
				</Text>
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
	studentPhoto: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: theme.colors.border,
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
