import { createContext } from "react"
import PagerView from "react-native-pager-view"

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
})
