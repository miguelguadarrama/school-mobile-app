import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import BlogPostList from "../components/blog"
import { theme } from "../helpers/theme"

export default function MessagingScreen() {
	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Mensajes</Text>
			</SafeAreaView>
			<BlogPostList
				emptyTitle="No hay mensajes"
				emptySubtitle="Cuando haya nuevos mensajes del personal, aparecerán aquí"
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
