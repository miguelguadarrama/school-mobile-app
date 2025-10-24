import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
	getFocusedRouteNameFromRoute,
	useNavigationState,
} from "@react-navigation/native"
import React, {
	JSX,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import type { NativeSyntheticEvent } from "react-native"
import {
	BackHandler,
	Dimensions,
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from "react-native"
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view"
import { SafeAreaView } from "react-native-safe-area-context"
import AppContext from "../contexts/AppContext"
import { useChatContext } from "../contexts/ChatContext"
import { TabContext } from "../contexts/TabContext"
import { TeacherChatProvider, useTeacherChatContext } from "../contexts/TeacherChatContext"
import { theme } from "../helpers/theme"
import AnnouncementsScreen from "../screens/Announcements"
import HomeScreen from "../screens/Home"
import MessagingScreen from "../screens/Messaging"
import OptionsScreen from "../screens/Options"
import RoleSelector from "../screens/RoleSelector"
import SocialScreen from "../screens/social/Stack"
import HomeTeacherScreen from "../screens/teacher/Home"
import TeacherMessagingScreen from "../screens/teacher/messaging"

// Remove the individual wrapper since we'll wrap the entire navigator

const Tab = createBottomTabNavigator()
const { width: screenWidth } = Dimensions.get("window")

// Type definitions
interface TabScreen {
	name: string
	component: React.ComponentType<any>
	disabled?: boolean
}

interface PageScrollStateChangedEvent {
	pageScrollState: "dragging" | "idle" | "settling"
}

// Tab screens array to maintain order
const tabScreens: TabScreen[] = [
	{ name: "Anuncios", component: AnnouncementsScreen },
	{ name: "Social", component: SocialScreen },
	{ name: "Inicio", component: HomeScreen },
	{ name: "Mensajería", component: MessagingScreen },
	{ name: "Opciones", component: OptionsScreen },
]

const teacherTabScreens: TabScreen[] = [
	{ name: "Anuncios", component: AnnouncementsScreen },
	{ name: "Social", component: SocialScreen },
	{ name: "Inicio", component: HomeTeacherScreen },
	{ name: "Mensajería", component: TeacherMessagingScreen },
	{ name: "Opciones", component: OptionsScreen },
]

const adminTabScreens: TabScreen[] = [
	{ name: "Anuncios", component: AnnouncementsScreen },
	{ name: "Social", component: SocialScreen },
	{ name: "Inicio", component: HomeTeacherScreen },
	{ name: "Mensajería", component: TeacherMessagingScreen },
	{ name: "Opciones", component: OptionsScreen },
]

// Custom hook to check teacher chat context (now always available)
const useTeacherChatWindowState = () => {
	const context = useTeacherChatContext()
	return context.isChatWindowOpen
}

// Wrapper to handle role selection before rendering tabs
function RoleAwareTabContent(): JSX.Element {
	const { roles, selectedRole } = useContext(AppContext)!

	// Determine if user has multiple roles
	const hasMultipleRoles = roles.length > 1

	// If user has multiple roles but hasn't selected one yet, show role selector
	if (hasMultipleRoles && !selectedRole) {
		return <RoleSelector />
	}

	return <SwipeableTabContent />
}

// Custom wrapper component that handles the swipe functionality
function SwipeableTabContent(): JSX.Element {
	const appContext = useContext(AppContext)!
	const { roles, selectedRole } = appContext
	const pagerRef = useRef<PagerView>(null)
	const [currentIndex, setCurrentIndex] = useState<number>(2) // Start with Home (index 2)
	const [isPhotoViewerActive, setIsPhotoViewerActive] = useState<boolean>(false)
	const [isStudentProfileActive, setIsStudentProfileActive] = useState<boolean>(false)
	const [isSocialPostModalActive, setIsSocialPostModalActive] = useState<boolean>(false)
	const [isAttendanceModalActive, setIsAttendanceModalActive] = useState<boolean>(false)
	const isSwipingRef = useRef<boolean>(false)
	const targetIndexRef = useRef<number>(2)
	const { isChatWindowOpen } = useChatContext()
	const isTeacherChatWindowOpen = useTeacherChatWindowState()

	// Monitor navigation state to detect PhotoViewer or PhotoGrid
	const navigationState = useNavigationState((state) => state)

	useEffect(() => {
		// Function to check if PhotoViewer or PhotoGrid is currently active
		const checkPhotoViewerStatus = () => {
			if (!navigationState) return false

			// Recursively check all routes for PhotoViewer or PhotoGrid
			const findPhotoViewer = (routes: any[]): boolean => {
				for (const route of routes) {
					if (route.name === "PhotoViewer" || route.name === "PhotoGrid") {
						return true
					}
					if (route.state?.routes) {
						if (findPhotoViewer(route.state.routes)) {
							return true
						}
					}
				}
				return false
			}

			return findPhotoViewer(navigationState.routes || [])
		}

		const photoViewerActive = checkPhotoViewerStatus()
		setIsPhotoViewerActive(photoViewerActive)
	}, [navigationState])

	// Handle page selection from PagerView with better sync
	const onPageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
		const newIndex = event.nativeEvent.position
		setCurrentIndex(newIndex)
		targetIndexRef.current = newIndex
		isSwipingRef.current = false
	}, [])

	// Handle when page scrolling starts
	const onPageScrollStateChanged = useCallback(
		(event: NativeSyntheticEvent<PageScrollStateChangedEvent>) => {
			const state = event.nativeEvent.pageScrollState
			if (state === "dragging") {
				isSwipingRef.current = true
			} else if (state === "idle") {
				isSwipingRef.current = false
				// Ensure we're on the correct page when idle
				if (targetIndexRef.current !== currentIndex) {
					pagerRef.current?.setPage(targetIndexRef.current)
				}
			}
		},
		[currentIndex]
	)

	// Handle tab button press
	const navigateToTab = useCallback(
		(index: number) => {
			if (
				index !== currentIndex &&
				!isSwipingRef.current &&
				!isPhotoViewerActive &&
				!isChatWindowOpen &&
				!isTeacherChatWindowOpen &&
				!isStudentProfileActive &&
				!isAttendanceModalActive
			) {
				targetIndexRef.current = index
				setCurrentIndex(index)
				pagerRef.current?.setPage(index)
			}
		},
		[currentIndex, isPhotoViewerActive, isChatWindowOpen, isTeacherChatWindowOpen, isStudentProfileActive, isAttendanceModalActive]
	)

	// Expose tab navigation to AppContext for notification deep linking
	useEffect(() => {
		// Create a navigation function that bypasses modal/chat checks for notifications
		const handleNotificationNavigation = (tabIndex: number) => {
			if (__DEV__) {
				console.log('Notification navigation to tab:', tabIndex)
			}
			targetIndexRef.current = tabIndex
			setCurrentIndex(tabIndex)
			pagerRef.current?.setPage(tabIndex)
		}

		// Store in AppContainer via a prop/callback mechanism
		// We'll use a global ref pattern since AppContext doesn't re-render
		;(window as any).__tabNavigationCallback = handleNotificationNavigation

		return () => {
			delete (window as any).__tabNavigationCallback
		}
	}, [])

	// Render screens with performance optimization
	const renderScreen = useCallback(
		(ScreenComponent: React.ComponentType<any>, index: number) => {
			// Render current screen and adjacent screens
			if (Math.abs(index - currentIndex) <= 1) {
				return <ScreenComponent />
			}
			return <View style={styles.placeholderScreen} />
		},
		[currentIndex]
	)

	// Determine which screens to show based on selected role (or single role)
	const effectiveRole = selectedRole || (roles.includes("staff") ? "staff" : roles.includes("admin") ? "admin" : "guardian")
	const appScreens =
		effectiveRole === "staff" ? teacherTabScreens :
		effectiveRole === "admin" ? adminTabScreens :
		tabScreens

	// Handle Android back button
	useEffect(() => {
		if (Platform.OS !== "android") return

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				// If any modal is active, don't handle the back button (let default behavior handle it)
				if (
					isPhotoViewerActive ||
					isChatWindowOpen ||
					isTeacherChatWindowOpen ||
					isStudentProfileActive ||
					isSocialPostModalActive ||
					isAttendanceModalActive
				) {
					return false
				}

				// If not on Home screen (index 2), navigate to Home
				if (currentIndex !== 2) {
					navigateToTab(2)
					return true // Prevent default behavior (exit app)
				}

				// On Home screen, allow default behavior (exit app)
				return false
			}
		)

		return () => backHandler.remove()
	}, [
		currentIndex,
		isPhotoViewerActive,
		isChatWindowOpen,
		isTeacherChatWindowOpen,
		isStudentProfileActive,
		isSocialPostModalActive,
		isAttendanceModalActive,
		navigateToTab,
	])

	return (
		<TabContext.Provider
			value={{
				currentIndex,
				setCurrentIndex,
				pagerRef,
				navigateToTab,
				isPhotoViewerActive,
				isStudentProfileActive,
				setIsStudentProfileActive,
				isSocialPostModalActive,
				setIsSocialPostModalActive,
				isAttendanceModalActive,
				setIsAttendanceModalActive,
				appScreens,
			}}
		>
			<View style={styles.container}>
				<PagerView
					ref={pagerRef}
					style={styles.pagerView}
					initialPage={currentIndex}
					onPageSelected={onPageSelected}
					onPageScrollStateChanged={onPageScrollStateChanged}
					orientation="horizontal"
					overdrag={false}
					scrollEnabled={!isPhotoViewerActive && !isChatWindowOpen && !isTeacherChatWindowOpen && !isStudentProfileActive && !isSocialPostModalActive && !isAttendanceModalActive} // Disable scrolling when PhotoViewer, ChatWindow, StudentProfile, SocialPostModal, or AttendanceModal is active
					pageMargin={0}
				>
					{appScreens
						.filter((k) => !k.disabled)
						.map((screen, index) => (
							<View key={screen.name} style={styles.page}>
								{renderScreen(screen.component, index)}
							</View>
						))}
				</PagerView>
				<CustomTabBar />
			</View>
		</TabContext.Provider>
	)
}

// Custom tab bar component
function CustomTabBar(): JSX.Element | null {
	const { currentIndex, navigateToTab, isPhotoViewerActive, isStudentProfileActive, isSocialPostModalActive, isAttendanceModalActive, appScreens } =
		useContext(TabContext)
	const { isChatWindowOpen } = useChatContext()
	const isTeacherChatWindowOpen = useTeacherChatWindowState()

	const getIconName = (
		routeName: string,
		focused: boolean
	): keyof typeof Ionicons.glyphMap => {
		switch (routeName) {
			case "Anuncios":
				return focused ? "notifications" : "notifications-outline"
			case "Social":
				return focused ? "images" : "images-outline"
			case "Inicio":
				return focused ? "apps" : "apps-outline"
			case "Mensajería":
				return focused ? "chatbubbles" : "chatbubbles-outline"
			case "Opciones":
				return focused ? "settings" : "settings-outline"
			default:
				return "ellipse"
		}
	}

	// Hide tab bar when PhotoViewer, ChatWindow, StudentProfile, SocialPostModal, or AttendanceModal is active
	if (isPhotoViewerActive || isChatWindowOpen || isTeacherChatWindowOpen || isStudentProfileActive || isSocialPostModalActive || isAttendanceModalActive) {
		return null
	}

	return (
		<SafeAreaView edges={["bottom"]} style={styles.safeAreaContainer}>
			<View style={styles.tabBar}>
				{appScreens.map((screen, index) => {
					const focused = currentIndex === index
					const iconName = getIconName(screen.name, focused)

					return (
						<TouchableWithoutFeedback
							disabled={screen.disabled}
							key={screen.name}
							onPress={() => navigateToTab(index)}
							accessible={true}
							accessibilityLabel={`${screen.name} tab`}
							accessibilityRole="tab"
							accessibilityState={{ selected: focused }}
						>
							<View style={styles.tabButton}>
								<View
									key={`${screen.name}-${focused}`}
									style={
										focused ? styles.iconContainerFocused : styles.iconContainer
									}
								>
									<Ionicons
										name={iconName}
										size={focused ? 28 : 24}
										color={focused ? theme.colors.white : theme.colors.muted}
									/>
								</View>
							</View>
						</TouchableWithoutFeedback>
					)
				})}
			</View>
		</SafeAreaView>
	)
}

// Wrapper for individual tab screens (if you need navigation props)
interface TabScreenWrapperProps {
	children: React.ReactNode
	index: number
}

export default function BottomTabNavigator(): JSX.Element {
	return (
		<TeacherChatProvider>
			<Tab.Navigator
				screenOptions={({ route }) => {
					// Get the currently focused route name
					const routeName = getFocusedRouteNameFromRoute(route)

					return {
						headerShown: false,
						tabBarStyle: { display: "none" }, // Hide default tab bar
					}
				}}
			>
				<Tab.Screen
					name="SwipeableTabs"
					component={RoleAwareTabContent}
					options={{ tabBarStyle: { display: "none" } }}
				/>
			</Tab.Navigator>
		</TeacherChatProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	pagerView: {
		flex: 1,
	},
	page: {
		flex: 1,
		width: screenWidth,
	},
	placeholderScreen: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	screenWrapper: {
		flex: 1,
	},
	safeAreaContainer: {
		backgroundColor: theme.colors.surface,
		...theme.shadow.soft,
	},
	tabBar: {
		flexDirection: "row",
		height: 80,
		backgroundColor: theme.colors.surface,
		borderTopWidth: 0,
		paddingTop: 0,
		paddingHorizontal: theme.spacing.xs,
	},
	tabButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: theme.spacing.xs,
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "transparent",
	},
	iconContainerFocused: {
		justifyContent: "center",
		alignItems: "center",
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: theme.colors.primary,
		transform: [{ scale: 1.2 }],
		elevation: 4,
		shadowColor: theme.colors.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
	},
})
