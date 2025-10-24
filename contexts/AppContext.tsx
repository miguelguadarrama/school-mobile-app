import { createContext } from "react"
import { NotificationData } from "../services/notifications"
import { academic_year, attendanceStatus, student } from "../types/students"
import { ClassroomData } from "../types/teacher"
import { SessionUser } from "../types/user"

interface AppContextType {
	students: student[]
	selectedStudent: student | null
	attendance: attendanceStatus[]
	setSelectedStudent: (student: student | null) => void
	selectedDate: Date
	setSelectedDate: (date: Date) => void
	roles: ("admin" | "guardian" | "staff")[]
	selectedRole: "admin" | "guardian" | "staff" | null
	setSelectedRole: (role: "admin" | "guardian" | "staff" | null) => void
	refreshAppData: () => void
	classrooms?: ClassroomData[]
	isDataLoading: boolean
	user?: SessionUser
	academic_year_id?: string
	academic_year?: academic_year
	pendingNotification: NotificationData | null
	clearPendingNotification: () => void
	requestTabNavigation?: (tabIndex: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
