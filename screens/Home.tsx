import React from "react"
import {
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import LoadingScreen from "../components/Loading"
import StatusBar from "../components/StatusBar"
import CommunicationCard from "../components/home/communication"
import DayInfoCard from "../components/home/dayInfo"
import { theme } from "../helpers/theme"
import { student } from "../types/students"

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
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor={theme.colors.primary}
							colors={[theme.colors.primary]}
						/>
					}
				>
					{/* School Header */}
					<View style={styles.schoolHeader}>
						<Image
							source={require("../assets/icon.png")}
							style={styles.schoolLogo}
						/>
						<Text style={styles.schoolName}>
							{process.env.EXPO_PUBLIC_SCHOOL_NAME}
						</Text>
					</View>

					{/* Day Information Card */}
					<View style={styles.cardContainer}>
						<DayInfoCard />
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
	schoolHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: theme.spacing.sm,
		paddingHorizontal: theme.spacing.sm,
	},
	schoolLogo: {
		width: 48,
		height: 48,
		marginRight: theme.spacing.sm,
	},
	schoolName: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
	},
})
