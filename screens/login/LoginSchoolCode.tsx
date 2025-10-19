// src/screens/login/LoginSchoolCode.tsx
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import * as SecureStore from "expo-secure-store"
import React, { useEffect, useState } from "react"
import {
	Alert,
	Image,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AppButton from "../../components/ui/button"
import KeyboardAvoidingWrapper from "../../components/ui/KeyboardAvoidingWrapper"
import CustomTextInput from "../../components/ui/textInput"
import { LoadingDialog } from "../../components/ui/LoadingDialog"
import { theme } from "../../helpers/theme"
import { AuthStackParamList } from "../../types/navigation"

type LoginSchoolCodeNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginSchoolCode"
>

// Hard-coded school passcode
const SCHOOL_CODE = "jac1610"
const SCHOOL_CODE_VALIDATED_KEY = "school_code_validated"

const LoginSchoolCode = () => {
	const [code, setCode] = useState("")
	const [status, setStatus] = useState<"IDLE" | "BUSY" | "CHECKING">("CHECKING")
	const navigation = useNavigation<LoginSchoolCodeNavigationProp>()

	// Check if school code was previously validated
	useEffect(() => {
		const checkPreviousValidation = async () => {
			try {
				const validated = await SecureStore.getItemAsync(SCHOOL_CODE_VALIDATED_KEY)
				if (validated === SCHOOL_CODE) {
					// School code was previously validated, skip this screen
					navigation.replace("LoginEmail")
					return
				}
			} catch (error) {
				console.error("Error checking school code validation:", error)
			} finally {
				setStatus("IDLE")
			}
		}

		checkPreviousValidation()
	}, [navigation])

	const handleContinue = async () => {
		setStatus("BUSY")

		// Add a 2-second fake loading delay
		await new Promise(resolve => setTimeout(resolve, 2000))

		// Validate the school code
		if (code.toLowerCase() === SCHOOL_CODE) {
			try {
				// Save the validated school code to SecureStore
				await SecureStore.setItemAsync(SCHOOL_CODE_VALIDATED_KEY, SCHOOL_CODE)
			} catch (error) {
				console.error("Error saving school code validation:", error)
			}

			// Code is correct, navigate to email entry
			navigation.navigate("LoginEmail")
		} else {
			// Code is incorrect, show error
			Alert.alert(
				"Código Incorrecto",
				"El código de escuela ingresado no es válido. Por favor, verifica e intenta nuevamente.",
				[{ text: "OK" }]
			)
		}

		setStatus("IDLE")
	}

	const handleLogoPress = () => {
		Alert.alert(
			"JAC Conecta",
			`Versión: 1.0.0\nBuild: ${__DEV__ ? "Desarrollo" : "Producción"}`,
			[{ text: "OK" }]
		)
	}

	return (
		<>
			<StatusBar
				barStyle="dark-content"
				backgroundColor={theme.colors.background}
			/>
			<SafeAreaView style={styles.safeArea}>
				<KeyboardAvoidingWrapper>
					<View style={styles.container}>
						<View style={styles.logoContainer}>
							<TouchableOpacity onPress={handleLogoPress}>
								<Image
									source={require("../../assets/ic_launcher-playstore.png")}
									style={styles.logo}
								/>
							</TouchableOpacity>
						</View>
						<Text style={styles.title}>Bienvenido a JAC</Text>
						<Text style={styles.subtitle}>
							Ingresa el código de tu escuela para continuar
						</Text>

						<CustomTextInput
							placeholder="Código de Escuela"
							value={code}
							onValueChange={setCode}
							keyboardType="default"
							readOnly={status === "BUSY"}
						/>

						<AppButton
							disabled={status === "BUSY" || status === "CHECKING" || code.length === 0}
							onPress={handleContinue}
						>
							{status === "BUSY" ? "Por favor espera..." : status === "CHECKING" ? "Cargando..." : "Continuar"}
						</AppButton>
					</View>
				</KeyboardAvoidingWrapper>
			</SafeAreaView>

			<LoadingDialog
				visible={status === "BUSY"}
				message="Verificando código..."
			/>
		</>
	)
}

export default LoginSchoolCode

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	container: {
		flex: 1,
		justifyContent: "flex-start",
		marginTop: "15%",
		padding: theme.spacing.lg,
	},
	logoContainer: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.xl,
		padding: theme.spacing.lg,
		alignSelf: "center",
		marginBottom: theme.spacing.xl,
		...theme.shadow.card,
	},
	logo: {
		width: 160,
		height: 160,
		alignSelf: "center",
	},
	title: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xxl,
		marginBottom: theme.spacing.sm,
		textAlign: "center",
		fontWeight: "bold",
		color: theme.colors.primary,
	},
	subtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		marginBottom: theme.spacing.xl,
		textAlign: "center",
		color: theme.colors.muted,
	},
})
