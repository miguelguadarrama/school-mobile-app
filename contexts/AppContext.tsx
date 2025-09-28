import { createContext } from "react"
import { attendanceStatus, student } from "../types/students"
import { ClassroomData } from "../types/teacher"

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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
