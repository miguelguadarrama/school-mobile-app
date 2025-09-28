import React, { useContext, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ClassroomStudentsList from "../../components/ClassroomStudentsList"
import JAC_H_Logo from "../../components/logo"
import StatusBar from "../../components/StatusBar"
import AppContext from "../../contexts/AppContext"
import { TabContext } from "../../contexts/TabContext"
import { theme } from "../../helpers/theme"
import { StudentData } from "../../types/students"
import { StudentProfile } from "./StudentProfile"

export default function HomeTeacherScreen() {
	const { classrooms, selectedDate } = useContext(AppContext)!
	const { setIsStudentProfileActive } = useContext(TabContext)
	const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
		null
	)

	const handleStudentPress = (student: StudentData) => {
		setSelectedStudent(student)
		setIsStudentProfileActive(true)
	}

	const handleCloseStudentProfile = () => {
		setSelectedStudent(null)
		setIsStudentProfileActive(false)
	}

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
					<JAC_H_Logo />

					<ClassroomStudentsList
						classrooms={classrooms}
						selectedDate={selectedDate}
						onStudentPress={handleStudentPress}
					/>

					{/* Bottom spacing for better scroll experience */}
					<View style={styles.bottomSpacing} />
				</ScrollView>
			</View>

			{/* Student Profile Modal */}
			{selectedStudent && (
				<StudentProfile
					student={selectedStudent}
					onBack={handleCloseStudentProfile}
				/>
			)}
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
})
