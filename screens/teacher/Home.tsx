import React from "react"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import StatusBar from "../../components/StatusBar"
import AppButton from "../../components/ui/button"
import { theme } from "../../helpers/theme"

export default function HomeTeacherScreen() {
	return (
		<>
			<SafeAreaView style={styles.statusBarContainer} edges={["top"]}>
				<StatusBar />
			</SafeAreaView>
			<View style={styles.container}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* School Header */}
					<View style={styles.schoolHeader}>
						<Image
							source={require("../../assets/icon.png")}
							style={styles.schoolLogo}
						/>
						<Text style={styles.schoolName}>
							{process.env.EXPO_PUBLIC_SCHOOL_NAME}
						</Text>
					</View>

					<View style={styles.cardContainer}>
						<Text
							style={{ ...styles.schoolName, marginBottom: theme.spacing.sm }}
						>
							Bienvenido, Docente
						</Text>
						<AppButton variant="primary" onPress={() => {}}>
							Panel de Docente
						</AppButton>
					</View>

					{/* Bottom spacing for better scroll experience */}
					<View style={styles.bottomSpacing} />
				</ScrollView>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	statusBarContainer: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: 0,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.sm,
	},
	cardContainer: {
		marginBottom: theme.spacing.lg,
	},
	bottomSpacing: {
		height: theme.spacing.xl,
	},
	schoolHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: theme.spacing.sm,
		paddingHorizontal: theme.spacing.sm,
	},
	schoolLogo: {
		width: 48,
		height: 48,
		marginRight: theme.spacing.sm,
	},
	schoolName: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
	},
})
