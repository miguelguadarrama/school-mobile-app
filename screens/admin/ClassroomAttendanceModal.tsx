import { Ionicons } from "@expo/vector-icons"
import { LucideCheck, LucideClock, LucideX } from "lucide-react-native"
import React, { useContext, useEffect, useMemo, useState } from "react"
import {
	BackHandler,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import useSWR from "swr"
import LoadingScreen from "../../components/Loading"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"
import {
	EatingStatus,
	MoodStatus,
	PeeStatus,
	PoopStatus,
} from "../../types/students"
import { ClassroomData } from "../../types/teacher"

interface ClassroomAttendanceModalProps {
	classroomId: string
	classroomName: string
	onBack: () => void
}

interface StudentDayData {
	studentId: string
	studentName: string
	attendanceStatus?: string
	moodStatus?: string
	mealStatus?: string
	peeStatus?: string
	poopStatus?: string
}

export const ClassroomAttendanceModal: React.FC<
	ClassroomAttendanceModalProps
> = ({ classroomId, classroomName, onBack }) => {
	const { selectedDate } = useContext(AppContext)!
	const { data: classroomData, isLoading } = useSWR<ClassroomData>(
		classroomId ? `/mobile/admin/classroom/${classroomId}` : null
	)
	const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
	const insets = useSafeAreaInsets()

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

	// Process data to get attendance for selected date
	const studentsData = useMemo<StudentDayData[]>(() => {
		if (!classroomData?.academic_year_classroom_students || !selectedDate)
			return []

		const dateString = selectedDate.toISOString().split("T")[0]

		return classroomData.academic_year_classroom_students.map((student) => {
			// Find all status types for this date
			const attendanceRecord = student.attendance_records?.find((a) => {
				const recordDate = new Date(a.date).toISOString().split("T")[0]
				return (
					recordDate === dateString && a.status_type === "attendance_status"
				)
			})

			const moodRecord = student.attendance_records?.find((a) => {
				const recordDate = new Date(a.date).toISOString().split("T")[0]
				return recordDate === dateString && a.status_type === "mood_status"
			})

			const mealRecord = student.attendance_records?.find((a) => {
				const recordDate = new Date(a.date).toISOString().split("T")[0]
				return recordDate === dateString && a.status_type === "meal_status"
			})

			const peeRecord = student.attendance_records?.find((a) => {
				const recordDate = new Date(a.date).toISOString().split("T")[0]
				return recordDate === dateString && a.status_type === "pee_status"
			})

			const poopRecord = student.attendance_records?.find((a) => {
				const recordDate = new Date(a.date).toISOString().split("T")[0]
				return recordDate === dateString && a.status_type === "poop_status"
			})

			// Format student name manually since displayShortName expects different type
			const studentData = student.students
			let studentName = studentData.last_name
			if (studentData.second_last_name) {
				studentName += ` ${studentData.second_last_name.charAt(0)}.`
			}
			studentName += `, ${studentData.first_name}`
			if (studentData.middle_name) {
				studentName += ` ${studentData.middle_name.charAt(0)}.`
			}

			return {
				studentId: student.student_id,
				studentName,
				attendanceStatus: attendanceRecord?.status_value,
				moodStatus: moodRecord?.status_value,
				mealStatus: mealRecord?.status_value,
				peeStatus: peeRecord?.status_value,
				poopStatus: poopRecord?.status_value,
			}
		})
	}, [classroomData, selectedDate])

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

	const renderStudentItem = ({
		item,
		index,
	}: {
		item: StudentDayData
		index: number
	}) => {
		const AttendanceIcon = getAttendanceStatusIcon(item.attendanceStatus)
		const mood = getMoodIcon(item.moodStatus as MoodStatus)
		const meal = getMealIcon(item.mealStatus as EatingStatus)
		const pee = getPeeIcon(item.peeStatus as PeeStatus)
		const poop = getPoopIcon(item.poopStatus as PoopStatus)
		const isExpanded = expandedStudent === item.studentId
		const isLastStudent = index === studentsData.length - 1

		return (
			<View key={item.studentId}>
				<TouchableOpacity
					style={styles.studentRow}
					onPress={() => setExpandedStudent(isExpanded ? null : item.studentId)}
					activeOpacity={0.7}
				>
					<View style={styles.studentInfo}>
						<Text style={styles.studentName}>{item.studentName}</Text>
					</View>

					<View style={styles.statusesContainer}>
						{/* Attendance */}
						<View
							style={[
								styles.attendanceIndicator,
								{
									backgroundColor: getAttendanceStatusColor(
										item.attendanceStatus
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
												item.attendanceStatus
											),
										},
									]}
								>
									{AttendanceIcon && (
										<AttendanceIcon size={24} color={theme.colors.white} />
									)}
								</View>
							</View>
							<View style={styles.statusDetailText}>
								<Text style={styles.statusDetailLabel}>Asistencia</Text>
								<Text style={styles.statusDetailValue}>
									{getStatusLabel("attendance", item.attendanceStatus)}
								</Text>
							</View>
						</View>

						{/* Mood */}
						<View style={styles.statusDetail}>
							<View style={styles.statusDetailIcon}>
								<Ionicons name={mood.icon} size={32} color={mood.color} />
							</View>
							<View style={styles.statusDetailText}>
								<Text style={styles.statusDetailLabel}>Estado de ánimo</Text>
								<Text style={styles.statusDetailValue}>
									{getStatusLabel("mood", item.moodStatus)}
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
									{getStatusLabel("meal", item.mealStatus)}
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
									{getStatusLabel("pee", item.peeStatus)}
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
									{getStatusLabel("poop", item.poopStatus)}
								</Text>
							</View>
						</View>
					</View>
				)}

				{!isLastStudent && <View style={styles.studentSeparator} />}
			</View>
		)
	}

	if (isLoading) {
		return (
			<View style={styles.modalContainer}>
				<View style={styles.header}>
					<TouchableOpacity onPress={onBack} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
					</TouchableOpacity>
					<Text style={styles.title}>Progreso del Aula</Text>
					<View style={styles.placeholder} />
				</View>
				<LoadingScreen />
			</View>
		)
	}

	// Format selected date
	const formattedDate = selectedDate
		? selectedDate.toLocaleDateString("es-ES", {
				weekday: "long",
				day: "numeric",
				month: "long",
		  })
		: ""

	return (
		<View style={styles.modalContainer}>
			<View style={styles.header}>
				<TouchableOpacity onPress={onBack} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerTextContainer}>
					<Text style={styles.title}>{classroomName}</Text>
					<Text style={styles.subtitle}>{formattedDate}</Text>
				</View>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + theme.spacing.md },
				]}
				showsVerticalScrollIndicator={true}
			>
				{studentsData.length > 0 ? (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<Text style={styles.cardHeaderText}>Asistencia</Text>
						</View>
						<View style={styles.cardContent}>
							{studentsData
								.slice()
								.sort((a, b) => a.studentName.localeCompare(b.studentName))
								.map((item, index) => (
									<React.Fragment key={item.studentId}>
										{renderStudentItem({ item, index })}
									</React.Fragment>
								))}
						</View>
					</View>
				) : (
					<View style={styles.emptyContainer}>
						<Ionicons
							name="people-outline"
							size={64}
							color={theme.colors.muted}
						/>
						<Text style={styles.emptyText}>
							No hay registros de asistencia para esta fecha
						</Text>
					</View>
				)}
			</ScrollView>
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
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: theme.spacing.xl,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.md,
		backgroundColor: theme.colors.white,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		padding: theme.spacing.xs,
		width: 40,
	},
	headerTextContainer: {
		flex: 1,
		alignItems: "center",
	},
	title: {
		fontFamily: "Nunito_700Bold",
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: 2,
	},
	subtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		textAlign: "center",
		textTransform: "capitalize",
	},
	placeholder: {
		width: 40,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: theme.spacing.md,
	},
	card: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		overflow: "hidden",
		...theme.shadow.soft,
	},
	cardHeader: {
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		backgroundColor: theme.colors.primary,
	},
	cardHeaderText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.white,
		textAlign: "center",
	},
	cardContent: {
		padding: theme.spacing.md,
	},
	studentRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.md,
		backgroundColor: theme.colors.white,
	},
	studentInfo: {
		flex: 1,
	},
	studentName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
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
		marginTop: theme.spacing.xs,
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
	studentSeparator: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginVertical: theme.spacing.xs,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	emptyText: {
		marginTop: theme.spacing.md,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		fontFamily: theme.typography.family.regular,
		textAlign: "center",
	},
})
