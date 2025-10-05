import React, { useContext, useMemo } from "react"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import StatusBar from "../components/StatusBar"
import BirthdayCard from "../components/home/birthdayCard"
import CommunicationCard from "../components/home/communication"
import DayInfoCard from "../components/home/dayInfo"
import JAC_H_Logo from "../components/logo"
import AppContext from "../contexts/AppContext"
import { theme } from "../helpers/theme"

export default function HomeScreen() {
	const { refreshAppData, isDataLoading, selectedStudent, selectedDate } = useContext(AppContext)!

	const isBirthday = useMemo(() => {
		if (!selectedStudent?.birthdate) return false

		const birthdate = new Date(selectedStudent.birthdate)
		const normalizedBirthdate = new Date(
			birthdate.getFullYear(),
			birthdate.getMonth(),
			birthdate.getDate(),
			0,
			0,
			0,
			0
		)

		const normalizedSelectedDate = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			selectedDate.getDate(),
			0,
			0,
			0,
			0
		)

		return (
			normalizedBirthdate.getMonth() === normalizedSelectedDate.getMonth() &&
			normalizedBirthdate.getDate() === normalizedSelectedDate.getDate()
		)
	}, [selectedStudent, selectedDate])

	return (
		<>
			<SafeAreaView style={styles.statusBarContainer} edges={["top"]}>
				<StatusBar />
			</SafeAreaView>
			<View style={styles.container}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={isDataLoading}
							onRefresh={refreshAppData}
							tintColor={theme.colors.primary}
							colors={[theme.colors.primary]}
						/>
					}
				>
					{/* School Header */}
					<JAC_H_Logo />

					{/* Birthday Card */}
					{isBirthday && selectedStudent && <BirthdayCard student={selectedStudent} />}

					{/* Day Information Card */}
					<View style={styles.cardContainer}>
						<DayInfoCard />
					</View>

					{/* Communication Recap */}
					<View style={styles.cardContainer}>
						<CommunicationCard />
					</View>

					{/* Bottom spacing for better scroll experience */}
					<View style={styles.bottomSpacing} />
				</ScrollView>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	statusBarContainer: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: 0,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
	},
	cardContainer: {
		marginBottom: theme.spacing.lg,
	},
	bottomSpacing: {
		height: theme.spacing.xl,
	},
})
