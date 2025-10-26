import { Ionicons } from "@expo/vector-icons"
import React, { useContext } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import AnnouncementList from "../components/blog/announcements"
import AppContext from "../contexts/AppContext"
import { TabContext } from "../contexts/TabContext"
import { theme } from "../helpers/theme"
import { SocialPostModal } from "./teacher/SocialPostModal"

export default function AnnouncementsScreen() {
	const { selectedRole } = useContext(AppContext)!
	const { isSocialPostModalActive, setIsSocialPostModalActive } =
		useContext(TabContext)
	const { data, isLoading, mutate } = useSWR(`/mobile/posts/announcements`)
	console.log({ data })
	// Handle refresh action
	const handleRefresh = async () => {
		// Trigger a revalidation of the data
		await mutate()
	}

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.headerContent}>
					<Text style={styles.heading}>Anuncios</Text>
					{selectedRole === "admin" && (
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
			<AnnouncementList
				announcements={data}
				onRefresh={handleRefresh}
				isRefreshing={isLoading}
			/>

			{/* Social Post Modal for Announcements */}
			{isSocialPostModalActive && (
				<SocialPostModal
					onBack={() => setIsSocialPostModalActive(false)}
					isAnnouncementMode={true}
				/>
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
