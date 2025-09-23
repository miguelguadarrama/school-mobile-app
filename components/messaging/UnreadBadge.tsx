import React from "react"
import { Text, View, StyleSheet } from "react-native"
import { theme } from "../../helpers/theme"

interface UnreadBadgeProps {
	count: number
	maxCount?: number
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
	count,
	maxCount = 99,
}) => {
	if (count <= 0) return null

	const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

	return (
		<View style={styles.badge}>
			<Text style={styles.badgeText}>{displayCount}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	badge: {
		backgroundColor: "#ef4444",
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 6,
		marginRight: theme.spacing.xs,
	},
	badgeText: {
		color: theme.colors.white,
		fontSize: 12,
		fontWeight: "600",
		fontFamily: theme.typography.family.bold,
	},
})