// src/screens/SetNewPasswordScreen.tsx
import { isValidPassword, registerUser } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, View, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import InputPassword from "../../components/InputPassword"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
import { theme } from "../../helpers/theme"

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
		<>
			<StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
			<SafeAreaView style={styles.safeArea}>
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
		</SafeAreaView>
	</>
	)
}

export default LoginNewPassword

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		padding: theme.spacing.lg,
	},
	label: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		marginBottom: theme.spacing.xs,
		color: theme.colors.text,
		fontWeight: "500",
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
	passwordGuidance: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginBottom: theme.spacing.sm,
		lineHeight: 20,
		padding: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.sm,
	},
})
