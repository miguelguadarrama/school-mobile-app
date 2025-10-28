import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useState } from "react"
import {
	BackHandler,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"
import { StudentData } from "../../types/students"
import { StudentProfile } from "../teacher/StudentProfile"

interface ClassroomStudentListProps {
	classroomId: string
	classroomName: string
	onBack: () => void
}

export const ClassroomStudentList: React.FC<ClassroomStudentListProps> = ({
	classroomId,
	classroomName,
	onBack,
}) => {
	const { classrooms } = useContext(AppContext)!
	const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
		null
	)
	const insets = useSafeAreaInsets()

	const students =
		classrooms
			?.find((k) => k.id === classroomId)
			?.academic_year_classroom_students?.map((s) => s.students) || []

	// Handle Android back button
	useEffect(() => {
		const handleBackPress = () => {
			if (selectedStudent) {
				setSelectedStudent(null)
				return true
			}
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack, selectedStudent])

	const renderStudentItem = ({ item }: { item: StudentData }) => {
		// Calculate age from birthdate
		const birthdate = new Date(item.birthdate)
		const today = new Date()
		const age = today.getFullYear() - birthdate.getFullYear()

		// Format birthdate
		const formattedBirthdate = birthdate.toLocaleDateString("es-ES", {
			day: "numeric",
			month: "long",
		})

		// Format student name
		let studentName = item.first_name
		if (item.middle_name) {
			studentName += ` ${item.middle_name[0]}.`
		}
		studentName += ` ${item.last_name}`
		if (item.second_last_name) {
			studentName += ` ${item.second_last_name[0]}.`
		}

		return (
			<TouchableOpacity
				style={styles.studentCard}
				onPress={() => setSelectedStudent(item)}
				activeOpacity={0.7}
			>
				<View style={styles.studentIcon}>
					<Ionicons name="person" size={24} color={theme.colors.primary} />
				</View>
				<View style={styles.studentInfo}>
					<Text style={styles.studentName}>{studentName}</Text>
					<View style={styles.studentDetails}>
						<Text style={styles.studentAge}>{age} años</Text>
						<Text style={styles.studentBirthdate}>• {formattedBirthdate}</Text>
					</View>
				</View>
				<Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
			</TouchableOpacity>
		)
	}

	// If a student is selected, show their profile
	if (selectedStudent) {
		return (
			<StudentProfile
				student={selectedStudent}
				onBack={() => setSelectedStudent(null)}
			/>
		)
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={onBack}
					activeOpacity={0.7}
				>
					<Ionicons name="arrow-back" size={24} color={theme.colors.text} />
				</TouchableOpacity>
				<View style={styles.headerText}>
					<Text style={styles.headerTitle}>{classroomName}</Text>
					<Text style={styles.headerSubtitle}>
						{students?.length || 0}{" "}
						{students?.length === 1 ? "alumno" : "alumnos"}
					</Text>
				</View>
			</View>

			{/* Student List */}
			{students && students.length > 0 ? (
				<FlatList
					data={students}
					renderItem={renderStudentItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={[
					styles.listContainer,
					{ paddingBottom: insets.bottom + theme.spacing.md },
				]}
					showsVerticalScrollIndicator={false}
				/>
			) : (
				<View style={styles.emptyContainer}>
					<Ionicons
						name="people-outline"
						size={64}
						color={theme.colors.muted}
					/>
					<Text style={styles.emptyText}>No hay alumnos en esta sala</Text>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.sm,
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		fontWeight: "700",
		color: theme.colors.text,
		marginBottom: 2,
	},
	headerSubtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	loadingText: {
		marginTop: theme.spacing.sm,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		fontFamily: theme.typography.family.regular,
	},
	listContainer: {
		padding: theme.spacing.md,
	},
	studentCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.md,
		padding: theme.spacing.md,
		marginBottom: theme.spacing.sm,
		borderWidth: 1,
		borderColor: theme.colors.border,
		...theme.shadow.card,
	},
	studentIcon: {
		width: 48,
		height: 48,
		borderRadius: theme.radius.sm,
		backgroundColor: `${theme.colors.primary}15`,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.md,
	},
	studentInfo: {
		flex: 1,
	},
	studentName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "600",
		color: theme.colors.text,
		marginBottom: 2,
	},
	studentAge: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	studentDetails: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.xs,
	},
	studentBirthdate: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xl,
	},
	emptyText: {
		marginTop: theme.spacing.md,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		fontFamily: theme.typography.family.regular,
		textAlign: "center",
	},
})
