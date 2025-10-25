import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { theme } from "../../helpers/theme"
import { Avatar } from "./Avatar"

interface ChatHeaderProps {
	staffName: string
	role: "admin" | "teacher" | "student"
	onBack: () => void
	photoUrl?: string
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
	staffName,
	role,
	onBack,
	photoUrl,
}) => {
	const [imageError, setImageError] = useState(false)

	return (
		<SafeAreaView edges={["top"]} style={styles.headerContainer}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={onBack}>
					<Ionicons
						name="chevron-back"
						size={24}
						color={theme.colors.primary}
					/>
				</TouchableOpacity>
				{photoUrl && (
					<View style={styles.avatarContainer}>
						{!imageError ? (
							<Image
								source={{ uri: photoUrl }}
								style={styles.photo}
								onError={() => setImageError(true)}
							/>
						) : (
							<Avatar name={staffName} size="medium" variant="primary" />
						)}
					</View>
				)}
				<View style={styles.headerInfo}>
					<Text
						style={styles.staffNameHeader}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{staffName.toLowerCase()}
					</Text>
					<Text style={styles.roleHeader}>
						{role === "admin"
							? "Administración"
							: role === "teacher"
							? "Docente"
							: "Estudiante"}
					</Text>
				</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	avatarContainer: {
		marginRight: theme.spacing.md,
	},
	photo: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: theme.colors.border,
	},
	headerInfo: {
		flex: 1,
		paddingRight: theme.spacing.md,
	},
	staffNameHeader: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	roleHeader: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
})
