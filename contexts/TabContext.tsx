import { createContext } from "react"
import PagerView from "react-native-pager-view"

interface TabScreen {
	name: string
	component: React.ComponentType<any>
	disabled?: boolean
}

interface TabContextType {
	currentIndex: number
	setCurrentIndex: (index: number) => void
	pagerRef: React.RefObject<PagerView | null> | null
	navigateToTab: (index: number) => void
	isPhotoViewerActive: boolean
	isStudentProfileActive: boolean
	setIsStudentProfileActive: (active: boolean) => void
	isSocialPostModalActive: boolean
	setIsSocialPostModalActive: (active: boolean) => void
	isAttendanceModalActive: boolean
	setIsAttendanceModalActive: (active: boolean) => void
	isClassroomStudentListActive: boolean
	setIsClassroomStudentListActive: (active: boolean) => void
	isClassroomAttendanceModalActive: boolean
	setIsClassroomAttendanceModalActive: (active: boolean) => void
	appScreens: TabScreen[]
}

// Context to share state between tab navigator and pager
export const TabContext = createContext<TabContextType>({
	currentIndex: 2,
	setCurrentIndex: () => {},
	pagerRef: null,
	navigateToTab: () => {},
	isPhotoViewerActive: false,
	isStudentProfileActive: false,
	setIsStudentProfileActive: () => {},
	isSocialPostModalActive: false,
	setIsSocialPostModalActive: () => {},
	isAttendanceModalActive: false,
	setIsAttendanceModalActive: () => {},
	isClassroomStudentListActive: false,
	setIsClassroomStudentListActive: () => {},
	isClassroomAttendanceModalActive: false,
	setIsClassroomAttendanceModalActive: () => {},
	appScreens: [],
})
