import React from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"

interface LoadingScreenProps {
	message?: string
	backgroundColor?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message,
	backgroundColor = "#FFF",
}) => {
	return (
		<View style={[styles.container, { backgroundColor }]}>
			<ActivityIndicator size="large" color="#007AFF" />
			{message && <Text style={styles.message}>{message}</Text>}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	message: {
		marginTop: 16,
		fontSize: 16,
		color: "#333",
	},
})

export default LoadingScreen
