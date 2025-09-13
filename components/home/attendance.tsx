import React, { useContext } from "react"
import { View, Text, StyleSheet } from "react-native"
import {
	LucideCheck,
	LucideClock,
	LucideX,
	LucideIcon,
} from "lucide-react-native"
import AppContext from "../../contexts/AppContext"
import { getFormattedDate } from "../../helpers/date"

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
	const { selectedStudent, attendance, selectedDate, setSelectedDate } =
		useContext(AppContext)!

	if (!selectedStudent) {
		return null
	}

	// Get current week dates (Sunday to Saturday)
	const getCurrentWeekDates = () => {
		const today = new Date()
		const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

		// Find Sunday of current week
		const sunday = new Date(today)
		sunday.setDate(today.getDate() - currentDay)

		// Ensure we're at the start of the day
		sunday.setHours(0, 0, 0, 0)

		const weekDates = []
		for (let i = 0; i < 7; i++) {
			const date = new Date(sunday)
			date.setDate(sunday.getDate() + i)
			weekDates.push(date)
		}

		// Helper function to format date in local timezone (YYYY-MM-DD)
		const formatLocalDate = (date: Date) => {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, "0")
			const day = String(date.getDate()).padStart(2, "0")
			return `${year}-${month}-${day}`
		}

		// Debug log to see what dates we're generating (local timezone)

		return weekDates
	}

	const weekDates = getCurrentWeekDates()

	const attendanceData: AttendanceRecord[] = Array.from(
		{ length: 7 },
		(_, i) => {
			// Format date in local timezone instead of UTC
			const dateObj = weekDates[i]
			const year = dateObj.getFullYear()
			const month = String(dateObj.getMonth() + 1).padStart(2, "0")
			const day = String(dateObj.getDate()).padStart(2, "0")
			const date = `${year}-${month}-${day}`

			const record = attendance.find(
				(a) => date === a.date && a.status_type === "attendance_status"
			)

			return {
				date,
				status: record?.status_value || "",
			}
		}
	)

	const getStatusColor = (status: AttendanceRecord["status"]) => {
		switch (status) {
			case "attendance_status_present":
				return "#10B981" // Green
			case "attendance_status_late":
				return "#F59E0B" // Amber
			case "attendance_status_absent":
				return "#EF4444" // Red
			default:
				return "#CCC"
		}
	}

	const getStatusIcon = (status?: AttendanceRecord["status"]) => {
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

	return (
		<View style={styles.card}>
			<View style={styles.weekContainer}>
				{weekDates.map((date, index) => {
					// Format date in local timezone
					const year = date.getFullYear()
					const month = String(date.getMonth() + 1).padStart(2, "0")
					const day = String(date.getDate()).padStart(2, "0")
					const localDateString = `${year}-${month}-${day}`

					const attendance = attendanceData[index] || {
						date: localDateString,
						status: "",
					}

					const dayName = date.toLocaleDateString(locale, { weekday: "short" })
					const dayNum = date.getDate()
					const isToday = date.toDateString() === selectedDate.toDateString()

					return (
						<View
							key={index}
							style={[styles.dayColumn, isToday && styles.todayColumn]}
							onTouchEnd={() => setSelectedDate(date)}
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
