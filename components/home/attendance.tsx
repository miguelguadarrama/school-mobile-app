import React from "react"
import { View, Text, StyleSheet } from "react-native"
import {
	LucideCheck,
	LucideClock,
	LucideX,
	LucideHome,
} from "lucide-react-native"

interface AttendanceRecord {
	date: string
	status: "present" | "absent" | "late" | "early_pickup" | "holiday"
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
	const attendanceData: AttendanceRecord[] = [
		{
			date: weekDates[0].toISOString().split("T")[0],
			status: "holiday", // Sunday
		},
		{
			date: weekDates[1].toISOString().split("T")[0],
			status: "present",
		},
		{
			date: weekDates[2].toISOString().split("T")[0],
			status: "late",
		},
		{
			date: weekDates[3].toISOString().split("T")[0],
			status: "present",
		},
		{
			date: weekDates[4].toISOString().split("T")[0],
			status: "absent",
		},
		{
			date: weekDates[5].toISOString().split("T")[0],
			status: "present",
		},
		{
			date: weekDates[6].toISOString().split("T")[0],
			status: "holiday", // Saturday
		},
	]

	const getStatusColor = (status: AttendanceRecord["status"]) => {
		switch (status) {
			case "present":
				return "#10B981" // Green
			case "late":
				return "#F59E0B" // Amber
			case "absent":
				return "#EF4444" // Red
			case "early_pickup":
				return "#3B82F6" // Blue
			case "holiday":
				return "#BBB" // Gray
			default:
				return "#6B7280"
		}
	}

	const getStatusLabel = (status: AttendanceRecord["status"]) => {
		switch (status) {
			case "present":
				return "Present"
			case "late":
				return "Late"
			case "absent":
				return "Absent"
			case "early_pickup":
				return "Early Pickup"
			case "holiday":
				return "Holiday"
			default:
				return "Unknown"
		}
	}

	const getStatusIcon = (status: AttendanceRecord["status"]) => {
		switch (status) {
			case "present":
				return LucideCheck
			case "late":
				return LucideClock
			case "absent":
				return LucideX
			case "early_pickup":
				return LucideHome
			case "holiday":
				return LucideHome
			default:
				return LucideX
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
								{React.createElement(getStatusIcon(attendance.status), {
									size: 14,
									color: "#FFFFFF",
								})}
							</View>

							<Text style={styles.statusLabel}>
								{getStatusLabel(attendance.status)}
							</Text>
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
		fontSize: 12,
		fontWeight: "600",
		color: "#6B7280",
		marginBottom: 2,
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
