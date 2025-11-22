import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../../helpers/theme"
import { SocialStackParamList } from "../../types/navigation"
import { chat_message } from "../../types/chat"
import { Avatar } from "./Avatar"
import { DocumentCard } from "./DocumentCard"
import { VideoPlayerModal } from "../blog/VideoPlayerModal"

interface AttachmentBubbleProps {
	message: chat_message
	isUser: boolean
	senderName: string
}

type NavigationProp = NativeStackNavigationProp<SocialStackParamList>

export const AttachmentBubble: React.FC<AttachmentBubbleProps> = ({
	message,
	isUser,
	senderName,
}) => {
	const navigation = useNavigation<NavigationProp>()
	const [videoModalVisible, setVideoModalVisible] = useState(false)

	const handlePhotoPress = () => {
		if (!message.attachment_url) return

		// Navigate to PhotoGrid viewer with single photo
		navigation.navigate("PhotoGrid", {
			photos: [
				{
					id: message.id,
					file_url: message.attachment_url,
					media_type: "photo",
					caption: message.content || "",
				},
			],
			title: "Foto",
		})
	}

	const handleVideoPress = () => {
		setVideoModalVisible(true)
	}

	const handleCloseVideoModal = () => {
		setVideoModalVisible(false)
	}

	const renderAttachment = () => {
		if (!message.attachment_url) return null

		switch (message.attachment_type) {
			case "photo":
				return (
					<TouchableOpacity
						onPress={handlePhotoPress}
						activeOpacity={0.9}
						disabled={message.isOptimistic}
					>
						<Image
							source={{ uri: message.attachment_url }}
							style={styles.photoImage}
							resizeMode="cover"
						/>
						{message.isOptimistic && (
							<View style={styles.uploadingOverlay}>
								<Text style={styles.uploadingText}>Subiendo...</Text>
							</View>
						)}
					</TouchableOpacity>
				)

			case "video":
				return (
					<>
						<TouchableOpacity
							onPress={handleVideoPress}
							activeOpacity={0.9}
							disabled={message.isOptimistic}
							style={styles.videoContainer}
						>
							<Image
								source={{ uri: message.attachment_url }}
								style={styles.videoImage}
								resizeMode="cover"
							/>
							<View style={styles.videoOverlay}>
								<Ionicons
									name="play-circle"
									size={56}
									color="rgba(255,255,255,0.9)"
								/>
							</View>
							{message.isOptimistic && (
								<View style={styles.uploadingOverlay}>
									<Text style={styles.uploadingText}>Subiendo...</Text>
								</View>
							)}
						</TouchableOpacity>
						<VideoPlayerModal
							visible={videoModalVisible}
							videoUrl={message.attachment_url}
							videoSize={message.attachment_file_size}
							onClose={handleCloseVideoModal}
						/>
					</>
				)

			case "document":
				return (
					<DocumentCard
						fileName={message.attachment_file_name || "Documento"}
						fileSize={message.attachment_file_size}
						fileUrl={message.attachment_url}
						isOptimistic={message.isOptimistic}
					/>
				)

			default:
				return null
		}
	}

	return (
		<View
			style={[
				styles.messageContainer,
				isUser ? styles.userMessageContainer : styles.staffMessageContainer,
			]}
		>
			{!isUser && (
				<View style={styles.avatarWrapper}>
					<Avatar name={senderName} size="small" variant="staff" />
				</View>
			)}

			<View
				style={[
					styles.messageBubble,
					isUser ? styles.userBubble : styles.staffBubble,
				]}
			>
				{/* Attachment Content */}
				<View style={styles.attachmentContainer}>{renderAttachment()}</View>

				{/* Timestamp */}
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
					<Avatar name={senderName} size="small" variant="user" />
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
	attachmentContainer: {
		marginBottom: theme.spacing.xs,
		overflow: "hidden",
		borderRadius: 12,
	},
	photoImage: {
		width: "100%",
		height: 200,
		borderRadius: 12,
	},
	videoContainer: {
		position: "relative",
	},
	videoImage: {
		width: "100%",
		height: 200,
		borderRadius: 12,
	},
	videoOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.2)",
		borderRadius: 12,
	},
	uploadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.6)",
		borderRadius: 12,
	},
	uploadingText: {
		color: theme.colors.white,
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
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
