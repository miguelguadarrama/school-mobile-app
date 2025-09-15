import { LucideBell, LucideImages } from "lucide-react-native"
import React, { useContext } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TabContext } from "../../contexts/TabContext"
import { theme } from "../../helpers/theme"

interface CommunicationData {
	announcements: number
	socialPosts: number
	messages: number
}

interface CommunicationBarProps {
	// We'll add props later when we connect to real data
}

export default function CommunicationBar({}: CommunicationBarProps) {
	const { navigateToTab } = useContext(TabContext)
	// Static data for demonstration
	const communicationData: CommunicationData = {
		announcements: 0,
		socialPosts: 0,
		messages: 0,
	}

	const handlePress = (type: string) => {
		// Handle navigation to specific tab
		console.log(`Navigate to ${type} tab`)
		switch (type) {
			case "announcements":
				// Navigate to announcements screen
				navigateToTab(0) // Assuming announcements is the first tab
				break
			case "social":
				// Navigate to social posts screen
				navigateToTab(1) // Assuming social is the second tab
				break
			case "messages":
				// Navigate to messages screen
				navigateToTab(3) // Assuming messages is the fourth tab
				break
			default:
				console.warn("Unknown type:", type)
				break
		}
	}

	const CommunicationItem = ({
		IconComponent,
		label,
		count,
		onPress,
	}: {
		IconComponent: React.ComponentType<any>
		label: string
		count: number
		onPress: () => void
	}) => (
		<TouchableOpacity style={styles.itemContainer} onPress={onPress}>
			<View style={styles.iconContainer}>
				<View style={styles.iconCircle}>
					<IconComponent
						size={22}
						color={theme.colors.primary}
						strokeWidth={2}
					/>
				</View>
				{count > 0 && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
					</View>
				)}
			</View>
			<Text style={styles.label}>{label}</Text>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<CommunicationItem
				IconComponent={LucideBell}
				label="Anuncios"
				count={communicationData.announcements}
				onPress={() => handlePress("announcements")}
			/>

			<CommunicationItem
				IconComponent={LucideImages}
				label="Social"
				count={communicationData.socialPosts}
				onPress={() => handlePress("social")}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...theme.shadow.card,
	},
	itemContainer: {
		alignItems: "center",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		flex: 1,
	},
	iconContainer: {
		position: "relative",
		marginBottom: 6,
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -6,
		backgroundColor: "#EF4444",
		borderRadius: 8,
		minWidth: 16,
		height: 16,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	badgeText: {
		color: theme.colors.white,
		fontSize: 9,
		fontWeight: "700",
		lineHeight: 10,
		fontFamily: "Nunito_400Regular",
	},
	label: {
		fontSize: theme.typography.size.sm,
		fontWeight: "500",
		color: theme.colors.text,
		textAlign: "center",
		fontFamily: theme.typography.family.regular,
		marginTop: theme.spacing.xs,
	},
})
