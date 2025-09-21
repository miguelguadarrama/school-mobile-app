// src/components/InputPassword.tsx
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
	StyleSheet,
	TextInput,
	TextInputProps,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native"

interface InputPasswordProps extends TextInputProps {
	value: string
}

const InputPassword: React.FC<InputPasswordProps> = ({
	value,
	onChangeText,
	...props
}) => {
	const [passwordVisible, setPasswordVisible] = useState(false)

	const scheme = useColorScheme() // 'light' | 'dark' | null

	// Choose accessible colors for both modes
	const placeholderColor =
		scheme === "dark" ? "#9CA3AF" /* gray-400 */ : "#6B7280" /* gray-500 */

	const textColor =
		scheme === "dark" ? "#F3F4F6" /* gray-100 */ : "#111827" /* gray-900 */

	return (
		<View style={styles.inputWrapper}>
			<TextInput
				{...props}
				value={value}
				onChangeText={onChangeText}
				secureTextEntry={!passwordVisible}
				placeholderTextColor={placeholderColor}
				style={[{ color: textColor }, styles.inputField]}
				autoCapitalize="none"
			/>
			<TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
				<Ionicons
					name={passwordVisible ? "eye-off" : "eye"}
					size={24}
					color={textColor}
				/>
			</TouchableOpacity>
		</View>
	)
}

export default InputPassword

const styles = StyleSheet.create({
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		marginBottom: 20,
		paddingHorizontal: 12,
		backgroundColor: "#fff",
	},
	inputField: {
		fontFamily: "Nunito_400Regular",
		flex: 1,
		paddingVertical: 12,
		fontSize: 16,
	},
})
