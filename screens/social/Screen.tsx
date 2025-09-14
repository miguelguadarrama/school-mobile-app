import React, { useContext, useEffect, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import LoadingScreen from "../../components/Loading"
import BlogPostList from "../../components/blog"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"

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
	const { data, isLoading, mutate } = useSWR(classroom?.id ? key : null)
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
	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Social</Text>
			</SafeAreaView>
			<BlogPostList
				posts={data}
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
