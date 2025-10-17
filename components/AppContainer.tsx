import * as SecureStore from "expo-secure-store"
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

const SELECTED_ROLE_KEY = "user_selected_role"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const [selectedRole, setSelectedRole] = useState<"admin" | "guardian" | "staff" | null>(null)
	const [isRoleLoaded, setIsRoleLoaded] = useState(false)
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

	// Load saved role when user logs in
	useEffect(() => {
		const loadSavedRole = async () => {
			if (loggedIn && data?.roles) {
				try {
					// If user has only one role, automatically set it
					if (data.roles.length === 1) {
						setSelectedRole(data.roles[0])
						await SecureStore.setItemAsync(SELECTED_ROLE_KEY, data.roles[0])
					} else {
						// For multiple roles, load saved preference
						const savedRole = await SecureStore.getItemAsync(SELECTED_ROLE_KEY)
						if (savedRole && data.roles.includes(savedRole as any)) {
							// Only set saved role if user still has that role
							setSelectedRole(savedRole as "admin" | "guardian" | "staff")
						}
					}
				} catch (error) {
					console.error("Error loading saved role:", error)
				} finally {
					setIsRoleLoaded(true)
				}
			} else if (!loggedIn) {
				setIsRoleLoaded(false)
			}
		}

		loadSavedRole()
	}, [loggedIn, data?.roles])

	// Set up notification listeners when app is authenticated
	useEffect(() => {
		if (loggedIn) {
			const cleanup = setupNotificationListeners()
			return cleanup
		}
	}, [loggedIn])

	if (loggedIn && (isLoading || !isRoleLoaded)) {
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

	// Handler to persist role selection
	const handleSetSelectedRole = async (role: "admin" | "guardian" | "staff" | null) => {
		setSelectedRole(role)
		try {
			if (role) {
				await SecureStore.setItemAsync(SELECTED_ROLE_KEY, role)
			} else {
				await SecureStore.deleteItemAsync(SELECTED_ROLE_KEY)
			}
		} catch (error) {
			console.error("Error saving role:", error)
		}
	}

	//console.log({ id: data?.students?.[0]?.id, attendance: data?.attendance })
	return (
		<AppContext.Provider
			value={{
				isDataLoading: isLoading,
				refreshAppData,
				roles: data?.roles || [],
				selectedRole,
				setSelectedRole: handleSetSelectedRole,
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
