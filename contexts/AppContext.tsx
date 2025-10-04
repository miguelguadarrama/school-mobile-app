import { createContext } from "react"
import { attendanceStatus, student } from "../types/students"
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
	refreshAppData: () => void
	classrooms?: ClassroomData[]
	isDataLoading: boolean
	user?: SessionUser
	academic_year_id?: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
