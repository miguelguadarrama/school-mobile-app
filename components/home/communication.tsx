import React, { useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Megaphone, Camera, MessageCircle } from "lucide-react-native"
import { TabContext } from "../../contexts/TabContext"

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
					<IconComponent size={20} color="#6B7280" strokeWidth={2} />
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
				IconComponent={Megaphone}
				label="Anuncios"
				count={communicationData.announcements}
				onPress={() => handlePress("announcements")}
			/>

			<CommunicationItem
				IconComponent={Camera}
				label="Blog"
				count={communicationData.socialPosts}
				onPress={() => handlePress("social")}
			/>

			<CommunicationItem
				IconComponent={MessageCircle}
				label="Mensajes"
				count={communicationData.messages}
				onPress={() => handlePress("messages")}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#F5F5F5",
		borderRadius: 12,
	},
	itemContainer: {
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	iconContainer: {
		position: "relative",
		marginBottom: 6,
	},
	iconCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
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
		color: "#FFFFFF",
		fontSize: 9,
		fontWeight: "700",
		lineHeight: 10,
	},
	label: {
		fontSize: 11,
		fontWeight: "500",
		color: "#6B7280",
		textAlign: "center",
	},
})
