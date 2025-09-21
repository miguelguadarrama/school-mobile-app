import { ReactNode, useEffect, useState } from "react"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { setupNotificationListeners } from "../services/notifications"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const { data, isLoading } = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
	}>(loggedIn ? "/mobile/profile" : null)
	const {
		data: chats,
		isLoading: chatLoading,
		mutate: refreshChat,
	} = useSWR(
		loggedIn && selectedStudent ? `/mobile/chat/${selectedStudent.id}` : null,
		{
			refreshInterval: 15000,
		}
	)

	if (__DEV__) {
		console.log(JSON.stringify(chats, null, 2))
	}

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
				chats,
				refreshChat,
				chatLoading,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export default AppContainer
