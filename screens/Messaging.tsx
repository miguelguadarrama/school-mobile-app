import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import BlogPostsList from "../components/blog"

export default function MessagingScreen() {
	return (
		<>
			<SafeAreaView edges={["top"]}>
				<Text style={styles.heading}>Mensajes</Text>
			</SafeAreaView>
			<BlogPostsList
				emptyTitle="No hay mensajes"
				emptySubtitle="Cuando haya nuevos mensajes del personal, aparecerán aquí"
				posts={[]}
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
