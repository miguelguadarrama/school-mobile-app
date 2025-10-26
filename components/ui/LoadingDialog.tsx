import React from "react"
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native"
import { theme } from "../../helpers/theme"

interface LoadingDialogProps {
	visible: boolean
	message?: string
	animationType?: "none" | "slide" | "fade"
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({
	visible,
	message = "Cargando...",
	animationType = "fade",
}) => {
	return (
		<Modal visible={visible} transparent animationType={animationType}>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
					<Text style={styles.text}>{message}</Text>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.lg,
		padding: theme.spacing.xl,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		minWidth: 200,
	},
	text: {
		marginTop: theme.spacing.md,
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		textAlign: "center",
	},
})
