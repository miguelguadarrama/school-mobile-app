// src/screens/SetNewPasswordScreen.tsx
import { isValidPassword, registerUser } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useEffect, useState } from "react"
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native"
import InputPassword from "../../components/InputPassword"
//import { createAuth0User } from "@/services/auth" // We'll define this next

type SetNewPasswordScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginNewPassword"
>

const LoginNewPassword = () => {
	const route = useRoute()
	const navigation = useNavigation<SetNewPasswordScreenNavigationProp>()
	const { email } = route.params as { email: string }

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [isValid, setIsValid] = useState(false)
	const [status, setStatus] = useState<"IDLE" | "BUSY">("IDLE")

	useEffect(() => {
		if (
			password.length &&
			confirmPassword.length &&
			password === confirmPassword
		) {
			setIsValid(isValidPassword(password))
		}
	}, [password, confirmPassword])

	const handleCreateAccount = async () => {
		if (!password || !confirmPassword) {
			Alert.alert("Error", "Please fill in all fields.")
			return
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match.")
			return
		}

		try {
			setStatus("BUSY")

			const data = await registerUser(email, password)

			if (data && data.result) {
				Alert.alert("Success", "Your account has been created. Please log in.")
				navigation.reset({
					index: 0,
					routes: [{ name: "LoginEmail" }],
				})
				return
			} else {
				Alert.alert("Error", "Failed to create account.")
			}
		} catch (error: any) {
			if (__DEV__) {
				console.error(error)
			}
			Alert.alert("Error", error.message || "Failed to create account.")
		} finally {
			setStatus("IDLE")
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Email</Text>
			<TextInput
				value={email}
				editable={false}
				style={[styles.input, { backgroundColor: "#eee", color: "#888" }]}
			/>

			<Text style={styles.label}>
				Now create a new password, it must contain the following:
			</Text>

			<Text style={styles.passwordGuidance}>
				• At least 8 characters{"\n"}• Lowercase (a-z){"\n"}• Uppercase (A-Z)
				{"\n"}• Numbers (0-9)
			</Text>

			<Text style={styles.label}>New Password</Text>
			<InputPassword
				placeholder="Enter new password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<Text style={styles.label}>Confirm Password</Text>
			<InputPassword
				placeholder="Re-enter new password"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>

			<Button
				title={status === "BUSY" ? "Creating..." : "Create Account"}
				onPress={handleCreateAccount}
				disabled={status === "BUSY" || !isValid}
			/>
		</View>
	)
}

export default LoginNewPassword

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	label: {
		fontSize: 16,
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 20,
		fontSize: 16,
	},

	passwordGuidance: {
		fontSize: 14,
		color: "#666",
		marginBottom: 12,
		height: 100,
	},
})
