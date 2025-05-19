import React, { useContext } from "react"
import { StyleSheet, Text } from "react-native"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import LoadingScreen from "../components/Loading"
import BlogPostList from "../components/blog"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SocialScreen() {
	const { students } = useContext(AppContext)!
	const student = students?.[0]
	const classroom = student?.academic_year_classroom_students?.[0]?.classrooms
	const key = classroom ? `/mobile/posts/classroom/${classroom.id}` : null
	const { data, isLoading, mutate } = useSWR(key)

	// Handle refresh action
	const handleRefresh = async () => {
		if (key) {
			// Trigger a revalidation of the data
			await mutate()
		}
	}

	if (isLoading || !classroom) {
		return <LoadingScreen />
	}
	// add a big heading that says Social
	return (
		<>
			<SafeAreaView edges={["top"]}>
				<Text style={styles.heading}>Social</Text>
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
