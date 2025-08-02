import { createContext } from "react"
import { student } from "../types/students"

interface AppContextType {
	students: student[]
	selectedStudent: student | null
	setSelectedStudent: (student: student | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
