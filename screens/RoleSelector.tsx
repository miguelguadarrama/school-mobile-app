import { Ionicons } from "@expo/vector-icons"
import React, { useContext } from "react"
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import JAC_H_Logo from "../components/logo"
import AppContext from "../contexts/AppContext"
import { theme } from "../helpers/theme"

export default function RoleSelector() {
	const { roles, setSelectedRole } = useContext(AppContext)!

	const handleRoleSelection = (role: "admin" | "guardian" | "staff") => {
		if (role === "admin") {
			// Admin screens not implemented yet
			return
		}
		setSelectedRole(role)
	}

	const getRoleIcon = (role: "admin" | "guardian" | "staff") => {
		switch (role) {
			case "guardian":
				return "people"
			case "staff":
				return "school"
			case "admin":
				return "settings-sharp"
		}
	}

	const getRoleTitle = (role: "admin" | "guardian" | "staff") => {
		switch (role) {
			case "guardian":
				return "Representante"
			case "staff":
				return "Docente"
			case "admin":
				return "Administrativo"
		}
	}

	const getRoleDescription = (role: "admin" | "guardian" | "staff") => {
		switch (role) {
			case "guardian":
				return "Ver el progreso y comunicarte con el personal docente y administrativo"
			case "staff":
				return "Gestionar salones y alumnos"
			case "admin":
				return "Acceso completo a todas las funciones administrativas"
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={["top", "bottom"]}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* School Header */}
				<View style={styles.headerContainer}>
					<JAC_H_Logo />
				</View>

				<Text style={styles.title}>Selecciona tu Rol</Text>
				<Text style={styles.subtitle}>
					Tienes acceso a múltiples roles. Selecciona cómo deseas continuar.
				</Text>

				<View style={styles.rolesContainer}>
					{roles.includes("guardian") && (
						<TouchableOpacity
							style={styles.roleCard}
							onPress={() => handleRoleSelection("guardian")}
						>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.primary },
								]}
							>
								<Ionicons
									name={getRoleIcon("guardian")}
									size={32}
									color={theme.colors.white}
								/>
							</View>
							<Text style={styles.roleTitle}>{getRoleTitle("guardian")}</Text>
							<Text style={styles.roleDescription}>
								{getRoleDescription("guardian")}
							</Text>
						</TouchableOpacity>
					)}

					{roles.includes("staff") && (
						<TouchableOpacity
							style={styles.roleCard}
							onPress={() => handleRoleSelection("staff")}
						>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: theme.colors.secondary },
								]}
							>
								<Ionicons
									name={getRoleIcon("staff")}
									size={32}
									color={theme.colors.white}
								/>
							</View>
							<Text style={styles.roleTitle}>{getRoleTitle("staff")}</Text>
							<Text style={styles.roleDescription}>
								{getRoleDescription("staff")}
							</Text>
						</TouchableOpacity>
					)}

					{/* Admin button - always show but disabled */}
					<TouchableOpacity
						style={[styles.roleCard, styles.roleCardDisabled]}
						onPress={() => handleRoleSelection("admin")}
						disabled={true}
					>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: theme.colors.muted },
							]}
						>
							<Ionicons
								name={getRoleIcon("admin")}
								size={32}
								color={theme.colors.white}
							/>
						</View>
						<Text style={[styles.roleTitle, styles.roleTextDisabled]}>
							{getRoleTitle("admin")}
						</Text>
						<Text style={[styles.roleDescription, styles.roleTextDisabled]}>
							{getRoleDescription("admin")}
						</Text>
						<View style={styles.comingSoonBadge}>
							<Text style={styles.comingSoonText}>Próximamente</Text>
						</View>
					</TouchableOpacity>
				</View>

				{/* Bottom spacing for safe area */}
				<View style={styles.bottomSpacing} />
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: theme.spacing.lg,
	},
	headerContainer: {
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.xl,
	},
	title: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: theme.spacing.sm,
	},
	subtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		textAlign: "center",
		marginBottom: theme.spacing.xl,
	},
	rolesContainer: {
		gap: theme.spacing.md,
	},
	roleCard: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		padding: theme.spacing.lg,
		alignItems: "center",
		...theme.shadow.card,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	roleCardDisabled: {
		opacity: 0.6,
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	roleTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		fontWeight: "bold",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	roleDescription: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		textAlign: "center",
	},
	roleTextDisabled: {
		color: theme.colors.muted,
	},
	comingSoonBadge: {
		marginTop: theme.spacing.sm,
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.xs / 2,
		borderRadius: theme.radius.pill,
	},
	comingSoonText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xs,
		color: theme.colors.white,
		fontWeight: "bold",
	},
	bottomSpacing: {
		height: theme.spacing.xl,
	},
})
