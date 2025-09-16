// src/screens/LoginScreen.tsx
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useState } from "react"
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
import { theme } from "../../helpers/theme"
import { checkUserEmail } from "../../services/users"
import { AuthStackParamList } from "../../types/navigation"

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
		} finally {
			setStatus("IDLE")
		}

		navigation.navigate("LoginNoAccountFound", { email })
	}

	const handleLogoPress = () => {
		Alert.alert(
			"JAC Conecta",
			`Versión: 1.0.0\nBuild: ${
				__DEV__ ? "Desarrollo" : "Producción"
			}\n\nCode: ${(process.env.EXPO_PUBLIC_API_BASE_URL || "").length}/${
				(process.env.EXPO_PUBLIC_API_BASE_URL || "").length > 0
					? (process.env.EXPO_PUBLIC_API_BASE_URL || "")
							.split("")
							.slice(8, 16)
							.join("")
					: "N/A"
			}`,
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

						<CustomTextInput
							placeholder="Correo electrónico"
							value={email}
							onValueChange={setEmail}
							keyboardType="email-address"
							readOnly={status === "BUSY"}
						/>

						<AppButton
							disabled={
								status === "BUSY" ||
								email.length === 0 ||
								email.indexOf("@") === -1
							}
							onPress={handleContinue}
						>
							{status === "BUSY" ? "Por favor espera..." : "Continuar"}
						</AppButton>
					</View>
				</KeyboardAvoidingWrapper>
			</SafeAreaView>
		</>
	)
}

export default LoginScreen

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
		marginBottom: theme.spacing.xl,
		textAlign: "center",
		fontWeight: "bold",
		color: theme.colors.primary,
	},
})
