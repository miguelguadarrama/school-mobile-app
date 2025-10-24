import React, { useMemo, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { displayShortName } from "../helpers/students"
import { theme } from "../helpers/theme"
import { student } from "../types/students"
import { ClassroomData } from "../types/teacher"
import SchoolCard from "./SchoolCard"

interface UpcomingBirthdaysProps {
	classrooms?: ClassroomData[]
}

const UpcomingBirthdays: React.FC<UpcomingBirthdaysProps> = ({
	classrooms,
}) => {
	const [showAll, setShowAll] = useState(false)

	const upcomingBirthdays = useMemo(() => {
		const today = new Date()
		today.setHours(0, 0, 0, 0) // Reset time to start of day

		if (!classrooms || classrooms.length === 0) {
			return []
		}

		const allStudents = classrooms.flatMap((classroom) =>
			classroom.academic_year_classroom_students.flatMap((cys) => cys.students)
		)

		const studentsWithBirthdays = allStudents
			.map((student) => {
				const birthdate = new Date(student.birthdate)
				const thisYearBirthday = new Date(
					today.getFullYear(),
					birthdate.getMonth(),
					birthdate.getDate()
				)
				thisYearBirthday.setHours(0, 0, 0, 0) // Reset time to start of day

				// Check if birthday is today
				const isToday =
					birthdate.getMonth() === today.getMonth() &&
					birthdate.getDate() === today.getDate()

				// If birthday already passed this year (and not today), check next year's birthday
				if (thisYearBirthday < today) {
					thisYearBirthday.setFullYear(today.getFullYear() + 1)
				}

				const daysUntilBirthday = Math.floor(
					(thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
				)

				return {
					student,
					daysUntilBirthday,
					isToday,
					birthdate: thisYearBirthday,
				}
			})
			.filter((item) => item.daysUntilBirthday <= 30)
			.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)

		return studentsWithBirthdays
	}, [classrooms])

	if (upcomingBirthdays.length === 0) {
		return (
			<SchoolCard>
				<Text style={styles.title}>🎂 Próximos Cumpleaños</Text>
				<Text style={styles.emptyMessage}>
					No hay cumpleaños próximos en los siguientes 30 días
				</Text>
			</SchoolCard>
		)
	}

	const displayedBirthdays = showAll
		? upcomingBirthdays
		: upcomingBirthdays.slice(0, 3)
	const hiddenCount = upcomingBirthdays.length - 3

	return (
		<SchoolCard>
			<Text style={styles.title}>🎂 Próximos Cumpleaños</Text>
			<View style={styles.birthdayList}>
				{displayedBirthdays.map(
					({ student, daysUntilBirthday, isToday, birthdate }) => {
						const formatDate = (date: Date) => {
							const months = [
								"Ene",
								"Feb",
								"Mar",
								"Abr",
								"May",
								"Jun",
								"Jul",
								"Ago",
								"Sep",
								"Oct",
								"Nov",
								"Dic",
							]
							const month = months[date.getMonth()]
							const day = date.getDate()
							const year = date.getFullYear()
							return `${month} ${day} ${year}`
						}

						return (
							<View
								key={student.id}
								style={[styles.birthdayItem, isToday && styles.todayBirthday]}
							>
								{isToday ? (
									<>
										<Text style={styles.todayName}>
											🎉 {displayShortName(student as unknown as student)}
										</Text>
										<Text style={styles.todayLabel}>¡HOY!</Text>
									</>
								) : (
									<>
										<View style={styles.studentInfo}>
											<Text style={styles.studentName}>
												{displayShortName(student as unknown as student)}
											</Text>
											<Text style={styles.birthdateText}>
												{formatDate(birthdate)}
											</Text>
										</View>
										<Text style={styles.daysUntil}>
											{daysUntilBirthday === 0
												? "¡Hoy!"
												: daysUntilBirthday === 1
												? "Mañana"
												: `En ${daysUntilBirthday} días`}
										</Text>
									</>
								)}
							</View>
						)
					}
				)}
			</View>

			{upcomingBirthdays.length > 3 && (
				<TouchableOpacity
					onPress={() => setShowAll(!showAll)}
					style={styles.showMoreButton}
				>
					<Text style={styles.showMoreText}>
						{showAll
							? "Ver menos"
							: `Ver ${hiddenCount} más ${
									hiddenCount === 1 ? "cumpleaños" : "cumpleaños"
							  }`}
					</Text>
				</TouchableOpacity>
			)}
		</SchoolCard>
	)
}

const styles = StyleSheet.create({
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: theme.colors.primary,
		marginBottom: theme.spacing.md,
	},
	emptyMessage: {
		fontSize: 14,
		color: theme.colors.muted,
		textAlign: "center",
		paddingVertical: theme.spacing.md,
	},
	birthdayList: {
		gap: theme.spacing.sm,
	},
	birthdayItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: theme.spacing.sm,
	},
	todayBirthday: {
		backgroundColor: "#FFF9E6",
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.radius.md,
		borderBottomWidth: 0,
		paddingVertical: theme.spacing.md,
	},
	studentInfo: {
		flex: 1,
		flexDirection: "column",
		gap: 2,
	},
	studentName: {
		fontSize: 15,
		color: theme.colors.muted,
	},
	birthdateText: {
		fontSize: 12,
		color: theme.colors.muted,
	},
	todayName: {
		fontSize: 18,
		fontWeight: "700",
		color: theme.colors.primary,
		flex: 1,
	},
	daysUntil: {
		fontSize: 13,
		color: theme.colors.secondary,
	},
	todayLabel: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FF6B35",
	},
	showMoreButton: {
		marginTop: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: theme.colors.border,
	},
	showMoreText: {
		fontSize: 14,
		color: theme.colors.primary,
		fontWeight: "600",
	},
})

export default UpcomingBirthdays
