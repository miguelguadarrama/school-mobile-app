import React from "react"
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native"
import LoadingScreen from "../components/Loading"
import useSWR from "swr"
import { student } from "../types/students"
import { SafeAreaView } from "react-native-safe-area-context"
import StatusBar from "../components/StatusBar"
import DayInfoCard from "../components/home/dayInfo"
import AttendanceCard from "../components/home/attendance"
import CommunicationCard from "../components/home/communication"
import DailyActivityStatus from "../components/home/status"

export default function HomeScreen() {
	// Fetch student information from the API
	const { data, isLoading, mutate } = useSWR<{ students: student[] }>(
		"/mobile/profile"
	)

	//console.log({ data: JSON.stringify(data.students) })

	// Pull to refresh handler
	const [refreshing, setRefreshing] = React.useState(false)

	const onRefresh = React.useCallback(async () => {
		setRefreshing(true)
		try {
			await mutate()
		} catch (error) {
			console.error("Error refreshing data:", error)
		} finally {
			setRefreshing(false)
		}
	}, [mutate])

	if (isLoading) {
		return <LoadingScreen />
	}

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
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					{/* Day Information Card */}
					<View style={styles.cardContainer}>
						<DayInfoCard />
					</View>

					{/* Day Information Card */}
					<View style={styles.cardContainer}>
						<DailyActivityStatus
							data={{
								eating: "little",
								mood: "happy",
								poop: true,
							}}
						/>
					</View>

					{/* Communication Recap */}
					<View style={styles.cardContainer}>
						<CommunicationCard />
					</View>

					{/* Calendar & Events */}
					<View style={styles.cardContainer}>
						{/* CalendarCard component will go here */}
					</View>

					{/* Today's Events */}
					<View style={styles.cardContainer}>
						{/* TodayEventsCard component will go here */}
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
		backgroundColor: "#F8F9FA",
	},
	statusBarContainer: {
		backgroundColor: "#F0F0F0",
		paddingHorizontal: 0,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	cardContainer: {
		marginBottom: 16,
		// This will be consistent spacing between all dashboard cards
		// Individual cards will handle their own styling (shadows, borders, etc.)
	},
	bottomSpacing: {
		height: 20,
		// Extra space at bottom for better scroll experience
	},
})
