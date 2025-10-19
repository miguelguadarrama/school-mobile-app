import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import AnnouncementList from "../components/blog/announcements"
import { theme } from "../helpers/theme"

export default function AnnouncementsScreen() {
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
