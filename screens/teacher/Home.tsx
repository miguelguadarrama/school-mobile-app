import React, { useContext, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ClassroomStudentsList from "../../components/ClassroomStudentsList"
import JAC_H_Logo from "../../components/logo"
import StatusBar from "../../components/StatusBar"
import UpcomingBirthdays from "../../components/UpcomingBirthdays"
import AppContext from "../../contexts/AppContext"
import { TabContext } from "../../contexts/TabContext"
import { theme } from "../../helpers/theme"
import { admin_classrooms, StudentData } from "../../types/students"
import AdminClassroomList from "../admin/classrooms"
import { ClassroomStudentList } from "../admin/ClassroomStudentList"
import { StudentProfile } from "./StudentProfile"

export default function HomeTeacherScreen() {
	const { classrooms, selectedDate } = useContext(AppContext)!
	const { setIsStudentProfileActive, setIsClassroomStudentListActive } =
		useContext(TabContext)
	const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
		null
	)
	const [selectedClassroom, setSelectedClassroom] =
		useState<admin_classrooms | null>(null)

	const handleStudentPress = (student: StudentData) => {
		setSelectedStudent(student)
		setIsStudentProfileActive(true)
	}

	const handleCloseStudentProfile = () => {
		setSelectedStudent(null)
		setIsStudentProfileActive(false)
	}

	const handleClassroomPress = (classroom: admin_classrooms) => {
		setSelectedClassroom(classroom)
		setIsClassroomStudentListActive(true)
	}

	const handleCloseClassroomStudentList = () => {
		setSelectedClassroom(null)
		setIsClassroomStudentListActive(false)
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

					{/* Upcoming Birthdays */}
					<UpcomingBirthdays classrooms={classrooms} />

					<AdminClassroomList onClassroomPress={handleClassroomPress} />

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

			{/* Classroom Student List Modal - Rendered outside ScrollView */}
			{selectedClassroom && (
				<ClassroomStudentList
					classroomId={selectedClassroom.id}
					classroomName={selectedClassroom.name}
					onBack={handleCloseClassroomStudentList}
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
