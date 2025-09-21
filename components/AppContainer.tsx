import { ReactNode, useState, useEffect } from "react"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import useSWR from "swr"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"
import { setupNotificationListeners } from "../services/notifications"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const { data, isLoading } = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
	}>(loggedIn ? "/mobile/profile" : null)
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)

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
				students: data?.students || [],
				selectedStudent,
				setSelectedStudent,
				attendance: data?.attendance || [],
				selectedDate,
				setSelectedDate: handleSetDate,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export default AppContainer
