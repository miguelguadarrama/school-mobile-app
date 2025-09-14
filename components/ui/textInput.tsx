import { StyleSheet, TextInput, useColorScheme } from "react-native"

type Props = {
	value: string
	onValueChange?: (text: string) => void
	keyboardType?: "default" | "email-address" | "numeric" | "phone-pad"
	readOnly?: boolean
	placeholder?: string
	maxLength?: number
}

const CustomTextInput = ({
	value,
	onValueChange,
	keyboardType = "default",
	readOnly = false,
	placeholder,
	maxLength,
}: Props) => {
	const scheme = useColorScheme() // 'light' | 'dark' | null

	// Choose accessible colors for both modes
	const placeholderColor =
		scheme === "dark" ? "#9CA3AF" /* gray-400 */ : "#6B7280" /* gray-500 */

	const textColor =
		scheme === "dark" ? "#F3F4F6" /* gray-100 */ : "#111827" /* gray-900 */

	return (
		<TextInput
			placeholder={placeholder}
			value={value}
			onChangeText={onValueChange}
			keyboardType={keyboardType}
			autoCapitalize="none"
			autoCorrect={false}
			style={[
				styles.input,
				{ color: textColor },
				readOnly && { backgroundColor: "#DDD", color: "#666" },
			]} // light gray background when readOnly
			placeholderTextColor={placeholderColor}
			editable={!readOnly}
			maxLength={maxLength}
		/>
	)
}

const styles = StyleSheet.create({
	input: {
		fontFamily: "Nunito_400Regular",
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 20,
		fontSize: 16,
		backgroundColor: "#FFFFFF", // make explicit so theme doesn’t wash it out
	},
})

export default CustomTextInput
