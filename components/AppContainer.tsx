import { ReactNode } from "react"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import useSWR from "swr"
import { student } from "../types/students"
import LoadingScreen from "./Loading"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const { data: students, isLoading } = useSWR<student[]>(
		loggedIn ? "/mobile/profile" : null
	)
	if (loggedIn && isLoading) {
		return <LoadingScreen />
	}
	return (
		<AppContext.Provider value={{ students: students || [] }}>
			{children}
		</AppContext.Provider>
	)
}

export default AppContainer
