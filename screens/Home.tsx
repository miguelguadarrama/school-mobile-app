import React from "react"
import { View, Text, StyleSheet } from "react-native"
import LoadingScreen from "../components/Loading"
import useSWR from "swr"
import { SessionUser } from "../types/user"
import { student } from "../types/students"

export default function HomeScreen() {
	const { data, isLoading } = useSWR<student[]>("/mobile/profile")
	if (isLoading) {
		return <LoadingScreen />
	}
	return (
		<View style={styles.container}>
			<Text>{data?.map((u) => u.first_name).join(", ")}</Text>
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
