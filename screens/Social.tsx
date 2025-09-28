import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import BlogPostList from "../components/blog"
import AppContext from "../contexts/AppContext"
import { TabContext } from "../contexts/TabContext"
import { theme } from "../helpers/theme"
import { SocialPostModal } from "./teacher/SocialPostModal"

export default function SocialScreen() {
	const { selectedStudent, roles } = useContext(AppContext)!
	const { isSocialPostModalActive, setIsSocialPostModalActive } =
		useContext(TabContext)
	const is_teacher = roles.includes("staff")
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

	const { data, isLoading, mutate } = useSWR(`/mobile/posts/classroom`)

	// Handle refresh action
	const handleRefresh = async () => {
		await mutate()
	}

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.headerContent}>
					<Text style={styles.heading}>Social</Text>
					{is_teacher && (
						<TouchableOpacity
							style={styles.createPostButton}
							onPress={() => setIsSocialPostModalActive(true)}
							activeOpacity={0.7}
						>
							<Ionicons name="add" size={20} color={theme.colors.white} />
							<Text style={styles.createPostButtonText}>Publicar</Text>
						</TouchableOpacity>
					)}
				</View>
			</SafeAreaView>
			<BlogPostList
				emptyTitle="No hay publicaciones"
				emptySubtitle="Las publicaciones de tu salón de clases aparecerán aquí"
				posts={data}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
			/>

			{/* Social Post Modal */}
			{isSocialPostModalActive && (
				<SocialPostModal onBack={() => setIsSocialPostModalActive(false)} />
			)}
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
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	heading: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.primary,
		flex: 1,
	},
	createPostButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: theme.radius.md,
	},
	createPostButtonText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
})
