import React, { useContext } from "react"
import { View, Text, StyleSheet } from "react-native"
import AttendanceCard from "./attendance"
import SchoolCard from "../SchoolCard"
import AppContext from "../../contexts/AppContext"

interface DayInfoCardProps {
	// We'll add props later when we connect to real data
	locale?: "es-VE" | "en-US"
}

export default function DayInfoCard({ locale = "es-VE" }: DayInfoCardProps) {
	// Get current date information
	const { selectedDate } = useContext(AppContext)!
	const now = selectedDate || new Date()
	const dayName = now.toLocaleDateString(locale, { weekday: "long" })
	const monthDay = now.toLocaleDateString(locale, {
		month: "long",
		day: "numeric",
	})

	// Static weather data for now
	const weatherData = {
		temperature: 30,
		condition: "Nublado",
		icon: "⛅", // We'll replace with proper icons later
		clothing: "Light jacket recommended",
	}

	return (
		<SchoolCard>
			{/* Header with date and weather side by side */}
			<View style={styles.topRow}>
				<View style={styles.dateSection}>
					<Text style={styles.dayName}>{dayName}</Text>
					<Text style={styles.date}>{monthDay}</Text>
				</View>

				<View style={styles.weatherSection}>
					<View style={styles.weatherInfo}>
						<Text style={styles.weatherIcon}>{weatherData.icon}</Text>
						<View style={styles.tempContainer}>
							<Text style={styles.temperature}>
								{weatherData.temperature}°C
							</Text>
							<Text style={styles.condition}>{weatherData.condition}</Text>
						</View>
					</View>
				</View>
			</View>

			<AttendanceCard locale={locale} />

			{/* Clothing recommendation */}
			{/* 
			<View style={styles.clothingTip}>
				<Text style={styles.clothingIcon}>👕</Text>
				<Text style={styles.clothingText}>{weatherData.clothing}</Text>
			</View>
      */}
		</SchoolCard>
	)
}

// const SchoolOpenStatus = () => {
// 	const now = new Date()
// 	// Check if school is open (Monday-Friday, excluding holidays)
// 	const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
// 	const isSchoolOpen = isWeekday // We'll enhance this with holiday calendar later
// 	return (
// 		<View style={styles.statusRow}>
// 			<View
// 				style={[
// 					styles.statusIndicator,
// 					{ backgroundColor: isSchoolOpen ? "#10B981" : "#EF4444" },
// 				]}
// 			/>
// 			<Text style={styles.statusText}>
// 				School is {isSchoolOpen ? "Open" : "Closed"}
// 			</Text>
// 		</View>
// 	)
// }

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3, // Android shadow
	},
	topRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	dateSection: {
		flex: 1,
	},
	dayName: {
		fontFamily: "Nunito_400Regular",
		textTransform: "capitalize",
		fontSize: 24,
		fontWeight: "700",
		color: "#1F2937",
		marginBottom: 4,
	},
	date: {
		fontFamily: "Nunito_400Regular",
		textTransform: "capitalize",
		fontSize: 16,
		color: "#6B7280",
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
		marginRight: 8,
	},
	tempContainer: {
		alignItems: "flex-end",
	},
	temperature: {
		fontFamily: "Nunito_400Regular",
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
		lineHeight: 20,
	},
	condition: {
		fontFamily: "Nunito_400Regular",
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
		lineHeight: 14,
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
	},
	statusIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 8,
	},
	statusText: {
		fontFamily: "Nunito_400Regular",
		fontSize: 14,
		fontWeight: "600",
		color: "#374151",
	},
	clothingTip: {
		fontFamily: "Nunito_400Regular",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#EBF8FF",
		padding: 10,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: "#3B82F6",
	},
	clothingIcon: {
		fontSize: 16,
		marginRight: 8,
	},
	clothingText: {
		fontFamily: "Nunito_400Regular",
		fontSize: 13,
		color: "#1E40AF",
		fontWeight: "500",
		flex: 1,
	},
})
