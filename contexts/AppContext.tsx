import { createContext } from "react"
import { student } from "../types/students"

interface AppContextType {
	students: student[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export default AppContext
