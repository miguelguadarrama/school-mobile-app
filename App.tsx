import { StyleSheet, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppLayout from "./components/Layout"
import { AuthProvider } from "./contexts/AuthContext"

import {
	useFonts,
	Nunito_400Regular,
	Nunito_700Bold,
} from "@expo-google-fonts/nunito"
import LoadingScreen from "./components/Loading"

export default function App() {
	const [fontsLoaded] = useFonts({
		Nunito_400Regular,
		Nunito_700Bold,
	})

	if (!fontsLoaded) {
		return <LoadingScreen />
	}
	return (
		<SafeAreaProvider>
			<AuthProvider>
				<View style={styles.container}>
					<AppLayout />
				</View>
			</AuthProvider>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
})
