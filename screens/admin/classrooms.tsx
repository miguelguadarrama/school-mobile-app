import { Ionicons } from "@expo/vector-icons"
import { useContext, useState } from "react"
import {
	ActivityIndicator,
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

interface AdminClassroomListProps {
	onClassroomPress?: (classroom: admin_classrooms) => void
	onProgressPress?: (classroom: admin_classrooms) => void
}

const AdminClassroomList: React.FC<AdminClassroomListProps> = ({
	onClassroomPress,
	onProgressPress,
}) => {
	const { selectedRole } = useContext(AppContext)!
	const { data, isLoading, mutate } = useSWR<admin_classrooms[]>(
		selectedRole === "admin" ? `/mobile/admin` : null
	)
	const [refreshing, setRefreshing] = useState(false)

	const handleClassroomPress = (classroom: admin_classrooms) => {
		onClassroomPress?.(classroom)
	}

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
					activeOpacity={0.5}
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
							<TouchableOpacity
								style={styles.statItem}
								onPress={() => handleClassroomPress(classroom)}
								activeOpacity={0.7}
							>
								<Ionicons
									name="people"
									size={20}
									color={theme.colors.accent4}
								/>
								<Text style={styles.statLabel}>Alumnos</Text>
								<Text style={styles.statValue}>{classroom.student_count}</Text>
							</TouchableOpacity>

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
								onPress={() => onProgressPress?.(classroom)}
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
})

export default AdminClassroomList
