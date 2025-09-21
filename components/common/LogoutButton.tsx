import React, { useState } from "react"
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { useAuth } from "../../contexts/AuthContext"
import { theme } from "../../helpers/theme"

export default function LogoutButton() {
	const { logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await logout()
		} catch (error) {
			console.error("Logout error:", error)
			setIsLoggingOut(false)
		}
	}

	return (
		<TouchableOpacity
			style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
			onPress={handleLogout}
			disabled={isLoggingOut}
		>
			<View style={styles.logoutContent}>
				{isLoggingOut && (
					<ActivityIndicator
						size="small"
						color={theme.colors.white}
						style={styles.spinner}
					/>
				)}
				<Text style={[styles.logoutText]}>
					{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	logoutButton: {
		width: "100%",
		marginTop: theme.spacing.lg,
		paddingVertical: theme.spacing.md,
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.primary,
		...theme.shadow.soft,
	},
	logoutButtonDisabled: {
		opacity: 0.9,
	},
	logoutContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	spinner: {
		marginRight: theme.spacing.xs,
	},
	logoutText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.white,
		fontWeight: "bold",
		textAlign: "center",
	},
})
