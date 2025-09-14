import React, { useContext } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import LoadingScreen from "../components/Loading"
import AnnouncementList from "../components/blog/announcements"
import AppContext from "../contexts/AppContext"
import { theme } from "../helpers/theme"

export default function AnnouncementsScreen() {
	const { students } = useContext(AppContext)!
	const student = students?.[0]
	const academic_year =
		student?.academic_year_classroom_students?.[0]?.classrooms?.academic_years
			?.id
	const key = academic_year
		? `/mobile/posts/announcements/${academic_year}`
		: null
	const { data, isLoading, mutate } = useSWR(key)

	// Handle refresh action
	const handleRefresh = async () => {
		if (key) {
			// Trigger a revalidation of the data
			await mutate()
		}
	}

	if (isLoading || !academic_year) {
		return <LoadingScreen />
	}

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Anuncios</Text>
			</SafeAreaView>
			<AnnouncementList
				announcements={data}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	heading: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
})
