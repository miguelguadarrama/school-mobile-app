// src/screens/NoAccountFoundScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import { StatusBar, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AppButton from "../../components/ui/button"
import CustomTextInput from "../../components/ui/textInput"
import { theme } from "../../helpers/theme"
import { AuthStackParamList } from "../../types/navigation"

type NoAccountFoundScreenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	"LoginNoAccountFound"
>

const LoginNoAccountFound = () => {
	const { email } = useRoute().params as { email: string }
	const navigation = useNavigation<NoAccountFoundScreenNavigationProp>()

	const handleGoBack = () => {
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
					<Text style={styles.title}>No se encontró su cuenta</Text>

					<CustomTextInput
						placeholder="Correo electrónico"
						value={email}
						readOnly
					/>

					<Text style={styles.message}>
						No pudimos encontrar una cuenta asociada con esta dirección de
						correo electrónico.{"\n\n"}
						Solo los representantes registrados pueden acceder a esta
						aplicación.
						{"\n\n"}
						Si crees que esto es un error, por favor contacta al personal de la
						escuela para ayuda.
					</Text>

					<AppButton onPress={handleGoBack}>
						Regresar a Iniciar Sesión
					</AppButton>
				</View>
			</SafeAreaView>
		</>
	)
}

export default LoginNoAccountFound

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		padding: theme.spacing.xl,
	},
	title: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		marginBottom: theme.spacing.xl,
		textAlign: "center",
		color: theme.colors.primary,
	},
	message: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		marginBottom: theme.spacing.xl * 2,
		textAlign: "center",
		lineHeight: 22,
		padding: theme.spacing.lg,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.lg,
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
