import { StyleSheet, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppLayout from "./components/Layout"
import { AuthProvider } from "./contexts/AuthContext"

export default function App() {
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
