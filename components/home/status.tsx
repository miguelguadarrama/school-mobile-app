import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
	DailyActivityStatusProps,
	EatingStatus,
	MoodStatus,
} from "../../types/students"
import SchoolCard from "../SchoolCard"

const DailyActivityStatus: React.FC<DailyActivityStatusProps> = ({ data }) => {
	// Colors for positive and negative states
	const colors = {
		positive: "#4caf50", // Green for good things
		negative: "#9e9e9e", // Gray for less ideal things
	}

	// Helper function to get eating status display
	const getEatingStatus = (status: EatingStatus) => {
		switch (status) {
			case "none":
				return {
					icon: "sad-outline" as const,
					text: "Didn't eat",
					isPositive: false,
				}
			case "little":
				return {
					icon: "restaurant-outline" as const,
					text: "Ate a little",
					isPositive: false,
				}
			case "normal":
				return {
					icon: "restaurant" as const,
					text: "Ate well",
					isPositive: true,
				}
			case "lots":
				return {
					icon: "heart" as const,
					text: "Ate lots!",
					isPositive: true,
				}
		}
	}

	// Helper function to get diaper status display
	const getDiaperStatus = (hadBowelMovement: boolean) => {
		return hadBowelMovement
			? {
					icon: "checkmark-circle" as const,
					text: "Pooped",
					isPositive: true,
			  }
			: {
					icon: "close-circle-outline" as const,
					text: "No poop",
					isPositive: false,
			  }
	}

	// Helper function to get mood status display
	const getMoodStatus = (mood: MoodStatus) => {
		switch (mood) {
			case "happy":
				return {
					icon: "happy-outline" as const,
					text: "Happy",
					isPositive: true,
				}
			case "cuddly":
				return {
					icon: "heart" as const,
					text: "Cuddly",
					isPositive: true,
				}
			case "tired":
				return {
					icon: "bed-outline" as const,
					text: "Tired",
					isPositive: false,
				}
			case "playful":
				return {
					icon: "football-outline" as const,
					text: "Playful",
					isPositive: true,
				}
			case "sad":
				return {
					icon: "sad-outline" as const,
					text: "Sad",
					isPositive: false,
				}
			case "sick":
				return {
					icon: "medical-outline" as const,
					text: "Not feeling well",
					isPositive: false,
				}
		}
	}

	const eating = getEatingStatus(data.eating)
	const poop = getDiaperStatus(data.poop)
	const mood = getMoodStatus(data.mood)

	return (
		<SchoolCard>
			<View style={styles.statusRow}>
				{/* Mood Status */}
				<View style={styles.statusItem}>
					<Ionicons
						name={mood.icon}
						size={32}
						color={mood.isPositive ? colors.positive : colors.negative}
					/>
					<Text
						style={[
							styles.statusText,
							{ color: mood.isPositive ? colors.positive : colors.negative },
						]}
					>
						{mood.text}
					</Text>
				</View>
				{/* Eating Status */}
				<View style={styles.statusItem}>
					<Ionicons
						name={eating.icon}
						size={32}
						color={eating.isPositive ? colors.positive : colors.negative}
					/>
					<Text
						style={[
							styles.statusText,
							{ color: eating.isPositive ? colors.positive : colors.negative },
						]}
					>
						{eating.text}
					</Text>
				</View>

				{/* Diaper Status */}
				<View style={styles.statusItem}>
					<Ionicons
						name={poop.icon}
						size={32}
						color={poop.isPositive ? colors.positive : colors.negative}
					/>
					<Text
						style={[
							styles.statusText,
							{ color: poop.isPositive ? colors.positive : colors.negative },
						]}
					>
						{poop.text}
					</Text>
				</View>
			</View>
		</SchoolCard>
	)
}

const styles = StyleSheet.create({
	statusRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
	},
	statusItem: {
		alignItems: "center",
		flex: 1,
		paddingHorizontal: 4,
	},
	statusText: {
		fontSize: 13,
		fontWeight: "600",
		marginTop: 6,
		textAlign: "center",
		lineHeight: 16,
	},
})

export default DailyActivityStatus
