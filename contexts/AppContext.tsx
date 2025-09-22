import { createContext } from "react"
import { chat_message, chats } from "../types/chat"
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
	addOptimisticMessage: (
		staffId: string,
		studentId: string,
		message: chat_message
	) => void
	removeOptimisticMessage: (
		staffId: string,
		studentId: string,
		messageId: string
	) => void
	roles: ("admin" | "guardian" | "staff")[]
	refreshAppData: () => void
	isDataLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
