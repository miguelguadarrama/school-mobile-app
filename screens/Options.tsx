import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { theme } from "../helpers/theme"
import { SafeAreaView } from "react-native-safe-area-context"
import BlogPostList from "../components/blog"

export default function OptionsScreen() {
	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Opciones</Text>
			</SafeAreaView>
			<BlogPostList
				emptyTitle="Opciones"
				emptySubtitle="Página en construcción"
				posts={[]}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	comingSoonText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.lg,
		color: theme.colors.muted,
		textAlign: "center",
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
