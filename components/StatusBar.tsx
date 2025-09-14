import React, { useContext, useEffect, useState } from "react"
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import AppContext from "../contexts/AppContext"
import { displayName } from "../helpers/students"
import { theme } from "../helpers/theme"

const StatusBar: React.FC = () => {
	const { logout } = useAuth()
	const { students, selectedStudent, setSelectedStudent } =
		useContext(AppContext)!
	const [modalVisible, setModalVisible] = useState(false)

	useEffect(() => {
		if (selectedStudent === null && students.length) {
			setSelectedStudent(students[0])
		}
	}, [students])

	const toggleModal = () => {
		setModalVisible(!modalVisible)
	}

	if (!selectedStudent) {
		return null
	}

	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={toggleModal} style={styles.profileContainer}>
					<Image
						source={{ uri: "https://placehold.co/150" }}
						style={styles.profileImage}
					/>
					<View>
						<Text style={styles.name}>{displayName(selectedStudent)}</Text>
						<Text style={styles.classroom}>
							{selectedStudent.academic_year_classroom_students?.[0]?.classrooms
								?.name || ""}
						</Text>
					</View>
					<Ionicons
						name="chevron-down"
						size={18}
						color={theme.colors.muted}
						style={styles.chevronDown}
					/>
				</TouchableOpacity>
			</View>

			<Modal visible={modalVisible} animationType="fade" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Image
							source={{
								uri: "https://placehold.co/150",
							}}
							style={styles.modalImage}
						/>
						<Text style={styles.modalName}>{displayName(selectedStudent)}</Text>

						<TouchableOpacity style={styles.editButton} onPress={toggleModal}>
							<Ionicons name="close-outline" size={24} color={theme.colors.muted} />
						</TouchableOpacity>

						{students.length > 1 && (
							<>
								<Text style={styles.sectionTitle}>Switch Profile</Text>
								{students.map((s) => (
									<TouchableOpacity
										style={styles.profileOption}
										key={s.id}
										onPress={() => {
											setSelectedStudent(s)
											toggleModal()
										}}
									>
										<Text style={styles.profileOptionText}>{displayName(s)}</Text>
									</TouchableOpacity>
								))}
							</>
						)}

						<TouchableOpacity
							style={styles.signoutButton}
							onPress={() => logout()}
						>
							<Text style={styles.signoutText}>Cerrar Sesión</Text>
						</TouchableOpacity>
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
	name: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "bold",
		color: theme.colors.text,
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
		backgroundColor: theme.colors.gray,
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
		padding: theme.spacing.sm,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.sm,
		marginVertical: theme.spacing.xs / 2,
		minWidth: 200,
		alignItems: "center",
	},
	profileOptionText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		fontWeight: "500",
	},
	signoutButton: {
		marginTop: theme.spacing.lg,
		paddingHorizontal: theme.spacing.lg,
		paddingVertical: theme.spacing.sm,
		backgroundColor: theme.colors.danger,
		borderRadius: theme.radius.lg,
	},
	signoutText: {
		fontFamily: theme.typography.family.bold,
		color: theme.colors.white,
		fontWeight: "bold",
		fontSize: theme.typography.size.md,
	},
	closeButton: {
		marginTop: theme.spacing.sm,
	},
})

export default StatusBar
