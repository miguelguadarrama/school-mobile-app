// src/screens/LoginScreen.tsx
import { checkUserEmail } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { StatusBar, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AppButton from "../../components/ui/button"

type LoginScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginEmail"
>

const LoginScreen = () => {
	const [email, setEmail] = useState("")
	const [status, setStatus] = useState<"IDLE" | "BUSY">("IDLE")
	const navigation = useNavigation<LoginScreenNavigationProp>()

	const handleContinue = async () => {
		setStatus("BUSY")

		try {
			const data = await checkUserEmail(email)
			if (data && data.sso_account) {
				navigation.navigate("LoginPassword", {
					email,
					sso_account: data.sso_account,
				})
				return
			}

			if (data && !data.sso_account) {
				if (__DEV__) {
					console.log("User not registered")
				}
				// If the user is not registered, you can navigate to a different screen
				navigation.navigate("LoginVerifyEmail", { email })
				return
			}
		} catch (error) {
			if (__DEV__) {
				console.error("Error checking user email", error)
			}
		}

		navigation.navigate("LoginNoAccountFound", { email })

		setStatus("IDLE")
	}

	return (
		<>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<Text style={styles.title}>Bienvenido a JAC</Text>

					<TextInput
						placeholder="Correo electrónico"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						style={styles.input}
						readOnly={status === "BUSY"}
					/>

					<AppButton
						disabled={
							status === "BUSY" || email.length === 0 || email.indexOf("@") === -1
						}
						onPress={handleContinue}
					>
						{status === "BUSY" ? "Por favor espera..." : "Continuar"}
					</AppButton>
				</View>
			</SafeAreaView>
		</>
	)
}

export default LoginScreen

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	container: {
		flex: 1,
		justifyContent: "flex-start",
		marginTop: "50%",
		padding: 20,
	},
	title: {
		fontSize: 28,
		marginBottom: 30,
		textAlign: "center",
		fontWeight: "bold",
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
