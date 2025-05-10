import React from "react"
import { View, Text, StyleSheet } from "react-native"
import LoadingScreen from "../components/Loading"
import useSWR from "swr"

export default function HomeScreen() {
	const { data, isLoading } = useSWR("/mobile/profile")
	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<View style={styles.container}>
			<Text>
				{data?.[0]?.["nombre"]} {data?.[0]?.["apellido"]}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
})
