import { Ionicons } from "@expo/vector-icons"
import React, { useContext, useEffect, useState } from "react"
import {
	Image,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import AppContext from "../contexts/AppContext"
import { getStaffPhotoUrl } from "../helpers/staff"
import { displayName } from "../helpers/students"
import { theme } from "../helpers/theme"
import LogoutButton from "./common/LogoutButton"
import StudentPhoto from "./ui/studentPhoto"

const StatusBar: React.FC = () => {
	const {
		roles,
		user,
		students,
		selectedStudent,
		setSelectedStudent,
		selectedRole,
		setSelectedRole,
	} = useContext(AppContext)!
	const [modalVisible, setModalVisible] = useState(false)
	const [teacherPhotoError, setTeacherPhotoError] = useState(false)

	useEffect(() => {
		if (selectedStudent === null && students.length) {
			setSelectedStudent(students[0])
		}
	}, [students])

	const toggleModal = () => {
		setModalVisible(!modalVisible)
	}

	const hasMultipleRoles = roles.length > 1
	const is_guardian =
		(selectedRole === "guardian" ||
			(!selectedRole && roles.includes("guardian"))) &&
		selectedStudent
	const is_staff =
		selectedRole === "staff" || (!selectedRole && roles.includes("staff"))
	const is_admin =
		selectedRole === "admin" || (!selectedRole && roles.includes("admin"))
	const teacherPhotoUrl =
		(is_staff || is_admin) && user?.id ? getStaffPhotoUrl(user.id) : null

	//const gender = selectedStudent.gender_alias === "gender_male" ? "boy" : "girl"
	const currentRole =
		selectedRole === "admin"
			? "Administrator"
			: selectedRole === "staff"
			? "Staff"
			: selectedRole === "guardian"
			? "Representante"
			: "Usuario"

	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={toggleModal} style={styles.profileContainer}>
					{is_guardian && (
						<>
							<StudentPhoto
								student={selectedStudent!}
								style={styles.profileImage}
							/>
							<View>
								<Text style={styles.name}>{displayName(selectedStudent!)}</Text>
								<Text style={styles.classroom}>
									{selectedStudent!.academic_year_classroom_students?.[0]
										?.classrooms?.name || ""}
								</Text>
							</View>
							<Ionicons
								name="chevron-down"
								size={18}
								color={theme.colors.muted}
								style={styles.chevronDown}
							/>
						</>
					)}
					{!is_guardian && (
						<>
							{teacherPhotoUrl && !teacherPhotoError ? (
								<Image
									source={{ uri: teacherPhotoUrl }}
									style={styles.profileImage}
									onError={() => setTeacherPhotoError(true)}
								/>
							) : (
								<View style={styles.teacherPhotoPlaceholder}>
									<Ionicons
										name="person"
										size={24}
										color={theme.colors.primary}
									/>
								</View>
							)}
							<View style={styles.teacherNameContainer}>
								<Text style={styles.name}>{user?.full_name.toLowerCase()}</Text>
							</View>
						</>
					)}
				</TouchableOpacity>
			</View>

			<Modal visible={modalVisible} animationType="fade" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<TouchableOpacity style={styles.editButton} onPress={toggleModal}>
							<Ionicons
								name="close-outline"
								size={24}
								color={theme.colors.muted}
							/>
						</TouchableOpacity>
						{is_guardian && (
							<>
								<Text style={styles.modalName}>
									{displayName(selectedStudent!)}
								</Text>

								<StudentPhoto
									student={selectedStudent!}
									style={styles.modalImage}
								/>
								{students.length > 1 && (
									<>
										<Text style={styles.sectionTitle}>Cambiar Perfil</Text>
										{students.map((s) => (
											<TouchableOpacity
												style={styles.profileOption}
												key={s.id}
												onPress={() => {
													setSelectedStudent(s)
													toggleModal()
												}}
											>
												<Text style={styles.profileOptionText}>
													{displayName(s)}
												</Text>
											</TouchableOpacity>
										))}
									</>
								)}
							</>
						)}

						{(is_staff || is_admin) && (
							<>
								<Text style={styles.modalName}>{user?.full_name}</Text>
								{teacherPhotoUrl && !teacherPhotoError ? (
									<Image
										source={{ uri: teacherPhotoUrl }}
										style={styles.modalImage}
										onError={() => setTeacherPhotoError(true)}
									/>
								) : (
									<View style={styles.teacherModalPhotoPlaceholder}>
										<Ionicons
											name="person"
											size={48}
											color={theme.colors.primary}
										/>
									</View>
								)}
							</>
						)}

						{/* Role switching for users with multiple roles */}
						{hasMultipleRoles && (
							<>
								<Text style={styles.sectionTitle}>Rol: {currentRole}</Text>
								<TouchableOpacity
									style={styles.profileOption}
									onPress={() => {
										setSelectedRole(null)
										toggleModal()
									}}
								>
									<Ionicons
										name="swap-horizontal"
										size={20}
										color={theme.colors.primary}
										style={{ marginRight: theme.spacing.xs }}
									/>
									<Text style={styles.profileOptionText}>
										Seleccionar otro rol
									</Text>
								</TouchableOpacity>
							</>
						)}

						<LogoutButton />
					</View>
				</View>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	chevronDown: {
		marginTop: theme.spacing.xs / 2,
		marginLeft: theme.spacing.xs / 2,
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	profileContainer: {
		flexDirection: "row",
		alignItems: "stretch",
		backgroundColor: theme.colors.white,
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		borderRadius: theme.radius.lg,
		...theme.shadow.soft,
		flex: 1,
	},
	profileImage: {
		width: 44,
		height: 44,
		borderRadius: 22,
		marginRight: theme.spacing.sm,
		backgroundColor: theme.colors.gray,
		borderWidth: 2,
		borderColor: theme.colors.primary,
	},
	teacherPhotoPlaceholder: {
		width: 44,
		height: 44,
		borderRadius: 22,
		marginRight: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		borderColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	teacherNameContainer: {
		justifyContent: "center",
	},
	teacherModalPhotoPlaceholder: {
		width: 90,
		height: 90,
		borderRadius: 45,
		marginBottom: theme.spacing.md,
		backgroundColor: theme.colors.surface,
		borderWidth: 3,
		borderColor: theme.colors.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	name: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "bold",
		color: theme.colors.text,
		textTransform: "capitalize",
	},
	classroom: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.6)",
	},
	modalContent: {
		width: 320,
		padding: theme.spacing.xl,
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.xl,
		alignItems: "center",
		...theme.shadow.card,
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	modalImage: {
		width: 90,
		height: 90,
		borderRadius: 45,
		marginBottom: theme.spacing.md,
		borderWidth: 3,
		borderColor: theme.colors.primary,
	},
	modalName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		fontWeight: "bold",
		marginBottom: theme.spacing.md,
		color: theme.colors.text,
	},
	editButton: {
		position: "absolute",
		top: theme.spacing.sm,
		right: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.pill,
		padding: theme.spacing.xs / 2,
	},
	sectionTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "bold",
		marginVertical: theme.spacing.sm,
		color: theme.colors.text,
	},
	profileOption: {
		flexDirection: "row",
		padding: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.sm,
		marginVertical: theme.spacing.xs / 2,
		minWidth: 200,
		alignItems: "center",
		justifyContent: "center",
	},
	profileOptionText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		fontWeight: "500",
	},
	closeButton: {
		marginTop: theme.spacing.sm,
	},
})

export default StatusBar
