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
		backgroundColor: "#93C5FD",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	button: {
		//blue
		backgroundColor: theme.colors.primary,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonSecondary: {
		//gray
		backgroundColor: theme.colors.secondary,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		fontFamily: "Nunito_400Regular",
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
})
