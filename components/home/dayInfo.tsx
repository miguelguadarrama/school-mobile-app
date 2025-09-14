import { Ionicons } from "@expo/vector-icons"
import React, { useContext } from "react"
import { StyleSheet, Text, View } from "react-native"
import AppContext from "../../contexts/AppContext"
import { getFormattedDate } from "../../helpers/date"
import { theme } from "../../helpers/theme"
import {
	EatingStatus,
	MoodStatus,
	PeeStatus,
	PoopStatus,
} from "../../types/students"
import SchoolCard from "../SchoolCard"
import AttendanceCard from "./attendance"

interface DayInfoCardProps {
	// We'll add props later when we connect to real data
	locale?: "es-VE" | "en-US"
}

export default function DayInfoCard({ locale = "es-VE" }: DayInfoCardProps) {
	// Get current date information
	const { selectedDate, attendance, selectedStudent } = useContext(AppContext)!
	const now = selectedDate || new Date()
	const dayName = now.toLocaleDateString(locale, { weekday: "long" })
	const monthDay = now.toLocaleDateString(locale, {
		month: "long",
		day: "numeric",
	})

	// Colors for positive and negative states
	const colors = {
		positive: theme.colors.success, // Green for good things
		negative: theme.colors.muted, // Gray for less ideal things
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
					icon: "restaurant-outline" as const,
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
					icon: "checkmark-circle-outline" as const,
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
					icon: "checkmark-circle-outline" as const,
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

	const hasAnyStatus = mood || eating || poop || pee

	return (
		<SchoolCard>
			{/* Header with date and weather side by side */}
			<View style={styles.topRow}>
				<View style={styles.dateSection}>
					<Text style={styles.dayName}>{dayName}</Text>
					<Text style={styles.date}>{monthDay}</Text>
				</View>
			</View>

			<AttendanceCard locale={locale} />

			{/* Divider and Activity Status */}
			{hasAnyStatus && (
				<>
					<View style={styles.divider} />
					<View style={styles.activitySection}>
						<Text style={styles.sectionTitle}>Estado del día</Text>
						<View style={styles.activityStatusRow}>
							{/* Mood Status */}
							{mood && (
								<View style={styles.activityStatusItem}>
									<Ionicons
										name={mood.icon}
										size={28}
										color={mood.isPositive ? colors.positive : colors.negative}
									/>
									<Text
										style={[
											styles.activityStatusText,
											{
												color: mood.isPositive
													? colors.positive
													: colors.negative,
											},
										]}
									>
										{mood.text}
									</Text>
								</View>
							)}

							{/* Eating Status */}
							{eating && (
								<View style={styles.activityStatusItem}>
									<Ionicons
										name={eating.icon}
										size={28}
										color={
											eating.isPositive ? colors.positive : colors.negative
										}
									/>
									<Text
										style={[
											styles.activityStatusText,
											{
												color: eating.isPositive
													? colors.positive
													: colors.negative,
											},
										]}
									>
										{eating.text}
									</Text>
								</View>
							)}

							{/* Pee Status */}
							{pee && (
								<View style={styles.activityStatusItem}>
									<Ionicons
										name={pee.icon}
										size={28}
										color={pee.isPositive ? colors.positive : colors.negative}
									/>
									<Text
										style={[
											styles.activityStatusText,
											{
												color: pee.isPositive
													? colors.positive
													: colors.negative,
											},
										]}
									>
										{pee.text}
									</Text>
								</View>
							)}

							{/* Diaper Status */}
							{poop && (
								<View style={styles.activityStatusItem}>
									<Ionicons
										name={poop.icon}
										size={28}
										color={poop.isPositive ? colors.positive : colors.negative}
									/>
									<Text
										style={[
											styles.activityStatusText,
											{
												color: poop.isPositive
													? colors.positive
													: colors.negative,
											},
										]}
									>
										{poop.text}
									</Text>
								</View>
							)}
						</View>
					</View>
				</>
			)}
		</SchoolCard>
	)
}

const styles = StyleSheet.create({
	topRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.sm,
	},
	dateSection: {
		flex: 1,
	},
	dayName: {
		fontFamily: theme.typography.family.bold,
		textTransform: "capitalize",
		fontSize: theme.typography.size.xl,
		fontWeight: "700",
		color: theme.colors.primary,
		marginBottom: theme.spacing.xs / 2,
	},
	date: {
		fontFamily: theme.typography.family.regular,
		textTransform: "capitalize",
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		fontWeight: "500",
	},
	weatherSection: {
		alignItems: "flex-end",
	},
	weatherInfo: {
		flexDirection: "row",
		alignItems: "center",
	},
	weatherIcon: {
		fontSize: 24,
		marginRight: theme.spacing.xs,
	},
	tempContainer: {
		alignItems: "flex-end",
	},
	temperature: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		fontWeight: "700",
		color: theme.colors.text,
		lineHeight: 20,
	},
	condition: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		fontWeight: "500",
		lineHeight: 14,
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.xs,
		paddingVertical: theme.spacing.xs,
		paddingHorizontal: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.sm,
	},
	statusIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: theme.spacing.xs,
	},
	statusText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		fontWeight: "600",
		color: theme.colors.text,
	},
	clothingTip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		borderLeftWidth: 3,
		borderLeftColor: theme.colors.accent4,
	},
	clothingIcon: {
		fontSize: 16,
		marginRight: theme.spacing.xs,
	},
	clothingText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.accent4,
		fontWeight: "500",
		flex: 1,
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginVertical: theme.spacing.sm,
	},
	activitySection: {
		marginTop: 0,
	},
	sectionTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
		textAlign: "center",
	},
	activityStatusRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
	},
	activityStatusItem: {
		alignItems: "center",
		flex: 1,
		paddingHorizontal: theme.spacing.sm,
	},
	activityStatusText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		fontWeight: "600",
		marginTop: theme.spacing.sm,
		textAlign: "center",
		lineHeight: 16,
	},
})
