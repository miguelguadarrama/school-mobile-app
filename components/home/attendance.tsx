import React, { useContext } from "react"
import { View, Text, StyleSheet } from "react-native"
import {
	LucideCheck,
	LucideClock,
	LucideX,
	LucideIcon,
} from "lucide-react-native"
import AppContext from "../../contexts/AppContext"

interface AttendanceRecord {
	date: string
	status?: string
	checkInTime?: string
	checkOutTime?: string
	note?: string
}

interface AttendanceCardProps {
	locale?: "es-VE" | "en-US"
	// We'll add props later when we connect to real data
}

export default function AttendanceCard({
	locale = "es-VE",
}: AttendanceCardProps) {
	const { selectedStudent, attendance } = useContext(AppContext)!

	if (!selectedStudent) {
		return null
	}

	// Get current week dates (Monday to Friday)
	const getCurrentWeekDates = () => {
		const today = new Date()
		const currentDay = today.getDay()
		const sunday = new Date(today)

		// Adjust to get Sunday of current week
		const diff = today.getDate() - currentDay
		sunday.setDate(diff)

		const weekDates = []
		for (let i = 0; i < 7; i++) {
			const date = new Date(sunday)
			date.setDate(sunday.getDate() + i)
			weekDates.push(date)
		}
		return weekDates
	}

	const weekDates = getCurrentWeekDates()

	// Static attendance data for demonstration

	const attendanceData: AttendanceRecord[] = Array.from(
		{ length: 7 },
		(_, i) => {
			const date = weekDates[i].toISOString().split("T")[0]
			const record = attendance.find(
				(a) => new Date(a.date).toISOString() === new Date(date).toISOString()
			)
			return {
				date,
				status:
					(record?.status_alias as AttendanceRecord["status"]) || "absent",
			}
		}
	)

	const getStatusColor = (status: AttendanceRecord["status"]) => {
		switch (status) {
			case "a_status_present":
				return "#10B981" // Green
			case "a_status_late":
				return "#F59E0B" // Amber
			case "a_status_absent":
				return "#EF4444" // Red
			default:
				return "#CCC"
		}
	}

	// const getStatusLabel = (status: AttendanceRecord["status"]) => {
	// 	switch (status) {
	// 		case "present":
	// 			return "Presente"
	// 		case "late":
	// 			return "Tarde"
	// 		case "absent":
	// 			return "Ausente"
	// 		case "early_pickup":
	// 			return "Recogida Temprana"
	// 		case "holiday":
	// 			return "Día Festivo"
	// 		default:
	// 			return "N/A"
	// 	}
	// }

	const getStatusIcon = (status?: AttendanceRecord["status"]) => {
		switch (status) {
			case "a_status_present":
				return LucideCheck
			case "a_status_late":
				return LucideClock
			case "a_status_absent":
				return LucideX
			default:
				return null
		}
	}

	return (
		<View style={styles.card}>
			<View style={styles.weekContainer}>
				{weekDates.map((date, index) => {
					const attendance = attendanceData[index] || {
						date: date.toISOString().split("T")[0],
						status: "present" as const,
					}

					const dayName = date.toLocaleDateString(locale, { weekday: "short" })
					const dayNum = date.getDate()
					const isToday = date.toDateString() === new Date().toDateString()

					return (
						<View
							key={index}
							style={[styles.dayColumn, isToday && styles.todayColumn]}
						>
							<Text style={[styles.dayName, isToday && styles.todayText]}>
								{dayName}
							</Text>
							<Text style={[styles.dayNumber, isToday && styles.todayText]}>
								{dayNum}
							</Text>

							<View
								style={[
									styles.statusContainer,
									{ backgroundColor: getStatusColor(attendance.status) },
								]}
							>
								{getStatusIcon(attendance.status) !== null ? (
									<>
										{React.createElement(
											getStatusIcon(attendance.status) as LucideIcon,
											{
												size: 14,
												color: "#FFFFFF",
											}
										)}
									</>
								) : null}
							</View>
							{/* 
							<Text style={styles.statusLabel}>
								{getStatusLabel(attendance.status)}
							</Text> */}
						</View>
					)
				})}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "transparent",
	},
	header: {
		marginBottom: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
	},
	weekContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dayColumn: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 4,
		borderRadius: 8,
	},
	todayColumn: {
		backgroundColor: "#EBF8FF",
		borderWidth: 1,
		borderColor: "#3B82F6",
	},
	weekendColumn: {
		opacity: 0.6,
	},
	dayName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6B7280",
		marginBottom: 2,
		textTransform: "capitalize",
	},
	dayNumber: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1F2937",
		marginBottom: 8,
	},
	todayText: {
		color: "#3B82F6",
	},
	weekendText: {
		color: "#9CA3AF",
	},
	statusContainer: {
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 4,
	},
	weekendStatus: {
		backgroundColor: "#9CA3AF",
	},
	statusLabel: {
		fontSize: 9,
		fontWeight: "600",
		color: "#374151",
		textAlign: "center",
	},
})
