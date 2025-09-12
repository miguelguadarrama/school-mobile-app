import { Pressable, Text, StyleSheet } from "react-native"

const AppButton = ({
	children,
	onPress,
	disabled,
}: {
	children: React.ReactNode
	onPress?: () => void
	disabled?: boolean
}) => (
	<Pressable
		style={disabled ? styles.buttonDisabled : styles.button}
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
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
})
