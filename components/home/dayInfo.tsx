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
		year: "numeric",
	})

	// Colors for positive, negative, neutral, and missing states
	const colors = {
		positive: theme.colors.success, // Green for good things
		negative: "#EF4444", // Red for negative things
		neutral: "#F59E0B", // Yellow/orange for in-between states
		missing: theme.colors.muted, // Gray for missing data
	}

	// Helper function to get eating status display
	const getEatingStatus = (status?: EatingStatus) => {
		switch (status) {
			case "meal_status_no":
				return {
					icon: "close-circle-outline" as const,
					text: "No comió",
					isPositive: false,
					isNeutral: false,
					isMissing: false,
				}
			case "meal_status_little":
				return {
					icon: "radio-button-on-outline" as const,
					text: "Poco",
					isPositive: false,
					isNeutral: true,
					isMissing: false,
				}
			case "meal_status_ok":
				return {
					icon: "checkmark-circle-outline" as const,
					text: "Comida",
					isPositive: true,
					isNeutral: false,
					isMissing: false,
				}
			default:
				return {
					icon: "ellipse-outline" as const,
					text: "Comida",
					isPositive: false,
					isNeutral: false,
					isMissing: true,
				}
		}
	}

	// Helper function to get diaper status display
	const getDiaperStatus = (hadBowelMovement?: PoopStatus) => {
		switch (hadBowelMovement) {
			case "poop_status_yes":
				return {
					icon: "checkmark-circle-outline" as const,
					text: "Heces",
					isPositive: true,
					isNeutral: false,
					isMissing: false,
				}
			case "poop_status_no":
				return {
					icon: "close-circle-outline" as const,
					text: "Heces",
					isPositive: false,
					isNeutral: false,
					isMissing: false,
				}
			default:
				return {
					icon: "ellipse-outline" as const,
					text: "Heces",
					isPositive: false,
					isNeutral: false,
					isMissing: true,
				}
		}
	}

	const getPeeStatus = (hadPeeMovement?: PeeStatus) => {
		switch (hadPeeMovement) {
			case "pee_status_yes":
				return {
					icon: "checkmark-circle-outline" as const,
					text: "Orina",
					isPositive: true,
					isNeutral: false,
					isMissing: false,
				}
			case "pee_status_no":
				return {
					icon: "close-circle-outline" as const,
					text: "Orina",
					isPositive: false,
					isNeutral: false,
					isMissing: false,
				}
			default:
				return {
					icon: "ellipse-outline" as const,
					text: "Orina",
					isPositive: false,
					isNeutral: false,
					isMissing: true,
				}
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
					isNeutral: false,
					isMissing: false,
				}
			case "mood_status_tired":
				return {
					icon: "sad-outline" as const,
					text: "Cansado/a",
					isPositive: false,
					isNeutral: true,
					isMissing: false,
				}
			case "mood_status_sad":
				return {
					icon: "sad-outline" as const,
					text: "Triste",
					isPositive: false,
					isNeutral: false,
					isMissing: false,
				}
			case "mood_status_sick":
				return {
					icon: "medical-outline" as const,
					text: "Enfermo/a",
					isPositive: false,
					isNeutral: false,
					isMissing: false,
				}
			default:
				return {
					icon: "ellipse-outline" as const,
					text: "Estado",
					isPositive: false,
					isNeutral: false,
					isMissing: true,
				}
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

	// Create array of status items - all items are always present now
	const statusItems = [mood, eating, pee, poop]

	// Check if all statuses are missing (empty state)
	const allStatusesMissing = statusItems.every(status => status.isMissing)

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
			<View style={styles.divider} />
			<View style={styles.activitySection}>
				<Text style={styles.sectionTitle}>Información del día</Text>
				{allStatusesMissing ? (
					<View style={styles.emptyStateContainer}>
						<Text style={styles.emptyStateText}>
							No hay actualizaciones por el momento
						</Text>
					</View>
				) : (
					<View style={styles.activityStatusGrid}>
						{statusItems.map((status, index) => (
							<View
								key={index}
								style={[
									styles.activityStatusItem,
									styles.activityStatusGridItem,
								]}
							>
								<Ionicons
									name={status.icon}
									size={28}
									color={
										status.isMissing
											? colors.missing
											: status.isNeutral
											? colors.neutral
											: status.isPositive
											? colors.positive
											: colors.negative
									}
								/>
								<Text
									style={[
										styles.activityStatusText,
										{
											color: status.isMissing
												? colors.missing
												: status.isNeutral
												? colors.neutral
												: status.isPositive
												? colors.positive
												: colors.negative,
										},
									]}
								>
									{status.text}
								</Text>
							</View>
						))}
					</View>
				)}
			</View>
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
	activityStatusGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		alignItems: "center",
	},
	activityStatusItem: {
		alignItems: "center",
		flex: 1,
		paddingHorizontal: theme.spacing.sm,
	},
	activityStatusGridItem: {
		flex: 0,
		width: "45%",
		marginBottom: theme.spacing.md,
		paddingHorizontal: theme.spacing.xs,
	},
	activityStatusText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		fontWeight: "600",
		marginTop: theme.spacing.sm,
		textAlign: "center",
		lineHeight: 16,
	},
	emptyStateContainer: {
		paddingVertical: theme.spacing.lg,
		paddingHorizontal: theme.spacing.md,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyStateText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		textAlign: "center",
		fontStyle: "italic",
	},
})
