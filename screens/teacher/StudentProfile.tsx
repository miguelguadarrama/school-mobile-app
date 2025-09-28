import { Ionicons } from "@expo/vector-icons"
import React, { useEffect } from "react"
import {
	BackHandler,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useSWR from "swr"
import SchoolCard from "../../components/SchoolCard"
import { useTeacherChatContext } from "../../contexts/TeacherChatContext"
import { theme } from "../../helpers/theme"
import { StudentProfileData } from "../../types/students"
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
	const { data: studentProfile, isLoading } = useSWR<StudentProfileData>(
		`/mobile/students/${student.id}`
	)

	const {
		chats,
		setSelectedChat,
		setIsChatWindowOpen,
		isChatWindowOpen,
		selectedChat,
		sendMessage
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

	const getStatusLabel = (statusType: string, statusValue: string) => {
		switch (statusType) {
			case "attendance_status":
				switch (statusValue) {
					case "attendance_status_present":
						return "Presente"
					case "attendance_status_absent":
						return "Ausente"
					case "attendance_status_late":
						return "Tarde"
					default:
						return statusValue
				}
			case "meal_status":
				switch (statusValue) {
					case "meal_status_ok":
						return "Comió bien"
					case "meal_status_little":
						return "Comió poco"
					case "meal_status_no":
						return "No comió"
					default:
						return statusValue
				}
			case "mood_status":
				switch (statusValue) {
					case "mood_status_happy":
						return "Feliz"
					case "mood_status_tired":
						return "Cansado"
					case "mood_status_sad":
						return "Triste"
					case "mood_status_sick":
						return "Enfermo"
					default:
						return statusValue
				}
			case "poop_status":
				return statusValue === "poop_status_yes" ? "Sí" : "No"
			case "pee_status":
				return statusValue === "pee_status_yes" ? "Sí" : "No"
			default:
				return statusValue
		}
	}

	const handleChatWithGuardian = () => {
		// Find existing chat for this student
		const existingChat = chats?.find(chat => chat.student_id === student.id)

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
				contentContainerStyle={styles.contentContainer}
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

				{isLoading ? (
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

						{/* Today's Attendance Records */}
						{studentProfile.academic_year_classroom_students.length > 0 &&
							studentProfile.academic_year_classroom_students[0]
								.attendance_records.length > 0 && (
								<SchoolCard style={styles.cardSpacing}>
									<Text style={styles.sectionTitle}>Registros de Hoy</Text>
									{studentProfile.academic_year_classroom_students[0].attendance_records
										.filter((record) => {
											const recordDate = new Date(record.date).toDateString()
											const today = new Date().toDateString()
											return recordDate === today
										})
										.map((record) => (
											<View key={record.id} style={styles.attendanceItem}>
												<View style={styles.attendanceHeader}>
													<Text style={styles.attendanceType}>
														{record.status_type === "attendance_status" &&
															"Asistencia"}
														{record.status_type === "meal_status" &&
															"Alimentación"}
														{record.status_type === "mood_status" &&
															"Estado de Ánimo"}
														{record.status_type === "poop_status" &&
															"Deposición"}
														{record.status_type === "pee_status" && "Orina"}
													</Text>
													<Text style={styles.attendanceTime}>
														{new Date(record.created_at).toLocaleTimeString(
															"es-ES",
															{
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</Text>
												</View>
												<Text style={styles.attendanceValue}>
													{getStatusLabel(
														record.status_type,
														record.status_value
													)}
												</Text>
												{record.reason && (
													<Text style={styles.attendanceReason}>
														Motivo: {record.reason}
													</Text>
												)}
											</View>
										))}
								</SchoolCard>
							)}
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
})
