import * as SecureStore from "expo-secure-store"
import { ReactNode, useEffect, useState } from "react"
import useSWR from "swr"
import AppContext from "../contexts/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { ChatProvider } from "../contexts/ChatContext"
import {
	NotificationData,
	setNotificationHandler,
	setupNotificationChannels,
	setupNotificationListeners,
} from "../services/notifications"
import { attendanceStatus, student } from "../types/students"
import { ClassroomData } from "../types/teacher"
import { SessionUser } from "../types/user"
import LoadingScreen from "./Loading"

const SELECTED_ROLE_KEY = "user_selected_role"

const AppContainer = ({ children }: { children: ReactNode }) => {
	const { loggedIn } = useAuth()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [selectedStudent, setSelectedStudent] = useState<student | null>(null)
	const [selectedRole, setSelectedRole] = useState<
		"admin" | "guardian" | "staff" | null
	>(null)
	const [isRoleLoaded, setIsRoleLoaded] = useState(false)
	const [pendingNotification, setPendingNotification] =
		useState<NotificationData | null>(null)
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

	// Set up notification channels and listeners when app is authenticated
	useEffect(() => {
		if (loggedIn) {
			// Set up channels for Android notification grouping
			setupNotificationChannels()

			// Set up notification event listeners
			const cleanup = setupNotificationListeners()
			return cleanup
		}
	}, [loggedIn])

	// Handle notification taps - switches role and stores notification data
	useEffect(() => {
		const handleNotification = async (notificationData: NotificationData) => {
			if (__DEV__) {
				console.log("Handling notification tap:", notificationData)
			}

			// Store the notification to process after role is set
			setPendingNotification(notificationData)

			// Switch to the target role if different from current
			if (notificationData.targetRole !== selectedRole) {
				await handleSetSelectedRole(notificationData.targetRole)
			}
		}

		setNotificationHandler(handleNotification)
	}, [selectedRole])

	// Process pending notification after role change or data load
	useEffect(() => {
		if (pendingNotification && data?.students && isRoleLoaded) {
			// For guardian role, switch to the correct student if needed
			if (
				pendingNotification.targetRole === "guardian" &&
				pendingNotification.studentId
			) {
				const targetStudent = data.students.find(
					(s) => s.id === pendingNotification.studentId
				)
				if (targetStudent && targetStudent.id !== selectedStudent?.id) {
					setSelectedStudent(targetStudent)
				}
			}

			// Navigate to messaging tab (index 3) after role and student are set
			if (pendingNotification.type === "chat_message") {
				// Small delay to ensure role/student switch completes
				setTimeout(() => {
					const navCallback = (window as any).__tabNavigationCallback
					if (navCallback) {
						navCallback(3) // Messaging tab is index 3
					}
				}, 100)
			}
			// Notification will be cleared by the messaging screen after it processes it
		}
	}, [pendingNotification, data?.students, isRoleLoaded, selectedStudent])

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
	const handleSetSelectedRole = async (
		role: "admin" | "guardian" | "staff" | null
	) => {
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

	const clearPendingNotification = () => {
		setPendingNotification(null)
	}

	const requestTabNavigation = (tabIndex: number) => {
		const navCallback = (window as any).__tabNavigationCallback
		if (navCallback) {
			navCallback(tabIndex)
		}
	}

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
				classrooms:
					data?.classrooms?.filter((k) => {
						if (selectedRole === "admin") return true
						return k.academic_year_classroom_staff.some(
							(s) => s.staff.user_id === data.user.id
						)
					}) || [],
				user: data?.user,
				academic_year_id,
				academic_year,
				pendingNotification,
				clearPendingNotification,
				requestTabNavigation,
			}}
		>
			<ChatProvider selectedStudentId={selectedStudent?.id}>
				{children}
			</ChatProvider>
		</AppContext.Provider>
	)
}

export default AppContainer
