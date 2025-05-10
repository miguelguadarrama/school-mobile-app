import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default function OptionsScreen() {
	return (
		<View style={styles.container}>
			<Text>Options Screen</Text>
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
