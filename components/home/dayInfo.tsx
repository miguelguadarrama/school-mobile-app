import React, { useContext } from "react"
import { View, Text, StyleSheet } from "react-native"
import AttendanceCard from "./attendance"
import SchoolCard from "../SchoolCard"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"

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
	// const weatherData = {
	// 	temperature: 30,
	// 	condition: "Nublado",
	// 	icon: "⛅", // We'll replace with proper icons later
	// 	clothing: "Light jacket recommended",
	// }

	return (
		<SchoolCard>
			{/* Header with date and weather side by side */}
			<View style={styles.topRow}>
				<View style={styles.dateSection}>
					<Text style={styles.dayName}>{dayName}</Text>
					<Text style={styles.date}>{monthDay}</Text>
				</View>

				{/* <View style={styles.weatherSection}>
					<View style={styles.weatherInfo}>
						<Text style={styles.weatherIcon}>{weatherData.icon}</Text>
						<View style={styles.tempContainer}>
							<Text style={styles.temperature}>
								{weatherData.temperature}°C
							</Text>
							<Text style={styles.condition}>{weatherData.condition}</Text>
						</View>
					</View>
				</View> */}
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
})
