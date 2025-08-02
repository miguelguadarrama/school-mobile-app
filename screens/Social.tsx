import React, { useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, Text } from "react-native"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import LoadingScreen from "../components/Loading"
import BlogPostList from "../components/blog"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SocialScreen() {
	const { selectedStudent } = useContext(AppContext)!
	const [classroom, setClassroom] = useState<{
		id: string
		name: string
	} | null>(null)
	useEffect(() => {
		setClassroom(
			selectedStudent?.academic_year_classroom_students?.[0]?.classrooms as {
				id: string
				name: string
			} | null
		)
	}, [selectedStudent])
	const key = useMemo(
		() => `/mobile/posts/classroom/${classroom?.id}`,
		[classroom]
	)
	const { data, isLoading, mutate } = useSWR(key)
	console.log("classroom", classroom)

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
