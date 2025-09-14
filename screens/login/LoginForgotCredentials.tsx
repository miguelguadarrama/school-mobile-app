// src/screens/VerifyEmailScreen.tsx
import { triggerOTP, verifyOTP } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { Alert, StyleSheet, Text, View, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
import { theme } from "../../helpers/theme"

type VerifyEmailScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginVerifyEmail"
>

const LoginForgotCredentials = () => {
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
					"Código de verificación enviado",
					`Hemos enviado un código de verificación a ${email}.`
				)
				setStatus("IDLE")
			} else {
				Alert.alert(
					"Error",
					`No se pudo enviar el código de verificación a ${email}.`
				)
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
			Alert.alert("Error", "Ocurrió un error.")
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
				console.log("Verificando OTP", otpCode)
			}
			const data = await verifyOTP(email, otpCode)

			if (data && data.result) {
				Alert.alert("Éxito", "Tu correo electrónico ha sido verificado.")
				navigation.navigate("LoginNewPassword", { email, shouldReset: true })
				return
			} else {
				Alert.alert(
					"Código inválido",
					"El código que ingresaste es incorrecto."
				)
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
		<>
			<StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<Text style={styles.title}>Verificar correo electrónico</Text>
			<CustomTextInput
				placeholder="Correo electrónico"
				value={email}
				readOnly
			/>

			{!sentOTP ? (
				<>
					<AppButton disabled={status === "BUSY"} onPress={handleSendOTP}>
						Sí, enviar código
					</AppButton>
					<View style={{ height: 20 }} />
					<AppButton
						disabled={status === "BUSY"}
						onPress={handleWrongEmail}
						variant="secondary"
					>
						No, correo incorrecto
					</AppButton>
				</>
			) : (
				<>
					<Text style={[styles.label, { marginTop: 30 }]}>
						Introduce el código de 6 dígitos
					</Text>
					<CustomTextInput
						placeholder="Código de verificación"
						value={otpCode}
						onValueChange={setOtpCode}
						maxLength={6}
						keyboardType="numeric"
						readOnly={status === "BUSY"}
					/>
					<AppButton
						disabled={!otpCode || otpCode.length !== 6 || status === "BUSY"}
						onPress={handleVerifyOTP}
					>
						{status === "BUSY" ? "Verificando..." : "Verificar código"}
					</AppButton>
				</>
				)}
			</View>
		</SafeAreaView>
	</>
	)
}

export default LoginForgotCredentials

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
	title: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		marginBottom: theme.spacing.lg,
		color: theme.colors.primary,
		textAlign: "center",
		fontWeight: "bold",
	},
	label: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.lg,
		marginBottom: theme.spacing.xs,
		color: theme.colors.text,
		fontWeight: "500",
	},
})
