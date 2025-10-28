import { Ionicons } from "@expo/vector-icons"
import { useContext, useState } from "react"
import {
	ActivityIndicator,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import useSWR from "swr"
import SchoolCard from "../../components/SchoolCard"
import AppContext from "../../contexts/AppContext"
import { theme } from "../../helpers/theme"
import { admin_classrooms } from "../../types/students"

const AdminClassroomList = () => {
	const { selectedRole } = useContext(AppContext)!
	const { data, isLoading, mutate } = useSWR<admin_classrooms[]>(
		selectedRole === "admin" ? `/mobile/admin` : null
	)
	const [refreshing, setRefreshing] = useState(false)
	const [showProgressModal, setShowProgressModal] = useState(false)

	const handleRefresh = async () => {
		setRefreshing(true)
		await mutate()
		setRefreshing(false)
	}

	if (selectedRole !== "admin") {
		return null
	}

	if (isLoading || !data) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={theme.colors.primary} />
				<Text style={styles.loadingText}>Cargando aulas...</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerText}>
					<Text style={styles.title}>Gestión de Salas</Text>
					<Text style={styles.subtitle}>
						{data.length} {data.length === 1 ? "sala" : "salas"} en total
					</Text>
				</View>
				<TouchableOpacity
					style={styles.refreshButton}
					onPress={handleRefresh}
					disabled={refreshing}
				>
					<Ionicons name="refresh" size={20} color={theme.colors.primary} />
					<Text style={styles.refreshButtonText}>Actualizar</Text>
				</TouchableOpacity>
			</View>

			{data.map((classroom) => {
				const attendancePercentage =
					classroom.student_count > 0
						? Math.round(
								(classroom.attendance_count / classroom.student_count) * 100
						  )
						: 0

				return (
					<SchoolCard key={classroom.id} style={styles.classroomCard}>
						<View style={styles.classroomHeader}>
							<View style={styles.classroomIcon}>
								<Ionicons
									name="school"
									size={24}
									color={theme.colors.primary}
								/>
							</View>
							<View style={styles.classroomInfo}>
								<Text style={styles.classroomName}>{classroom.name}</Text>
								{classroom.description && (
									<Text style={styles.classroomDescription}>
										{classroom.description}
									</Text>
								)}
							</View>
						</View>

						<View style={styles.divider} />

						<View style={styles.statsContainer}>
							<View style={styles.statItem}>
								<Ionicons
									name="people"
									size={20}
									color={theme.colors.accent4}
								/>
								<Text style={styles.statLabel}>Alumnos</Text>
								<Text style={styles.statValue}>{classroom.student_count}</Text>
							</View>

							<View style={styles.statItem}>
								<Ionicons
									name="person"
									size={20}
									color={theme.colors.secondary}
								/>
								<Text style={styles.statLabel}>Personal</Text>
								<Text style={styles.statValue}>{classroom.staff_count}</Text>
							</View>

							<TouchableOpacity
								style={styles.statItem}
								onPress={() => setShowProgressModal(true)}
								activeOpacity={0.7}
							>
								<Ionicons
									name="checkmark-circle"
									size={20}
									color={
										attendancePercentage >= 80
											? theme.colors.success
											: attendancePercentage >= 50
											? "#F59E0B"
											: "#EF4444"
									}
								/>
								<View style={styles.progressLabelContainer}>
									<Text style={styles.statLabel}>Progreso</Text>
									<Ionicons
										name="information-circle-outline"
										size={14}
										color={theme.colors.muted}
										style={styles.infoIcon}
									/>
								</View>
								<Text
									style={[
										styles.statValue,
										{
											color:
												attendancePercentage >= 80
													? theme.colors.success
													: attendancePercentage >= 50
													? "#F59E0B"
													: "#EF4444",
										},
									]}
								>
									{classroom.attendance_count}/{classroom.student_count}
								</Text>
								<Text
									style={[
										styles.percentageText,
										{
											color:
												attendancePercentage >= 80
													? theme.colors.success
													: attendancePercentage >= 50
													? "#F59E0B"
													: "#EF4444",
										},
									]}
								>
									({attendancePercentage}%)
								</Text>
							</TouchableOpacity>
						</View>
					</SchoolCard>
				)
			})}

			{/* Progress Info Modal */}
			<Modal
				visible={showProgressModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowProgressModal(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setShowProgressModal(false)}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Ionicons
								name="information-circle"
								size={32}
								color={theme.colors.primary}
							/>
							<Text style={styles.modalTitle}>¿Qué es el Progreso?</Text>
						</View>
						<Text style={styles.modalText}>
							Representa el progreso de reporte de asistencia por parte del
							personal docente.
						</Text>
						<TouchableOpacity
							style={styles.modalButton}
							onPress={() => setShowProgressModal(false)}
						>
							<Text style={styles.modalButtonText}>Entendido</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.colors.background,
		marginTop: theme.spacing.lg,
	},
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.colors.background,
		paddingVertical: theme.spacing.xl,
	},
	loadingText: {
		marginTop: theme.spacing.sm,
		fontSize: theme.typography.size.md,
		color: theme.colors.muted,
		fontFamily: theme.typography.family.regular,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: theme.spacing.md,
		marginTop: theme.spacing.xs,
	},
	headerText: {
		flex: 1,
	},
	title: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "700",
		color: theme.colors.text,
		marginBottom: theme.spacing.xs / 2,
	},
	subtitle: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
	},
	refreshButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: theme.spacing.sm,
		paddingVertical: theme.spacing.xs,
		backgroundColor: `${theme.colors.primary}15`,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: `${theme.colors.primary}30`,
		marginLeft: theme.spacing.xs,
	},
	refreshButtonText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.sm,
		color: theme.colors.primary,
		marginLeft: theme.spacing.xs / 2,
		fontWeight: "600",
	},
	classroomCard: {
		marginBottom: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
	},
	classroomHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: theme.spacing.sm,
	},
	classroomIcon: {
		width: 40,
		height: 40,
		borderRadius: theme.radius.sm,
		backgroundColor: `${theme.colors.primary}15`,
		justifyContent: "center",
		alignItems: "center",
		marginRight: theme.spacing.sm,
	},
	classroomInfo: {
		flex: 1,
	},
	classroomName: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "700",
		color: theme.colors.text,
		marginBottom: 2,
	},
	classroomDescription: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		lineHeight: 16,
	},
	divider: {
		height: 1,
		backgroundColor: theme.colors.border,
		marginVertical: theme.spacing.sm,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	statItem: {
		flex: 1,
		alignItems: "center",
		paddingHorizontal: theme.spacing.xs / 2,
	},
	statLabel: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: theme.colors.muted,
		marginTop: theme.spacing.xs / 2,
		marginBottom: 2,
		textAlign: "center",
		lineHeight: 14,
	},
	statValue: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		fontWeight: "700",
		color: theme.colors.text,
		textAlign: "center",
		lineHeight: 18,
	},
	percentageText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		fontWeight: "600",
		marginTop: 1,
		lineHeight: 14,
	},
	progressLabelContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	infoIcon: {
		marginLeft: 4,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		backgroundColor: theme.colors.surface,
		borderRadius: theme.radius.lg,
		padding: theme.spacing.xl,
		marginHorizontal: theme.spacing.lg,
		maxWidth: 400,
		width: "85%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalHeader: {
		alignItems: "center",
		marginBottom: theme.spacing.md,
	},
	modalTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.lg,
		fontWeight: "700",
		color: theme.colors.text,
		marginTop: theme.spacing.sm,
		textAlign: "center",
	},
	modalText: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: theme.spacing.lg,
	},
	modalButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.lg,
		alignItems: "center",
	},
	modalButtonText: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.white,
		fontWeight: "600",
	},
})

export default AdminClassroomList
