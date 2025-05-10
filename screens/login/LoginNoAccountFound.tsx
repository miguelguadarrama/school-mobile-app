// src/screens/NoAccountFoundScreen.tsx
import { AuthStackParamList } from "../../types/navigation"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import { Button, StyleSheet, Text, TextInput, View } from "react-native"

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
			<Text style={styles.title}>Account Not Found</Text>

			<TextInput
				value={email}
				editable={false}
				style={[styles.input, { backgroundColor: "#eee", color: "#888" }]}
			/>

			<Text style={styles.message}>
				We couldn't find an account associated with this email address.{"\n\n"}
				Only registered guardians and parents can create accounts.{"\n\n"}
				If you believe this is a mistake, please contact the school staff for
				assistance.
			</Text>

			<Button title="Return to Login" onPress={handleGoBack} />
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
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 24,
		textAlign: "center",
	},
	message: {
		fontSize: 16,
		color: "#555",
		marginBottom: 40,
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 20,
		fontSize: 16,
	},
})
