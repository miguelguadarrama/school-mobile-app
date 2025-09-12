import { ReactNode, useState } from "react"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import useSWR from "swr"
import { attendanceStatus, student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const { data, isLoading } = useSWR<{
		students: student[]
		attendance: attendanceStatus[]
	}>(loggedIn ? "/mobile/profile" : null)
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	if (loggedIn && isLoading) {
		return <LoadingScreen />
	}
	console.log({ id: data?.students?.[0]?.id, attendance: data?.attendance })
	return (
		<AppContext.Provider
			value={{
				students: data?.students || [],
				selectedStudent,
				setSelectedStudent,
				attendance: data?.attendance || [],
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export default AppContainer
