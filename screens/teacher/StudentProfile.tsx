import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useState } from "react"
import {
	BackHandler,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import useSWR from "swr"
import SchoolCard from "../../components/SchoolCard"
import AppContext from "../../contexts/AppContext"
import { useTeacherChatContext } from "../../contexts/TeacherChatContext"
import { theme } from "../../helpers/theme"
import { fetcher } from "../../services/api"
import { StudentProfileData, StudentStatusItems } from "../../types/students"
import { TeacherChatWindow } from "./TeacherChatWindow"

interface StudentData {
	id: string
	first_name: string
	middle_name: string | null
	last_name: string
	second_last_name: string | null
	name: string
}

interface StudentProfileProps {
	student: StudentData
	onBack: () => void
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
	student,
	onBack,
}) => {
	const { refreshAppData } = useContext(AppContext)!
	const insets = useSafeAreaInsets()
	const {
		data: studentProfile,
		isLoading,
		mutate: refreshStudentData,
	} = useSWR<StudentProfileData>(`/mobile/students/${student.id}`)
	const { data: status_items, isLoading: isLoadingStatusItems } = useSWR<
		StudentStatusItems[]
	>(`/mobile/attendance_status`)

	// Attendance form state
	const [status, setStatus] = useState<"idle" | "busy">("idle")
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [attendanceStatus, setAttendanceStatus] = useState<string>("")
	const [mealStatus, setMealStatus] = useState<string>("")
	const [moodStatus, setMoodStatus] = useState<string>("")
	const [peeStatus, setPeeStatus] = useState<string>("")
	const [poopStatus, setPoopStatus] = useState<string>("")

	// Track original state to detect changes
	const [originalAttendanceState, setOriginalAttendanceState] = useState({
		attendance: "",
		meal: "",
		mood: "",
		pee: "",
		poop: "",
	})

	// const getStatusLabel = (status_type: string) => {
	// 	if (!status_items) return status_type

	// 	const item = status_items.find((s) => s.alias === status_type)
	// 	return item ? item.description : status_type
	// }

	// Date navigation functions
	const formatSelectedDate = (date: Date) => {
		return date.toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	// Get date range limits (last 7 days, including today)
	const getDateLimits = () => {
		const today = new Date()
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(today.getDate() - 6) // 6 days ago + today = 7 days
		return { minDate: sevenDaysAgo, maxDate: today }
	}

	const { minDate, maxDate } = getDateLimits()

	const navigateDate = (direction: "prev" | "next") => {
		const newDate = new Date(selectedDate)
		if (direction === "prev") {
			newDate.setDate(newDate.getDate() - 1)
			if (newDate >= minDate) {
				setSelectedDate(newDate)
			}
		} else {
			newDate.setDate(newDate.getDate() + 1)
			if (newDate <= maxDate) {
				setSelectedDate(newDate)
			}
		}
	}

	// Check if navigation buttons should be disabled
	const isPrevDisabled = selectedDate.toDateString() === minDate.toDateString()
	const isNextDisabled = selectedDate.toDateString() === maxDate.toDateString()

	// Check if student is marked as absent
	const isStudentAbsent = () => {
		if (!status_items) return false
		const absentOption = status_items.find(
			(item) =>
				item.alias.startsWith("attendance_status_") &&
				item.description.toLowerCase().includes("ausente")
		)
		return absentOption ? attendanceStatus === absentOption.alias : false
	}

	// Get status options by type
	const getStatusOptions = (statusType: string) => {
		if (!status_items) return []

		return status_items.filter((item) => {
			if (statusType === "attendance") {
				return item.alias.startsWith("attendance_status_")
			}
			if (statusType === "meal") {
				return item.alias.startsWith("meal_status_")
			}
			if (statusType === "mood") {
				return item.alias.startsWith("mood_status_")
			}
			if (statusType === "pee") {
				return item.alias.startsWith("pee_status_")
			}
			if (statusType === "poop") {
				return item.alias.startsWith("poop_status_")
			}
			return false
		})
	}

	// Get existing attendance data for selected date
	const getExistingAttendanceForDate = () => {
		if (
			!studentProfile?.academic_year_classroom_students?.[0]?.attendance_records
		) {
			return {}
		}

		const selectedDateString = selectedDate.toISOString().split("T")[0]
		const records =
			studentProfile.academic_year_classroom_students[0].attendance_records

		const existingData: { [key: string]: string } = {}

		records.forEach((record) => {
			const recordDateString = record.date.split("T")[0]
			if (recordDateString === selectedDateString) {
				switch (record.status_type) {
					case "attendance_status":
						existingData.attendance = record.status_value
						break
					case "meal_status":
						existingData.meal = record.status_value
						break
					case "mood_status":
						existingData.mood = record.status_value
						break
					case "pee_status":
						existingData.pee = record.status_value
						break
					case "poop_status":
						existingData.poop = record.status_value
						break
				}
			}
		})

		return existingData
	}

	// Load existing data when date changes
	React.useEffect(() => {
		const existingData = getExistingAttendanceForDate()
		const newState = {
			attendance: existingData.attendance || "",
			meal: existingData.meal || "",
			mood: existingData.mood || "",
			pee: existingData.pee || "",
			poop: existingData.poop || "",
		}

		setAttendanceStatus(newState.attendance)
		setMealStatus(newState.meal)
		setMoodStatus(newState.mood)
		setPeeStatus(newState.pee)
		setPoopStatus(newState.poop)

		// Store original state for comparison
		setOriginalAttendanceState(newState)
	}, [selectedDate, studentProfile])

	// Handle attendance status change
	const handleAttendanceStatusChange = (statusValue: string) => {
		setAttendanceStatus(statusValue)

		// If student is marked as absent, clear all other statuses
		if (status_items) {
			const absentOption = status_items.find(
				(item) =>
					item.alias.startsWith("attendance_status_") &&
					item.description.toLowerCase().includes("ausente")
			)

			if (absentOption && statusValue === absentOption.alias) {
				setMealStatus("")
				setMoodStatus("")
				setPeeStatus("")
				setPoopStatus("")
			}
		}
	}

	// Check if there are changes from original state
	const hasChanges = () => {
		return (
			originalAttendanceState.attendance !== attendanceStatus ||
			originalAttendanceState.meal !== mealStatus ||
			originalAttendanceState.mood !== moodStatus ||
			originalAttendanceState.pee !== peeStatus ||
			originalAttendanceState.poop !== poopStatus
		)
	}

	// Save attendance handler (placeholder)
	const handleSaveAttendance = async () => {
		if (!hasChanges()) return
		setStatus("busy")

		const res = await fetcher(`/mobile/students/${student.id}/attendance`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				date: selectedDate,
				attendance_records: [
					{
						status_type: "attendance_status",
						status_value: attendanceStatus,
					},
					{
						status_type: "meal_status",
						status_value: mealStatus,
					},
					{
						status_type: "mood_status",
						status_value: moodStatus,
					},
					{
						status_type: "pee_status",
						status_value: peeStatus,
					},
					{
						status_type: "poop_status",
						status_value: poopStatus,
					},
				],
			}),
		})

		if (!res.success) {
			if (__DEV__) {
				console.log({ res })
				console.error("Failed to save attendance")
			}
		}

		refreshStudentData().finally(() => {
			setStatus("idle")
		})
		refreshAppData()
	}

	const {
		chats,
		setSelectedChat,
		setIsChatWindowOpen,
		isChatWindowOpen,
		selectedChat,
		sendMessage,
	} = useTeacherChatContext()

	const fullName = studentProfile
		? `${studentProfile.first_name}${
				studentProfile.middle_name ? ` ${studentProfile.middle_name}` : ""
		  } ${studentProfile.last_name}${
				studentProfile.second_last_name
					? ` ${studentProfile.second_last_name}`
					: ""
		  }`
		: `${student.first_name}${
				student.middle_name ? ` ${student.middle_name}` : ""
		  } ${student.last_name}${
				student.second_last_name ? ` ${student.second_last_name}` : ""
		  }`

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	const getRelationshipLabel = (relationship: string) => {
		switch (relationship) {
			case "guardian_mother":
				return "Madre"
			case "guardian_father":
				return "Padre"
			case "guardian_other":
				return "Otro"
			default:
				return relationship
		}
	}

	const handleChatWithGuardian = () => {
		// Find existing chat for this student
		const existingChat = chats?.find((chat) => chat.student_id === student.id)

		if (existingChat) {
			// Open existing chat
			setSelectedChat(existingChat)
			setIsChatWindowOpen(true)
		} else {
			// Create a minimal chat object for new chats
			// The chat system will handle creating the actual chat when the first message is sent
			const newChat = {
				student_id: student.id,
				staff_id: "current_teacher", // This would be the current teacher's ID
				role: "teacher" as const,
				userInfo: {
					id: student.id,
					full_name: fullName,
				},
				messages: [],
			}
			setSelectedChat(newChat)
			setIsChatWindowOpen(true)
		}
	}

	const handleSendMessage = async (content: string) => {
		if (!selectedChat) return
		await sendMessage(selectedChat.student_id, content)
	}

	const handleBackFromChat = () => {
		setSelectedChat(null)
		setIsChatWindowOpen(false)
	}

	useEffect(() => {
		const handleBackPress = () => {
			onBack()
			return true
		}

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			handleBackPress
		)

		return () => backHandler.remove()
	}, [onBack])

	return (
		<View style={styles.profileContainer}>
			{/* Header */}
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={24}
							color={theme.colors.primary}
						/>
					</TouchableOpacity>
					<View style={styles.headerInfo}>
						<Text
							style={styles.studentNameHeader}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{student.first_name} {student.last_name}
						</Text>
						<Text style={styles.roleHeader}>Estudiante</Text>
					</View>
				</View>
			</SafeAreaView>

			{/* Content */}
			<ScrollView
				style={styles.content}
				contentContainerStyle={[
					styles.contentContainer,
					{ paddingBottom: insets.bottom + theme.spacing.lg },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Avatar Section */}
				<View style={styles.avatarSection}>
					<View style={styles.avatarContainer}>
						<Ionicons name="person" size={60} color={theme.colors.muted} />
					</View>
					<Text style={styles.fullName}>{fullName}</Text>
					<Text style={styles.subtitle}>Perfil del Estudiante</Text>
				</View>

				{isLoading || isLoadingStatusItems ? (
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>
							Cargando información del estudiante...
						</Text>
					</View>
				) : studentProfile ? (
					<>
						{/* Basic Information Section */}
						<SchoolCard style={styles.cardSpacing}>
							<Text style={styles.sectionTitle}>Información Básica</Text>

							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Nombre Completo</Text>
								<Text style={styles.infoValue}>{fullName}</Text>
							</View>

							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
								<Text style={styles.infoValue}>
									{formatDate(studentProfile.birthdate)}
								</Text>
							</View>

							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Género</Text>
								<Text style={styles.infoValue}>
									{studentProfile.gender_alias === "gender_male"
										? "Masculino"
										: "Femenino"}
								</Text>
							</View>

							{studentProfile.academic_year_classroom_students.length > 0 && (
								<View style={styles.infoItem}>
									<Text style={styles.infoLabel}>Salón Actual</Text>
									<Text style={styles.infoValue}>
										{
											studentProfile.academic_year_classroom_students[0]
												.classrooms.name
										}
									</Text>
								</View>
							)}
						</SchoolCard>

						{/* Guardians Section */}
						{studentProfile.student_guardians.length > 0 && (
							<SchoolCard style={styles.cardSpacing}>
								<Text style={styles.sectionTitle}>Representantes</Text>
								{studentProfile.student_guardians.map((guardian) => (
									<View key={guardian.guardian_id} style={styles.guardianItem}>
										<View style={styles.guardianHeader}>
											<Text style={styles.guardianName}>
												{guardian.users.full_name}
											</Text>
											{guardian.is_primary && (
												<View style={styles.primaryBadge}>
													<Text style={styles.primaryBadgeText}>Principal</Text>
												</View>
											)}
										</View>
										<Text style={styles.guardianRelationship}>
											{getRelationshipLabel(guardian.relationship_type_alias)}
										</Text>
										<Text style={styles.guardianEmail}>
											{guardian.users.email}
										</Text>
									</View>
								))}

								{/* Chat Button */}
								<TouchableOpacity
									style={styles.chatButton}
									onPress={handleChatWithGuardian}
									activeOpacity={0.7}
								>
									<Ionicons
										name="chatbubble-outline"
										size={20}
										color={theme.colors.white}
									/>
									<Text style={styles.chatButtonText}>Enviar Mensaje</Text>
								</TouchableOpacity>
							</SchoolCard>
						)}

						{/* Attendance Records Form */}
						<SchoolCard style={styles.cardSpacing}>
							<Text style={styles.sectionTitle}>Registros de Asistencia</Text>

							{/* Date Navigation */}
							<View style={styles.dateNavigation}>
								<TouchableOpacity
									style={[
										styles.dateNavButton,
										isPrevDisabled && styles.dateNavButtonDisabled,
									]}
									onPress={() => !isPrevDisabled && navigateDate("prev")}
									disabled={isPrevDisabled}
								>
									<Ionicons
										name="chevron-back"
										size={24}
										color={
											isPrevDisabled ? theme.colors.muted : theme.colors.primary
										}
									/>
								</TouchableOpacity>

								<Text style={styles.selectedDate}>
									{formatSelectedDate(selectedDate)}
								</Text>

								<TouchableOpacity
									style={[
										styles.dateNavButton,
										isNextDisabled && styles.dateNavButtonDisabled,
									]}
									onPress={() => !isNextDisabled && navigateDate("next")}
									disabled={isNextDisabled}
								>
									<Ionicons
										name="chevron-forward"
										size={24}
										color={
											isNextDisabled ? theme.colors.muted : theme.colors.primary
										}
									/>
								</TouchableOpacity>
							</View>

							{/* Status Selection Items */}
							<View style={styles.statusContainer}>
								{/* Asistencia */}
								<View style={styles.statusItem}>
									<Text style={styles.statusLabel}>Asistencia</Text>
									<View style={styles.statusOptions}>
										{getStatusOptions("attendance")
											.slice()

											.map((option) => (
												<TouchableOpacity
													key={option.alias}
													style={[
														styles.statusOption,
														attendanceStatus === option.alias &&
															styles.statusOptionSelected,
													]}
													onPress={() =>
														handleAttendanceStatusChange(option.alias)
													}
													activeOpacity={1}
													disabled={status === "busy"}
												>
													<Text
														style={[
															styles.statusOptionText,
															attendanceStatus === option.alias &&
																styles.statusOptionTextSelected,
														]}
													>
														{option.description}
													</Text>
												</TouchableOpacity>
											))}
									</View>
								</View>

								{/* Alimentación */}
								<View
									style={[
										styles.statusItem,
										isStudentAbsent() && styles.statusItemDisabled,
									]}
								>
									<Text
										style={[
											styles.statusLabel,
											isStudentAbsent() && styles.statusLabelDisabled,
										]}
									>
										Alimentación
									</Text>
									<View style={styles.statusOptions}>
										{getStatusOptions("meal").map((option) => (
											<TouchableOpacity
												key={option.alias}
												style={[
													styles.statusOption,
													mealStatus === option.alias &&
														styles.statusOptionSelected,
													isStudentAbsent() && styles.statusOptionDisabled,
												]}
												onPress={() =>
													!isStudentAbsent() && setMealStatus(option.alias)
												}
												activeOpacity={1}
												disabled={isStudentAbsent() || status === "busy"}
											>
												<Text
													style={[
														styles.statusOptionText,
														mealStatus === option.alias &&
															styles.statusOptionTextSelected,
													]}
												>
													{option.description}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>

								{/* Ánimo */}
								<View
									style={[
										styles.statusItem,
										isStudentAbsent() && styles.statusItemDisabled,
									]}
								>
									<Text
										style={[
											styles.statusLabel,
											isStudentAbsent() && styles.statusLabelDisabled,
										]}
									>
										Ánimo
									</Text>
									<View style={styles.statusOptions}>
										{getStatusOptions("mood").map((option) => (
											<TouchableOpacity
												key={option.alias}
												style={[
													styles.statusOption,
													moodStatus === option.alias &&
														styles.statusOptionSelected,
													isStudentAbsent() && styles.statusOptionDisabled,
												]}
												onPress={() =>
													!isStudentAbsent() && setMoodStatus(option.alias)
												}
												activeOpacity={1}
												disabled={isStudentAbsent() || status === "busy"}
											>
												<Text
													style={[
														styles.statusOptionText,
														moodStatus === option.alias &&
															styles.statusOptionTextSelected,
													]}
												>
													{option.description}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>

								{/* Orina */}
								<View
									style={[
										styles.statusItem,
										isStudentAbsent() && styles.statusItemDisabled,
									]}
								>
									<Text
										style={[
											styles.statusLabel,
											isStudentAbsent() && styles.statusLabelDisabled,
										]}
									>
										Orina
									</Text>
									<View style={styles.statusOptions}>
										{getStatusOptions("pee").map((option) => (
											<TouchableOpacity
												key={option.alias}
												style={[
													styles.statusOption,
													peeStatus === option.alias &&
														styles.statusOptionSelected,
													isStudentAbsent() && styles.statusOptionDisabled,
												]}
												onPress={() =>
													!isStudentAbsent() && setPeeStatus(option.alias)
												}
												activeOpacity={1}
												disabled={isStudentAbsent() || status === "busy"}
											>
												<Text
													style={[
														styles.statusOptionText,
														peeStatus === option.alias &&
															styles.statusOptionTextSelected,
													]}
												>
													{option.description}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>

								{/* Heces */}
								<View
									style={[
										styles.statusItem,
										isStudentAbsent() && styles.statusItemDisabled,
									]}
								>
									<Text
										style={[
											styles.statusLabel,
											isStudentAbsent() && styles.statusLabelDisabled,
										]}
									>
										Heces
									</Text>
									<View style={styles.statusOptions}>
										{getStatusOptions("poop").map((option) => (
											<TouchableOpacity
												key={option.alias}
												style={[
													styles.statusOption,
													poopStatus === option.alias &&
														styles.statusOptionSelected,
													isStudentAbsent() && styles.statusOptionDisabled,
												]}
												onPress={() =>
													!isStudentAbsent() && setPoopStatus(option.alias)
												}
												activeOpacity={1}
												disabled={isStudentAbsent() || status === "busy"}
											>
												<Text
													style={[
														styles.statusOptionText,
														poopStatus === option.alias &&
															styles.statusOptionTextSelected,
													]}
												>
													{option.description}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</View>

							{/* Save Button */}
							<TouchableOpacity
								style={[
									styles.saveButton,
									!hasChanges() && styles.saveButtonDisabled,
								]}
								onPress={handleSaveAttendance}
								activeOpacity={0.7}
								disabled={!hasChanges() || status === "busy"}
							>
								<Ionicons
									name="checkmark"
									size={20}
									color={hasChanges() ? theme.colors.white : theme.colors.muted}
								/>
								<Text
									style={[
										styles.saveButtonText,
										!hasChanges() && styles.saveButtonTextDisabled,
									]}
								>
									{status === "busy" ? "Guardando..." : "Guardar Registros"}
								</Text>
							</TouchableOpacity>
						</SchoolCard>
					</>
				) : (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>
							No se pudo cargar la información del estudiante
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Teacher Chat Window */}
			{isChatWindowOpen && selectedChat && (
				<TeacherChatWindow
					studentId={selectedChat.student_id}
					onBack={handleBackFromChat}
					onSendMessage={handleSendMessage}
				/>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	profileContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: theme.colors.background,
		zIndex: 1000,
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	backButton: {
		marginRight: theme.spacing.md,
		padding: theme.spacing.xs,
	},
	headerInfo: {
		flex: 1,
		paddingRight: theme.spacing.md,
	},
	studentNameHeader: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		color: theme.colors.text,
		fontWeight: "600",
	},
	roleHeader: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: 2,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: theme.spacing.lg,
	},
	avatarSection: {
		alignItems: "center",
		marginBottom: theme.spacing.xl,
	},
	avatarContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: theme.colors.surface,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: theme.spacing.md,
		...theme.shadow.card,
	},
	fullName: {
		fontSize: theme.typography.size.xl,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		textAlign: "center",
		marginBottom: theme.spacing.xs,
	},
	subtitle: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
	},
	cardSpacing: {
		marginBottom: theme.spacing.md,
	},
	sectionTitle: {
		fontSize: theme.typography.size.lg,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
	},
	infoItem: {
		marginBottom: theme.spacing.md,
		paddingBottom: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	infoLabel: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.muted,
		marginBottom: theme.spacing.xs,
		textTransform: "uppercase",
	},
	infoValue: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
	},
	placeholderText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		fontStyle: "italic",
	},
	loadingContainer: {
		padding: theme.spacing.xl,
		alignItems: "center",
	},
	loadingText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
	},
	errorContainer: {
		padding: theme.spacing.xl,
		alignItems: "center",
	},
	errorText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		textAlign: "center",
	},
	guardianItem: {
		paddingBottom: theme.spacing.md,
		marginBottom: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	guardianHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: theme.spacing.xs,
	},
	guardianName: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		flex: 1,
	},
	primaryBadge: {
		backgroundColor: theme.colors.primary,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs / 2,
		borderRadius: theme.radius.sm,
	},
	primaryBadgeText: {
		fontSize: 12,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		textTransform: "uppercase",
	},
	guardianRelationship: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		marginBottom: theme.spacing.xs / 2,
	},
	guardianEmail: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
	},
	attendanceItem: {
		paddingBottom: theme.spacing.md,
		marginBottom: theme.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	attendanceHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: theme.spacing.xs,
	},
	attendanceType: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.muted,
		textTransform: "uppercase",
	},
	attendanceTime: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
	},
	attendanceValue: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs / 2,
	},
	attendanceReason: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.muted,
		fontStyle: "italic",
	},
	chatButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.radius.md,
		marginTop: theme.spacing.md,
	},
	chatButtonText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
	// Attendance form styles
	dateNavigation: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: theme.spacing.lg,
		paddingHorizontal: theme.spacing.sm,
	},
	dateNavButton: {
		padding: theme.spacing.sm,
		borderRadius: theme.radius.sm,
		backgroundColor: theme.colors.surface,
	},
	dateNavButtonDisabled: {
		backgroundColor: theme.colors.background,
		opacity: 0.5,
	},
	selectedDate: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		textAlign: "center",
		flex: 1,
		marginHorizontal: theme.spacing.md,
	},
	statusContainer: {
		marginBottom: theme.spacing.lg,
	},
	statusItem: {
		marginBottom: theme.spacing.lg,
	},
	statusLabel: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.text,
		marginBottom: theme.spacing.sm,
	},
	statusOptions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: theme.spacing.sm,
	},
	statusOption: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
	},
	statusOptionSelected: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
	},
	statusOptionText: {
		fontSize: theme.typography.size.sm,
		fontFamily: theme.typography.family.regular,
		color: theme.colors.text,
	},
	statusOptionTextSelected: {
		color: theme.colors.white,
		fontFamily: theme.typography.family.bold,
	},
	saveButton: {
		backgroundColor: theme.colors.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.lg,
		borderRadius: theme.radius.md,
		marginTop: theme.spacing.sm,
	},
	saveButtonText: {
		fontSize: theme.typography.size.md,
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		marginLeft: theme.spacing.xs,
	},
	saveButtonDisabled: {
		backgroundColor: theme.colors.background,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	saveButtonTextDisabled: {
		color: theme.colors.muted,
	},
	statusItemDisabled: {
		opacity: 0.5,
	},
	statusLabelDisabled: {
		color: theme.colors.muted,
	},
	statusOptionDisabled: {
		backgroundColor: theme.colors.background,
		borderColor: theme.colors.muted,
		opacity: 0.5,
	},
})
