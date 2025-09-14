import { Pressable, Text, StyleSheet } from "react-native"

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
		backgroundColor: "#3B82F6",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonSecondary: {
		//gray
		backgroundColor: "#828893ff",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
})
