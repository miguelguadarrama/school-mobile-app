import { Ionicons } from "@expo/vector-icons"
import { LucideCheck, LucideClock, LucideX } from "lucide-react-native"
import React, { useContext, useEffect, useMemo, useState } from "react"
import {
	BackHandler,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import useSWR from "swr"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"
import {
	attendanceStatus,
	EatingStatus,
	MoodStatus,
	PeeStatus,
	PoopStatus,
} from "../../types/students"
import LoadingScreen from "../Loading"
import { AttendanceModalHeader } from "./AttendanceModalHeader"

interface AttendanceModalProps {
	onBack: () => void
}

interface DayItem {
	date: string
	dateObj: Date
	dayName: string
	dayNumber: number
	monthName: string
	isWeekend: boolean
	attendanceStatus?: string
	moodStatus?: string
	mealStatus?: string
	peeStatus?: string
	poopStatus?: string
}

interface WeekItem {
	weekNumber: number
	days: DayItem[]
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ onBack }) => {
	const { selectedStudent, academic_year } = useContext(AppContext)!
	const { data, isLoading } = useSWR<attendanceStatus[]>(
		selectedStudent?.id
			? `/mobile/students/${selectedStudent.id}/attendance`
			: null
	)
	const [expandedDay, setExpandedDay] = useState<string | null>(null)

	useEffect(() => {
		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	// Generate weeks with days grouped together
	const weeks = useMemo<WeekItem[]>(() => {
		if (!academic_year?.starts_on) return []

		const startDate = new Date(academic_year.starts_on)
		const today = new Date()

		// Set to start of day
		startDate.setHours(0, 0, 0, 0)
		today.setHours(0, 0, 0, 0)

		// Find the Sunday before or on the start date
		const firstSunday = new Date(startDate)
		const dayOfWeek = firstSunday.getDay()
		if (dayOfWeek !== 0) {
			firstSunday.setDate(firstSunday.getDate() - dayOfWeek)
		}

		const allDays: DayItem[] = []
		let currentDate = new Date(firstSunday)

		// Generate all days from first Sunday to today
		while (currentDate <= today) {
			const dateObj = new Date(currentDate)
			const year = dateObj.getFullYear()
			const month = String(dateObj.getMonth() + 1).padStart(2, "0")
			const day = String(dateObj.getDate()).padStart(2, "0")
			const dateString = `${year}-${month}-${day}`

			const dayOfWeek = dateObj.getDay()
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

			// Find all status types for this date (normalize data dates for comparison)
			const attendanceRecord = data?.find((a) => {
				const recordDate = new Date(a.date)
				recordDate.setHours(0, 0, 0, 0)
				const recordDateString = `${recordDate.getFullYear()}-${String(
					recordDate.getMonth() + 1
				).padStart(2, "0")}-${String(recordDate.getDate()).padStart(2, "0")}`
				return (
					recordDateString === dateString &&
					a.status_type === "attendance_status"
				)
			})
			const moodRecord = data?.find((a) => {
				const recordDate = new Date(a.date)
				recordDate.setHours(0, 0, 0, 0)
				const recordDateString = `${recordDate.getFullYear()}-${String(
					recordDate.getMonth() + 1
				).padStart(2, "0")}-${String(recordDate.getDate()).padStart(2, "0")}`
				return (
					recordDateString === dateString && a.status_type === "mood_status"
				)
			})
			const mealRecord = data?.find((a) => {
				const recordDate = new Date(a.date)
				recordDate.setHours(0, 0, 0, 0)
				const recordDateString = `${recordDate.getFullYear()}-${String(
					recordDate.getMonth() + 1
				).padStart(2, "0")}-${String(recordDate.getDate()).padStart(2, "0")}`
				return (
					recordDateString === dateString && a.status_type === "meal_status"
				)
			})
			const peeRecord = data?.find((a) => {
				const recordDate = new Date(a.date)
				recordDate.setHours(0, 0, 0, 0)
				const recordDateString = `${recordDate.getFullYear()}-${String(
					recordDate.getMonth() + 1
				).padStart(2, "0")}-${String(recordDate.getDate()).padStart(2, "0")}`
				return recordDateString === dateString && a.status_type === "pee_status"
			})
			const poopRecord = data?.find((a) => {
				const recordDate = new Date(a.date)
				recordDate.setHours(0, 0, 0, 0)
				const recordDateString = `${recordDate.getFullYear()}-${String(
					recordDate.getMonth() + 1
				).padStart(2, "0")}-${String(recordDate.getDate()).padStart(2, "0")}`
				return (
					recordDateString === dateString && a.status_type === "poop_status"
				)
			})

			allDays.push({
				date: dateString,
				dateObj: new Date(dateObj),
				dayName: dateObj.toLocaleDateString("es-VE", { weekday: "long" }),
				dayNumber: dateObj.getDate(),
				monthName: dateObj.toLocaleDateString("es-VE", { month: "long" }),
				isWeekend,
				attendanceStatus: attendanceRecord?.status_value,
				moodStatus: moodRecord?.status_value,
				mealStatus: mealRecord?.status_value,
				peeStatus: peeRecord?.status_value,
				poopStatus: poopRecord?.status_value,
			})

			currentDate.setDate(currentDate.getDate() + 1)
		}

		// Group days into weeks (Sunday to Saturday)
		const weekGroups: WeekItem[] = []
		let currentWeek: DayItem[] = []
		let weekNumber = 1

		for (const day of allDays) {
			currentWeek.push(day)

			// If it's Saturday or the last day, complete the week
			if (
				day.dateObj.getDay() === 6 ||
				day.dateObj.getTime() === today.getTime()
			) {
				weekGroups.push({
					weekNumber,
					days: [...currentWeek],
				})
				currentWeek = []
				weekNumber++
			}
		}

		// Reverse so most recent week is first
		weekGroups.reverse()

		// Reverse days within each week so most recent day is first
		weekGroups.forEach((week) => {
			week.days.reverse()
		})

		return weekGroups
	}, [academic_year?.starts_on, data])

	// Colors for status states
	const colors = {
		positive: theme.colors.success,
		negative: "#EF4444",
		neutral: "#F59E0B",
		missing: theme.colors.gray,
	}

	const getAttendanceStatusColor = (status?: string) => {
		switch (status) {
			case "attendance_status_present":
				return theme.colors.success
			case "attendance_status_late":
				return theme.colors.warning
			case "attendance_status_absent":
				return theme.colors.danger
			default:
				return theme.colors.gray
		}
	}

	const getAttendanceStatusIcon = (status?: string) => {
		switch (status) {
			case "attendance_status_present":
				return LucideCheck
			case "attendance_status_late":
				return LucideClock
			case "attendance_status_absent":
				return LucideX
			default:
				return null
		}
	}

	const getMoodIcon = (mood?: MoodStatus) => {
		switch (mood) {
			case "mood_status_happy":
				return { icon: "happy-outline" as const, color: colors.positive }
			case "mood_status_tired":
				return { icon: "sad-outline" as const, color: colors.neutral }
			case "mood_status_sad":
				return { icon: "sad-outline" as const, color: colors.negative }
			case "mood_status_sick":
				return { icon: "medical-outline" as const, color: colors.negative }
			default:
				return { icon: "ellipse-outline" as const, color: colors.missing }
		}
	}

	const getMealIcon = (status?: EatingStatus) => {
		switch (status) {
			case "meal_status_ok":
				return {
					icon: "checkmark-circle-outline" as const,
					color: colors.positive,
				}
			case "meal_status_little":
				return {
					icon: "radio-button-on-outline" as const,
					color: colors.neutral,
				}
			case "meal_status_no":
				return { icon: "close-circle-outline" as const, color: colors.negative }
			default:
				return { icon: "ellipse-outline" as const, color: colors.missing }
		}
	}

	const getPeeIcon = (status?: PeeStatus) => {
		switch (status) {
			case "pee_status_yes":
				return {
					icon: "checkmark-circle-outline" as const,
					color: colors.positive,
				}
			case "pee_status_no":
				return { icon: "close-circle-outline" as const, color: colors.negative }
			default:
				return { icon: "ellipse-outline" as const, color: colors.missing }
		}
	}

	const getPoopIcon = (status?: PoopStatus) => {
		switch (status) {
			case "poop_status_yes":
				return {
					icon: "checkmark-circle-outline" as const,
					color: colors.positive,
				}
			case "poop_status_no":
				return { icon: "close-circle-outline" as const, color: colors.negative }
			default:
				return { icon: "ellipse-outline" as const, color: colors.missing }
		}
	}

	const getStatusLabel = (type: string, value?: string) => {
		if (!value) return "Sin registro"

		switch (type) {
			case "attendance":
				switch (value) {
					case "attendance_status_present":
						return "Presente"
					case "attendance_status_late":
						return "Llegó tarde"
					case "attendance_status_absent":
						return "Ausente"
					default:
						return "Sin registro"
				}
			case "mood":
				switch (value) {
					case "mood_status_happy":
						return "Feliz"
					case "mood_status_tired":
						return "Cansado/a"
					case "mood_status_sad":
						return "Triste"
					case "mood_status_sick":
						return "Enfermo/a"
					default:
						return "Sin registro"
				}
			case "meal":
				switch (value) {
					case "meal_status_ok":
						return "Comió bien"
					case "meal_status_little":
						return "Comió poco"
					case "meal_status_no":
						return "No comió"
					default:
						return "Sin registro"
				}
			case "pee":
				switch (value) {
					case "pee_status_yes":
						return "Sí"
					case "pee_status_no":
						return "No"
					default:
						return "Sin registro"
				}
			case "poop":
				switch (value) {
					case "poop_status_yes":
						return "Sí"
					case "poop_status_no":
						return "No"
					default:
						return "Sin registro"
				}
			default:
				return "Sin registro"
		}
	}

	const renderWeek = ({ item: week }: { item: WeekItem }) => {
		return (
			<View style={styles.weekCard}>
				<View style={styles.weekHeader}>
					<Text style={styles.weekHeaderText}>Semana {week.weekNumber}</Text>
				</View>
				{week.days.map((day, index) => {
					const AttendanceIcon = getAttendanceStatusIcon(day.attendanceStatus)
					const mood = getMoodIcon(day.moodStatus as MoodStatus)
					const meal = getMealIcon(day.mealStatus as EatingStatus)
					const pee = getPeeIcon(day.peeStatus as PeeStatus)
					const poop = getPoopIcon(day.poopStatus as PoopStatus)
					const isLastDay = index === week.days.length - 1
					const isExpanded = expandedDay === day.date

					return (
						<View key={day.date}>
							<TouchableOpacity
								style={[styles.dayRow, day.isWeekend && styles.weekendDay]}
								onPress={() => setExpandedDay(isExpanded ? null : day.date)}
								activeOpacity={0.7}
							>
								<View style={styles.dayInfo}>
									<Text
										style={[
											styles.dayName,
											day.isWeekend && styles.weekendText,
										]}
									>
										{day.dayName}
									</Text>
									<Text
										style={[
											styles.dateText,
											day.isWeekend && styles.weekendText,
										]}
									>
										{day.dayNumber} de {day.monthName}
									</Text>
								</View>

								<View style={styles.statusesContainer}>
									{/* Attendance */}
									<View
										style={[
											styles.attendanceIndicator,
											{
												backgroundColor: getAttendanceStatusColor(
													day.attendanceStatus
												),
											},
										]}
									>
										{AttendanceIcon && (
											<AttendanceIcon size={14} color={theme.colors.white} />
										)}
									</View>

									{/* Other statuses */}
									<View style={styles.miniStatusesRow}>
										<Ionicons name={mood.icon} size={18} color={mood.color} />
										<Ionicons name={meal.icon} size={18} color={meal.color} />
										<Ionicons name={pee.icon} size={18} color={pee.color} />
										<Ionicons name={poop.icon} size={18} color={poop.color} />
									</View>
								</View>
							</TouchableOpacity>

							{/* Expanded Details */}
							{isExpanded && (
								<View style={styles.expandedSection}>
									{/* Attendance */}
									<View style={styles.statusDetail}>
										<View style={styles.statusDetailIcon}>
											<View
												style={[
													styles.largeAttendanceIndicator,
													{
														backgroundColor: getAttendanceStatusColor(
															day.attendanceStatus
														),
													},
												]}
											>
												{AttendanceIcon && (
													<AttendanceIcon
														size={24}
														color={theme.colors.white}
													/>
												)}
											</View>
										</View>
										<View style={styles.statusDetailText}>
											<Text style={styles.statusDetailLabel}>Asistencia</Text>
											<Text style={styles.statusDetailValue}>
												{getStatusLabel("attendance", day.attendanceStatus)}
											</Text>
										</View>
									</View>

									{/* Mood */}
									<View style={styles.statusDetail}>
										<View style={styles.statusDetailIcon}>
											<Ionicons name={mood.icon} size={32} color={mood.color} />
										</View>
										<View style={styles.statusDetailText}>
											<Text style={styles.statusDetailLabel}>
												Estado de ánimo
											</Text>
											<Text style={styles.statusDetailValue}>
												{getStatusLabel("mood", day.moodStatus)}
											</Text>
										</View>
									</View>

									{/* Meal */}
									<View style={styles.statusDetail}>
										<View style={styles.statusDetailIcon}>
											<Ionicons name={meal.icon} size={32} color={meal.color} />
										</View>
										<View style={styles.statusDetailText}>
											<Text style={styles.statusDetailLabel}>Comida</Text>
											<Text style={styles.statusDetailValue}>
												{getStatusLabel("meal", day.mealStatus)}
											</Text>
										</View>
									</View>

									{/* Pee */}
									<View style={styles.statusDetail}>
										<View style={styles.statusDetailIcon}>
											<Ionicons name={pee.icon} size={32} color={pee.color} />
										</View>
										<View style={styles.statusDetailText}>
											<Text style={styles.statusDetailLabel}>Orina</Text>
											<Text style={styles.statusDetailValue}>
												{getStatusLabel("pee", day.peeStatus)}
											</Text>
										</View>
									</View>

									{/* Poop */}
									<View style={styles.statusDetail}>
										<View style={styles.statusDetailIcon}>
											<Ionicons name={poop.icon} size={32} color={poop.color} />
										</View>
										<View style={styles.statusDetailText}>
											<Text style={styles.statusDetailLabel}>Heces</Text>
											<Text style={styles.statusDetailValue}>
												{getStatusLabel("poop", day.poopStatus)}
											</Text>
										</View>
									</View>
								</View>
							)}

							{!isLastDay && <View style={styles.daySeparator} />}
						</View>
					)
				})}
			</View>
		)
	}

	if (isLoading) {
		return (
			<View style={styles.modalContainer}>
				<AttendanceModalHeader onBack={onBack} />
				<LoadingScreen />
			</View>
		)
	}

	return (
		<View style={styles.modalContainer}>
			<AttendanceModalHeader onBack={onBack} />

			<FlatList
				data={weeks}
				renderItem={renderWeek}
				keyExtractor={(item) => `week-${item.weekNumber}`}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={true}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
	},
	listContent: {
		padding: theme.spacing.md,
		paddingBottom: theme.spacing.xl,
	},
	weekCard: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		marginBottom: theme.spacing.md,
		overflow: "hidden",
		...theme.shadow.soft,
	},
	weekHeader: {
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		backgroundColor: theme.colors.primary,
	},
	weekHeaderText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.white,
		textAlign: "center",
	},
	dayRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing.md,
		backgroundColor: theme.colors.white,
	},
	weekendDay: {
		backgroundColor: theme.colors["light-gray"],
	},
	daySeparator: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginHorizontal: theme.spacing.md,
	},
	dayInfo: {
		flex: 1,
	},
	dayName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		textTransform: "capitalize",
		marginBottom: 2,
	},
	dateText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		textTransform: "capitalize",
	},
	weekendText: {
		color: theme.colors.muted,
	},
	statusesContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	attendanceIndicator: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	miniStatusesRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	expandedSection: {
		padding: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	statusDetail: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	statusDetailIcon: {
		width: 48,
		alignItems: "center",
		justifyContent: "center",
		marginRight: theme.spacing.sm,
	},
	largeAttendanceIndicator: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	statusDetailText: {
		flex: 1,
	},
	statusDetailLabel: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginBottom: 2,
	},
	statusDetailValue: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
	},
})
