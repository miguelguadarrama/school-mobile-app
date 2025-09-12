// src/screens/PasswordScreen.tsx
import { useAuth } from "../../contexts/AuthContext"
import { trackLogin } from "../../services/users"
import { useRoute, useNavigation } from "@react-navigation/native"
import React, { useState } from "react"
import {
	Alert,
	Button,
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
} from "react-native"
import InputPassword from "../../components/InputPassword"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AuthStackParamList } from "../../types/navigation"
import AppButton from "../../components/ui/button"

type LoginPasswordNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginPassword"
>

const EXPO_PUBLIC_AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN
const EXPO_PUBLIC_AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE
const EXPO_PUBLIC_AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
const EXPO_PUBLIC_AUTH0_SCOPE = process.env.EXPO_PUBLIC_AUTH0_SCOPE

const LoginPassword = () => {
	const { login } = useAuth()
	const route = useRoute()
	const navigation = useNavigation<LoginPasswordNavigationProp>()
	const { email, sso_account } = route.params as {
		email: string
		sso_account: string
	}

	const [password, setPassword] = useState("")
	const [status, setStatus] = useState<"IDLE" | "BUSY">("IDLE")

	const handleLogin = async () => {
		if (!password) {
			Alert.alert("Error", "Por favor ingresa tu contraseña.")
			return
		}

		try {
			setStatus("BUSY")
			await login(email, password)
			trackLogin(email, sso_account)
			// ✅ If successful, user is redirected automatically by auth state
		} catch (error: any) {
			if (__DEV__) {
				console.error("Error de inicio de sesión", error)
			}
			Alert.alert(
				"Error de Inicio de Sesión",
				error.message || "Ocurrió un error."
			)
		} finally {
			setStatus("IDLE")
		}
	}

	const handleForgotPassword = () => {
		navigation.navigate("LoginForgotCredentials", { email })
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Correo electrónico</Text>
			<TextInput
				value={email}
				editable={false}
				style={[styles.input, { backgroundColor: "#eee", color: "#888" }]}
			/>

			<Text style={styles.label}>Contraseña</Text>
			<InputPassword
				placeholder="Introduce tu contraseña"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<AppButton
				disabled={!password || status === "BUSY"}
				onPress={handleLogin}
			>
				{status === "BUSY" ? "Iniciando sesión..." : "Iniciar sesión"}
			</AppButton>

			{/* <Text style={{ marginVertical: 20, textAlign: "center" }}>
				Variables: [{EXPO_PUBLIC_AUTH0_DOMAIN}], [{EXPO_PUBLIC_AUTH0_CLIENT_ID}
				], [{EXPO_PUBLIC_AUTH0_AUDIENCE}], [{EXPO_PUBLIC_AUTH0_SCOPE}]
			</Text> */}

			<TouchableOpacity
				onPress={handleForgotPassword}
				style={styles.forgotPasswordContainer}
			>
				<Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
			</TouchableOpacity>
		</View>
	)
}

export default LoginPassword

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		marginTop: "50%",
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
	forgotPasswordContainer: {
		marginTop: 20,
		alignItems: "center",
	},
	forgotPasswordText: {
		color: "#007AFF",
		fontSize: 16,
		textDecorationLine: "underline",
	},
})
