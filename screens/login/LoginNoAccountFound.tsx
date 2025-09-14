// src/screens/NoAccountFoundScreen.tsx
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import { Button, StyleSheet, Text, TextInput, View } from "react-native"
import CustomTextInput from "../../components/ui/textInput"
import AppButton from "../../components/ui/button"

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
		<View style={styles.container}>
			<Text style={styles.title}>No se encontró su cuenta</Text>

			<CustomTextInput
				placeholder="Correo electrónico"
				value={email}
				readOnly
			/>

			<Text style={styles.message}>
				No pudimos encontrar una cuenta asociada con esta dirección de correo
				electrónico.{"\n\n"}
				Solo los representantes registrados pueden acceder a esta aplicación.
				{"\n\n"}
				Si crees que esto es un error, por favor contacta al personal de la
				escuela para ayuda.
			</Text>

			<AppButton onPress={handleGoBack}>Regresar a Iniciar Sesión</AppButton>
		</View>
	)
}

export default LoginNoAccountFound

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	title: {
		fontFamily: "Nunito_400Regular",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 24,
		textAlign: "center",
	},
	message: {
		fontFamily: "Nunito_400Regular",
		fontSize: 16,
		color: "#555",
		marginBottom: 40,
		textAlign: "center",
	},
	input: {
		fontFamily: "Nunito_400Regular",
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 20,
		fontSize: 16,
	},
})
