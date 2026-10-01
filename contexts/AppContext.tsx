import { createContext } from "react"
import { NotificationData } from "../services/notifications"
import {
	academic_year,
	attendanceStatus,
	student,
	student_enrollment,
} from "../types/students"
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
	// Academic years the selected student was enrolled in, active year first
	academic_years: academic_year[]
	setSelectedAcademicYearId: (academic_year_id: string | null) => void
	// Classroom enrollment of the selected student for the selected academic year
	selectedEnrollment?: student_enrollment
	// Guardian is browsing a prior (inactive) academic year: read-only
	isPastAcademicYear: boolean
	// Query string to append to guardian endpoints ("" for the active year)
	academicYearQuery: string
	pendingNotification: NotificationData | null
	clearPendingNotification: () => void
	requestTabNavigation?: (tabIndex: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
