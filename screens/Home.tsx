import React, { useContext } from "react"
import {
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import StatusBar from "../components/StatusBar"
import CommunicationCard from "../components/home/communication"
import DayInfoCard from "../components/home/dayInfo"
import AppButton from "../components/ui/button"
import AppContext from "../contexts/AppContext"
import { theme } from "../helpers/theme"

export default function HomeScreen() {
	const { refreshAppData, isDataLoading, roles } = useContext(AppContext)!

	const is_guardian = roles.includes("guardian")
	const is_teacher = roles.includes("staff")

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
					refreshControl={
						<RefreshControl
							refreshing={isDataLoading}
							onRefresh={refreshAppData}
							tintColor={theme.colors.primary}
							colors={[theme.colors.primary]}
						/>
					}
				>
					{/* School Header */}
					<View style={styles.schoolHeader}>
						<Image
							source={require("../assets/icon.png")}
							style={styles.schoolLogo}
						/>
						<Text style={styles.schoolName}>
							{process.env.EXPO_PUBLIC_SCHOOL_NAME}
						</Text>
					</View>

					{is_guardian && (
						<>
							{/* Day Information Card */}
							<View style={styles.cardContainer}>
								<DayInfoCard />
							</View>

							{/* Communication Recap */}
							<View style={styles.cardContainer}>
								<CommunicationCard />
							</View>
						</>
					)}

					{is_teacher && (
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
					)}

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
