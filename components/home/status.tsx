import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
	EatingStatus,
	MoodStatus,
	PeeStatus,
	PoopStatus,
} from "../../types/students"
import SchoolCard from "../SchoolCard"
import { useContext } from "react"
import AppContext from "../../contexts/AppContext"
import { getFormattedDate, normalizeDate } from "../../helpers/date"

const DailyActivityStatus: React.FC = () => {
	const { attendance, selectedStudent, selectedDate } = useContext(AppContext)!
	// Colors for positive and negative states
	const colors = {
		positive: "#4caf50", // Green for good things
		negative: "#9e9e9e", // Gray for less ideal things
	}

	// Helper function to get eating status display
	const getEatingStatus = (status?: EatingStatus) => {
		switch (status) {
			case "meal_status_no":
				return {
					icon: "sad-outline" as const,
					text: "No comió",
					isPositive: false,
				}
			case "meal_status_little":
				return {
					icon: "restaurant-outline" as const,
					text: "Poco",
					isPositive: false,
				}
			case "meal_status_ok":
				return {
					icon: "restaurant" as const,
					text: "Normal",
					isPositive: true,
				}
			default:
				return null
		}
	}

	// Helper function to get diaper status display
	const getDiaperStatus = (hadBowelMovement?: PoopStatus) => {
		if (!hadBowelMovement) return null
		return hadBowelMovement === "poop_status_yes"
			? {
					icon: "checkmark-circle" as const,
					text: "Heces",
					isPositive: true,
			  }
			: {
					icon: "close-circle-outline" as const,
					text: "Heces",
					isPositive: false,
			  }
	}

	const getPeeStatus = (hadPeeMovement?: PeeStatus) => {
		if (!hadPeeMovement) return null
		return hadPeeMovement === "pee_status_yes"
			? {
					icon: "checkmark-circle" as const,
					text: "Orina",
					isPositive: true,
			  }
			: {
					icon: "close-circle-outline" as const,
					text: "Orina",
					isPositive: false,
			  }
	}

	// Helper function to get mood status display
	const getMoodStatus = (mood?: MoodStatus) => {
		switch (mood) {
			case "mood_status_happy":
				return {
					icon: "happy-outline" as const,
					text: "Feliz",
					isPositive: true,
				}
			case "mood_status_tired":
				return {
					icon: "sad-outline" as const,
					text: "Cansado/a",
					isPositive: false,
				}
			case "mood_status_sad":
				return {
					icon: "sad-outline" as const,
					text: "Triste",
					isPositive: false,
				}
			case "mood_status_sick":
				return {
					icon: "medical-outline" as const,
					text: "Enfermo/a",
					isPositive: false,
				}
			default:
				return null
		}
	}

	const eating = getEatingStatus(
		(attendance.find(
			(a) =>
				a.classroom_student_id ===
					selectedStudent?.academic_year_classroom_students?.[0]?.id &&
				a.status_type === "meal_status" &&
				a.date === getFormattedDate(selectedDate || new Date())
		)?.status_value as EatingStatus) || undefined
	)
	const poop = getDiaperStatus(
		(attendance.find(
			(a) =>
				a.classroom_student_id ===
					selectedStudent?.academic_year_classroom_students?.[0]?.id &&
				a.status_type === "poop_status" &&
				a.date === getFormattedDate(selectedDate || new Date())
		)?.status_value as PoopStatus) || undefined
	)
	const pee = getPeeStatus(
		(attendance.find(
			(a) =>
				a.classroom_student_id ===
					selectedStudent?.academic_year_classroom_students?.[0]?.id &&
				a.status_type === "pee_status" &&
				a.date === getFormattedDate(selectedDate || new Date())
		)?.status_value as PeeStatus) || undefined
	)
	const mood = getMoodStatus(
		(attendance.find(
			(a) =>
				a.classroom_student_id ===
					selectedStudent?.academic_year_classroom_students?.[0]?.id &&
				a.status_type === "mood_status" &&
				a.date === getFormattedDate(selectedDate || new Date())
		)?.status_value as MoodStatus) || undefined
	)

	if (!mood && !eating && !poop && !pee) return null

	return (
		<SchoolCard>
			<View style={styles.statusRow}>
				{/* Mood Status */}
				{mood ? (
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
				) : null}

				{/* Eating Status */}
				{eating ? (
					<View style={styles.statusItem}>
						<Ionicons
							name={eating.icon}
							size={32}
							color={eating.isPositive ? colors.positive : colors.negative}
						/>
						<Text
							style={[
								styles.statusText,
								{
									color: eating.isPositive ? colors.positive : colors.negative,
								},
							]}
						>
							{eating.text}
						</Text>
					</View>
				) : null}

				{/* Pee Status */}
				{pee ? (
					<View style={styles.statusItem}>
						<Ionicons
							name={pee.icon}
							size={32}
							color={pee.isPositive ? colors.positive : colors.negative}
						/>
						<Text
							style={[
								styles.statusText,
								{ color: pee.isPositive ? colors.positive : colors.negative },
							]}
						>
							{pee.text}
						</Text>
					</View>
				) : null}

				{/* Diaper Status */}
				{poop ? (
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
				) : null}
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
