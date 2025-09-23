import React from "react"
import { Text, View, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"

interface SectionHeaderProps {
	title: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
	return (
		<View style={styles.sectionHeader}>
			<Text style={styles.sectionTitle}>{title}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	sectionHeader: {
		paddingVertical: theme.spacing.md,
		paddingTop: theme.spacing.lg,
	},
	sectionTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.primary,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
})