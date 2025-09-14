import { View, StyleSheet, ViewStyle } from "react-native"
import React from "react"

interface CardProps {
	children: React.ReactNode
	style?: ViewStyle
}

const SchoolCard: React.FC<CardProps> = ({ children, style }) => {
	return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#ffffff",
		borderRadius: 12,
		padding: 16,
		overflow: "hidden",
		marginVertical: 2,
		shadowColor: "#000", // Shadow color for iOS
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1, // iOS shadow
		shadowRadius: 2, // iOS shadow
		elevation: 2, // For Android shadow
	},
})

export default SchoolCard
