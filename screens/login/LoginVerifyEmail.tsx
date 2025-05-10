// src/screens/VerifyEmailScreen.tsx
import { triggerOTP, verifyOTP } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native"

type VerifyEmailScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginVerifyEmail"
>

const LoginVerifyEmail = () => {
	const route = useRoute()
	const navigation = useNavigation<VerifyEmailScreenNavigationProp>()
	const { email } = route.params as { email: string }

	const [sentOTP, setSentOTP] = useState(false)
	const [otpCode, setOtpCode] = useState("")
	const [status, setStatus] = useState<"IDLE" | "BUSY">("IDLE")

	const handleSendOTP = async () => {
		setStatus("BUSY")
		try {
			if (__DEV__) {
				console.log("Sending OTP to", email)
			}
			const data = await triggerOTP(email)
			if (data) {
				setSentOTP(true)
				Alert.alert(
					"Verification code sent",
					`We have sent a verification code to ${email}.`
				)
				setStatus("IDLE")
			} else {
				Alert.alert("Error", `Failed to send verification code to ${email}.`)
				navigation.reset({
					index: 0,
					routes: [{ name: "LoginEmail" }],
				})
				return
			}
		} catch (error) {
			if (__DEV__) {
				console.error(error)
			}
			Alert.alert("Error", "Failed to send verification code.")
			navigation.reset({
				index: 0,
				routes: [{ name: "LoginEmail" }],
			})
			return
		}
	}

	const handleVerifyOTP = async () => {
		setStatus("BUSY")
		try {
			if (__DEV__) {
				console.log("Verifying OTP", otpCode)
			}
			const data = await verifyOTP(email, otpCode)

			if (data && data.result) {
				Alert.alert("Success", "Your email has been verified.")
				navigation.navigate("LoginNewPassword", { email })
				return
			} else {
				Alert.alert("Invalid Code", "The code you entered is incorrect.")
				setStatus("IDLE")
			}
		} catch (error) {
			if (__DEV__) {
				console.error(error)
			}
			Alert.alert("Error", "Failed to verify code.")
			setStatus("IDLE")
		}
	}

	const handleWrongEmail = () => {
		navigation.reset({
			index: 0,
			routes: [{ name: "LoginEmail" }],
		})
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Confirm your email</Text>
			<TextInput
				value={email}
				editable={false}
				style={[styles.input, { backgroundColor: "#eee", color: "#888" }]}
			/>

			{!sentOTP ? (
				<>
					<Button title="Yes, send verification code" onPress={handleSendOTP} />
					<View style={{ height: 20 }} />
					<Button title="No, wrong email" onPress={handleWrongEmail} />
				</>
			) : (
				<>
					<Text style={[styles.label, { marginTop: 30 }]}>
						Enter the 6-digit code
					</Text>
					<TextInput
						value={otpCode}
						onChangeText={setOtpCode}
						maxLength={6}
						keyboardType="numeric"
						style={styles.input}
						readOnly={status === "BUSY"}
					/>
					<Button
						disabled={!otpCode || otpCode.length !== 6 || status === "BUSY"}
						title="Confirm Code"
						onPress={handleVerifyOTP}
					/>
				</>
			)}
		</View>
	)
}

export default LoginVerifyEmail

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	label: {
		fontSize: 18,
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
})
