// src/screens/SetNewPasswordScreen.tsx
import { isValidPassword, registerUser } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import InputPassword from "../../components/InputPassword"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
//import { createAuth0User } from "@/services/auth" // We'll define this next

type SetNewPasswordScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginNewPassword"
>

const LoginNewPassword = () => {
	const route = useRoute()
	const navigation = useNavigation<SetNewPasswordScreenNavigationProp>()
	const { email, shouldReset } = route.params as {
		email: string
		shouldReset?: boolean
	}

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
			Alert.alert("Error", "Por favor llena todos los campos.")
			return
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Las contraseñas no coinciden.")
			return
		}

		try {
			setStatus("BUSY")

			const data = await registerUser(email, password, shouldReset)

			if (data && data.result) {
				Alert.alert(
					"Success",
					shouldReset
						? "Su contraseña ha sido cambiada. Por favor inicia sesión."
						: "Su cuenta ha sido creada. Por favor inicia sesión."
				)
				navigation.reset({
					index: 0,
					routes: [{ name: "LoginEmail" }],
				})
				return
			} else {
				Alert.alert("Error", "No se pudo crear la cuenta.")
			}
		} catch (error: any) {
			if (__DEV__) {
				console.error(error)
			}
			Alert.alert("Error", error.message || "No se pudo crear la cuenta.")
		} finally {
			setStatus("IDLE")
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Email</Text>
			<CustomTextInput
				placeholder="Correo electrónico"
				value={email}
				readOnly
			/>

			<Text style={styles.label}>
				Ahora crea una nueva contraseña, debe contener lo siguiente:
			</Text>

			<Text style={styles.passwordGuidance}>
				• Al menos 8 caracteres{"\n"}• Minúsculas (a-z){"\n"}• Mayúsculas (A-Z)
				{"\n"}• Números (0-9)
			</Text>

			<Text style={styles.label}>Nueva Contraseña</Text>
			<InputPassword
				placeholder="Introduce tu nueva contraseña"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<Text style={styles.label}>Confirmar Contraseña</Text>
			<InputPassword
				placeholder="Repite tu nueva contraseña"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>
			<AppButton
				disabled={status === "BUSY" || !isValid}
				onPress={handleCreateAccount}
			>
				{status === "BUSY" ? "Creando..." : "Crear Cuenta"}
			</AppButton>
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
