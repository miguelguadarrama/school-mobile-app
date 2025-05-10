import React, { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View } from "react-native"
import StatusBar from "../components/StatusBar"
import BottomTabNavigator from "../navigation/bottomNav"

export default function AppLayout() {
	const [activeStudent, setActiveStudent] = useState({
		id: 1,
		name: "Lily Guadarrama",
		classroom: "Busy Bees",
		photo: "",
	})

	return (
		<NavigationContainer>
			<View style={styles.container}>
				{/* Isolated SafeAreaView for the StatusBar */}
				<SafeAreaView style={styles.statusBarContainer} edges={["top"]}>
					<StatusBar
						student={activeStudent}
						setActiveStudent={setActiveStudent}
					/>
				</SafeAreaView>

				{/* Main Content Container */}
				<View style={styles.contentContainer}>
					<BottomTabNavigator />
				</View>
			</View>
		</NavigationContainer>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFF",
	},
	statusBarContainer: {
		backgroundColor: "#DDD",
		paddingHorizontal: 0,
	},
	contentContainer: {
		flex: 1,
		backgroundColor: "#FFF",
	},
})
