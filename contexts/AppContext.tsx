import { createContext } from "react"
import { chats } from "../types/chat"
import { attendanceStatus, student } from "../types/students"

interface AppContextType {
	students: student[]
	selectedStudent: student | null
	attendance: attendanceStatus[]
	setSelectedStudent: (student: student | null) => void
	selectedDate: Date
	setSelectedDate: (date: Date) => void
	chats: chats[] | undefined
	refreshChat: () => void
	chatLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
