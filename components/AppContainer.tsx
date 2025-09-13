import { ReactNode, useState } from "react"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import useSWR from "swr"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const { data, isLoading } = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
	}>(loggedIn ? "/mobile/profile" : null)
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
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
