import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { theme } from "../../helpers/theme"

export default function TeacherMessagingScreen() {
	return (
		<View style={styles.container}>
			<Text>Teacher Messaging Screen</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
})
