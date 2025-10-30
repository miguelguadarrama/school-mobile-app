import { Ionicons } from "@expo/vector-icons"
import React, { useContext } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AppContext from "../contexts/AppContext"
import { displayName } from "../helpers/students"
import { theme } from "../helpers/theme"
import { student, StudentData } from "../types/students"
import { ClassroomData } from "../types/teacher"
import SchoolCard from "./SchoolCard"

interface ClassroomStudentsListProps {
	classrooms?: ClassroomData[]
	selectedDate?: Date
	onStudentPress?: (student: StudentData) => void
}

const sortStudents = (students: StudentData[]): StudentData[] => {
	return students.sort((a, b) => {
		if (a.last_name !== b.last_name) {
			return a.last_name.localeCompare(b.last_name)
		}

		const aSecondLast = a.second_last_name || ""
		const bSecondLast = b.second_last_name || ""
		if (aSecondLast !== bSecondLast) {
			return aSecondLast.localeCompare(bSecondLast)
		}

		if (a.first_name !== b.first_name) {
			return a.first_name.localeCompare(b.first_name)
		}

		const aMiddle = a.middle_name || ""
		const bMiddle = b.middle_name || ""
		return aMiddle.localeCompare(bMiddle)
	})
}

const getAttendanceStatus = (
	attendanceRecords: { status_value: string; date: Date }[],
	selectedDate?: Date
): "present" | "absent" | "late" | "unknown" => {
	if (!selectedDate || !attendanceRecords.length) return "unknown"

	const targetDate = new Date(selectedDate)
	targetDate.setHours(0, 0, 0, 0)

	const record = attendanceRecords.find((record) => {
		const recordDate = new Date(record.date)
		recordDate.setHours(0, 0, 0, 0)
		return recordDate.getTime() === targetDate.getTime()
	})

	if (!record) return "unknown"

	switch (record.status_value) {
		case "attendance_status_present":
			return "present"
		case "attendance_status_absent":
			return "absent"
		case "attendance_status_late":
			return "late"
		default:
			return "unknown"
	}
}

const AttendanceIndicator = ({
	status,
}: {
	status: "present" | "absent" | "late" | "unknown"
}) => {
	let backgroundColor: string
	let label: string

	switch (status) {
		case "present":
			backgroundColor = "#22c55e" // Green (traffic light green)
			label = "P"
			break
		case "late":
			backgroundColor = "#f59e0b" // Amber/Yellow (traffic light yellow)
			label = "T"
			break
		case "absent":
			backgroundColor = "#ef4444" // Red (traffic light red)
			label = "A"
			break
		case "unknown":
		default:
			backgroundColor = "#6b7280" // Gray
			label = "?"
			break
	}

	return (
		<View style={[styles.attendanceIndicator, { backgroundColor }]}>
			<Text style={styles.attendanceLabel}>{label}</Text>
		</View>
	)
}

export default function ClassroomStudentsList({
	classrooms,
	selectedDate,
	onStudentPress,
}: ClassroomStudentsListProps) {
	const { selectedRole } = useContext(AppContext)!
	if (selectedRole !== "staff") {
		return null
	}

	if (!classrooms || classrooms.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.noDataText}>No hay salones disponibles</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{classrooms.map((classroom) => {
				const studentsWithRecords = classroom.academic_year_classroom_students
				const sortedStudents = sortStudents(
					studentsWithRecords.map((s) => s.students)
				)

				return (
					<SchoolCard key={classroom.id} style={styles.classroomCard}>
						<View style={styles.classroomHeader}>
							<View style={styles.classroomIcon}>
								<Ionicons
									name="school"
									size={24}
									color={theme.colors.primary}
								/>
							</View>
							<View style={styles.classroomInfo}>
								<Text style={styles.classroomName}>{classroom.name}</Text>
							</View>
						</View>
						<View style={styles.studentsContainer}>
							{sortedStudents.length > 0 ? (
								sortedStudents.map((student, index) => {
									const studentRecord = studentsWithRecords.find(
										(s) => s.students.name === student.name
									)
									const attendanceStatus = getAttendanceStatus(
										studentRecord?.attendance_records || [],
										selectedDate
									)

									return (
										<TouchableOpacity
											key={index}
											style={[
												styles.studentItem,
												index === sortedStudents.length - 1 &&
													styles.lastStudentItem,
											]}
											onPress={() => onStudentPress?.(student)}
											activeOpacity={0.6}
										>
											<View style={styles.studentRow}>
												<Text
													style={styles.studentName}
													numberOfLines={1}
													ellipsizeMode="tail"
												>
													{displayName(
														student as unknown as student
													).toLowerCase()}
												</Text>
												<AttendanceIndicator status={attendanceStatus} />
											</View>
										</TouchableOpacity>
									)
								})
							) : (
								<Text style={styles.noStudentsText}>No hay alumnos</Text>
							)}
						</View>
					</SchoolCard>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginBottom: theme.spacing.lg,
	},
	classroomCard: {
		marginBottom: theme.spacing.md,
	},
	classroomHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	classroomIcon: {
		width: 40,
		height: 40,
		borderRadius: theme.radius.sm,
		backgroundColor: `${theme.colors.primary}15`,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.sm,
	},
	classroomInfo: {
		flex: 1,
	},
	classroomName: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		fontWeight: "700",
		color: theme.colors.text,
	},
	studentsContainer: {
		paddingLeft: 0,
		paddingTop: theme.spacing.xs,
	},
	studentItem: {
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: 0,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors["border-subtle"],
	},
	lastStudentItem: {
		borderBottomWidth: 0,
	},
	studentRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	studentName: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		flex: 1,
		marginRight: theme.spacing.sm,
		textTransform: "capitalize",
	},
	attendanceIndicator: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: theme.spacing.sm,
	},
	attendanceLabel: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: "#ffffff",
	},
	noDataText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
		padding: theme.spacing.lg,
	},
	noStudentsText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.secondary,
		fontStyle: "italic",
	},
})
