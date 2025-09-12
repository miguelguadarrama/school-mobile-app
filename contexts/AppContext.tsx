import { createContext } from "react"
import { attendanceStatus, student } from "../types/students"

interface AppContextType {
	students: student[]
	selectedStudent: student | null
	attendance: attendanceStatus[]
	setSelectedStudent: (student: student | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
