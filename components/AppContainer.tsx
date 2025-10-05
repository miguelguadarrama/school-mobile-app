import { ReactNode, useEffect, useState } from "react"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { ChatProvider } from "../contexts/ChatContext"
import { setupNotificationListeners } from "../services/notifications"
import { attendanceStatus, student } from "../types/students"
import { ClassroomData } from "../types/teacher"
import { SessionUser } from "../types/user"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const [selectedRole, setSelectedRole] = useState<"admin" | "guardian" | "staff" | null>(null)
	const {
		data,
		isLoading,
		mutate: refreshAppData,
	} = useSWR<{
		user: SessionUser
		students: student[]
		attendance: attendanceStatus[]
		roles: ("admin" | "guardian" | "staff")[]
		classrooms?: ClassroomData[]
	}>(loggedIn ? "/mobile/profile" : null)

	const academic_year_id =
		data?.students?.[0]?.academic_year_classroom_students?.[0]?.classrooms
			?.academic_years?.id || data?.classrooms?.[0]?.academic_year_id

	// Set up notification listeners when app is authenticated
	useEffect(() => {
		if (loggedIn) {
			const cleanup = setupNotificationListeners()
			return cleanup
		}
	}, [loggedIn])

	if (loggedIn && isLoading) {
		return <LoadingScreen />
	}

	const handleSetDate = (date: Date) => {
		// prevent a date in the future
		if (date > new Date()) return
		setSelectedDate(date)
	}

	const academic_year =
		data?.students?.[0]?.academic_year_classroom_students?.[0]?.classrooms
			?.academic_years

	//console.log({ id: data?.students?.[0]?.id, attendance: data?.attendance })
	return (
		<AppContext.Provider
			value={{
				isDataLoading: isLoading,
				refreshAppData,
				roles: data?.roles || [],
				selectedRole,
				setSelectedRole,
				students: data?.students || [],
				selectedStudent,
				setSelectedStudent,
				attendance: data?.attendance || [],
				selectedDate,
				setSelectedDate: handleSetDate,
				classrooms: data?.classrooms,
				user: data?.user,
				academic_year_id,
				academic_year,
			}}
		>
			<ChatProvider selectedStudentId={selectedStudent?.id}>
				{children}
			</ChatProvider>
		</AppContext.Provider>
	)
}

export default AppContainer
