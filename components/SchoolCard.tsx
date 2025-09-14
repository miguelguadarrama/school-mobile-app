import { View, StyleSheet, ViewStyle } from "react-native"
import React from "react"
import { theme } from "../helpers/theme"

interface CardProps {
	children: React.ReactNode
	style?: ViewStyle
}

const SchoolCard: React.FC<CardProps> = ({ children, style }) => {
	return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		padding: theme.spacing.lg,
		overflow: "hidden",
		marginVertical: theme.spacing.xs / 2,
		...theme.shadow.card,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
})

export default SchoolCard
