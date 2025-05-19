import React from "react"
import { View, Text, StyleSheet } from "react-native"
import LoadingScreen from "../components/Loading"
import useSWR from "swr"
import { SessionUser } from "../types/user"
import { student } from "../types/students"
import { SafeAreaView } from "react-native-safe-area-context"
import StatusBar from "../components/StatusBar"

export default function HomeScreen() {
	const { data, isLoading } = useSWR<student[]>("/mobile/profile")
	if (isLoading) {
		return <LoadingScreen />
	}
	return (
		<>
			<SafeAreaView style={styles.statusBarContainer} edges={["top"]}>
				<StatusBar />
			</SafeAreaView>
			<View style={styles.container}>
				{/* Isolated SafeAreaView for the StatusBar */}

				<Text>Lily</Text>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	statusBarContainer: {
		backgroundColor: "#DDD",
		paddingHorizontal: 0,
	},
})
