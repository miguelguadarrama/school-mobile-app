// src/screens/PasswordScreen.tsx
import { useAuth } from "../../contexts/AuthContext"
import { trackLogin } from "../../services/users"
import { useRoute, useNavigation } from "@react-navigation/native"
import React, { useState } from "react"
import {
	Alert,
	Image,
	StyleSheet,
	StatusBar,
	Text,
	View,
	TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import InputPassword from "../../components/InputPassword"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AuthStackParamList } from "../../types/navigation"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
import { theme } from "../../helpers/theme"

type LoginPasswordNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginPassword"
>

// const EXPO_PUBLIC_AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN
// const EXPO_PUBLIC_AUTH0_AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE
// const EXPO_PUBLIC_AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
// const EXPO_PUBLIC_AUTH0_SCOPE = process.env.EXPO_PUBLIC_AUTH0_SCOPE

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
		<>
			<StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<View style={styles.logoContainer}>
						<Image
							source={require("../../assets/ic_launcher-playstore.png")}
							style={styles.logo}
						/>
					</View>
					<Text style={styles.label}>Correo electrónico</Text>
					<CustomTextInput
						placeholder="Correo electrónico"
						value={email}
						readOnly
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

					<TouchableOpacity
						onPress={handleForgotPassword}
						style={styles.forgotPasswordContainer}
					>
						<Text style={styles.forgotPasswordText}>
							¿Olvidaste tu contraseña?
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</>
	)
}

export default LoginPassword

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		marginTop: "20%",
		padding: theme.spacing.lg,
	},
	safeArea: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	logoContainer: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.xl,
		padding: theme.spacing.lg,
		alignSelf: "center",
		marginBottom: theme.spacing.xl,
		...theme.shadow.card,
	},
	label: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		marginBottom: theme.spacing.xs,
		color: theme.colors.text,
		fontWeight: "500",
	},
	logo: {
		width: 120,
		height: 120,
		alignSelf: "center",
	},
	input: {
		fontFamily: theme.typography.family.regular,
		borderWidth: 1,
		borderColor: theme.colors.border,
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		marginBottom: theme.spacing.lg,
		fontSize: theme.typography.size.md,
	},
	forgotPasswordContainer: {
		marginTop: theme.spacing.lg,
		alignItems: "center",
	},
	forgotPasswordText: {
		fontFamily: theme.typography.family.regular,
		color: theme.colors.primary,
		fontSize: theme.typography.size.md,
		textDecorationLine: "underline",
	},
})
