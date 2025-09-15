// src/screens/VerifyEmailScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { Alert, StatusBar, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
import { theme } from "../../helpers/theme"
import { triggerOTP, verifyOTP } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"

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
			Alert.alert("Error", "No se pudo enviar el código de verificación.")
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
				Alert.alert("Éxito", "Tu correo electrónico ha sido verificado.")
				navigation.navigate("LoginNewPassword", { email })
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
			Alert.alert("Error", "No se pudo verificar el código.")
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
			<StatusBar
				barStyle="dark-content"
				backgroundColor={theme.colors.background}
			/>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<Text style={styles.title}>Confirma tu correo electrónico</Text>
					<CustomTextInput value={email} />

					{!sentOTP ? (
						<>
							<AppButton onPress={handleSendOTP}>Sí, enviar código</AppButton>
							<View style={{ height: 20 }} />
							<AppButton onPress={handleWrongEmail}>
								No, correo incorrecto
							</AppButton>
						</>
					) : (
						<>
							<Text style={[styles.label, { marginTop: 30 }]}>
								Introduce el código de 6 dígitos
							</Text>
							<CustomTextInput
								placeholder="Código de 6 dígitos"
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

export default LoginVerifyEmail

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
	input: {
		fontFamily: theme.typography.family.regular,
		borderWidth: 1,
		borderColor: theme.colors.border,
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		marginBottom: theme.spacing.lg,
		fontSize: theme.typography.size.md,
	},
})
