import React, { useContext } from "react"
import { StyleSheet, Text } from "react-native"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import LoadingScreen from "../components/Loading"
import BlogPostList from "../components/blog"
import { SafeAreaView } from "react-native-safe-area-context"

export default function AnnouncementsScreen() {
	const { students } = useContext(AppContext)!
	const student = students?.[0]
	const academic_year =
		student?.academic_year_classroom_students?.[0]?.classrooms?.academic_years
			?.id
	const key = academic_year ? `/mobile/${academic_year}/announcements` : null
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
		<>
			<SafeAreaView edges={["top"]}>
				<Text style={styles.heading}>Anuncios</Text>
			</SafeAreaView>
			<BlogPostList
				posts={data}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	heading: {
		fontSize: 24,
		fontWeight: "bold",

		marginTop: 16,
		paddingHorizontal: 16,
	},
})
