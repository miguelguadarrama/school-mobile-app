import { Pressable, Text, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"

const AppButton = ({
	children,
	onPress,
	disabled,
	variant = "primary",
}: {
	children: React.ReactNode
	onPress?: () => void
	disabled?: boolean
	variant?: "primary" | "secondary"
}) => (
	<Pressable
		style={
			disabled
				? styles.buttonDisabled
				: variant === "primary"
				? styles.button
				: styles.buttonSecondary
		}
		onPress={onPress}
		disabled={disabled}
	>
		<Text style={styles.buttonText}>{children}</Text>
	</Pressable>
)

export default AppButton

const styles = StyleSheet.create({
	buttonDisabled: {
		backgroundColor: theme.colors["primary-light"],
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		alignItems: "center",
	},
	button: {
		backgroundColor: theme.colors.primary,
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		alignItems: "center",
		...theme.shadow.soft,
	},
	buttonSecondary: {
		backgroundColor: theme.colors.secondary,
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		alignItems: "center",
		...theme.shadow.soft,
	},
	buttonText: {
		fontFamily: theme.typography.family.regular,
		color: theme.colors.white,
		fontSize: theme.typography.size.md,
		fontWeight: "600",
	},
})
