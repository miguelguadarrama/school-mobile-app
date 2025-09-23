import { ReactNode, useEffect, useState } from "react"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { ChatProvider } from "../contexts/ChatContext"
import { setupNotificationListeners } from "../services/notifications"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const {
		data,
		isLoading,
		mutate: refreshAppData,
	} = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
		roles: ("admin" | "guardian" | "staff")[]
	}>(loggedIn ? "/mobile/profile" : null)

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

	//console.log({ id: data?.students?.[0]?.id, attendance: data?.attendance })
	return (
		<AppContext.Provider
			value={{
				isDataLoading: isLoading,
				refreshAppData,
				roles: data?.roles || [],
				students: data?.students || [],
				selectedStudent,
				setSelectedStudent,
				attendance: data?.attendance || [],
				selectedDate,
				setSelectedDate: handleSetDate,
			}}
		>
			<ChatProvider selectedStudentId={selectedStudent?.id}>
				{children}
			</ChatProvider>
		</AppContext.Provider>
	)
}

export default AppContainer
