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
	Dimensions,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from "react-native"
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { TabContext } from "../contexts/TabContext"
import { theme } from "../helpers/theme"
import AnnouncementsScreen from "../screens/Announcements"
import HomeScreen from "../screens/Home"
import MessagingScreen from "../screens/Messaging"
import OptionsScreen from "../screens/Options"
import SocialScreen from "../screens/social/Stack"

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

// Custom wrapper component that handles the swipe functionality
function SwipeableTabContent(): JSX.Element {
	const pagerRef = useRef<PagerView>(null)
	const [currentIndex, setCurrentIndex] = useState<number>(2) // Start with Home (index 2)
	const [isPhotoViewerActive, setIsPhotoViewerActive] = useState<boolean>(false)
	const isSwipingRef = useRef<boolean>(false)
	const targetIndexRef = useRef<number>(2)

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
				!isPhotoViewerActive
			) {
				targetIndexRef.current = index
				setCurrentIndex(index)
				pagerRef.current?.setPage(index)
			}
		},
		[currentIndex, isPhotoViewerActive]
	)

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

	return (
		<TabContext.Provider
			value={{
				currentIndex,
				setCurrentIndex,
				pagerRef,
				navigateToTab,
				isPhotoViewerActive,
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
					scrollEnabled={!isPhotoViewerActive} // Disable scrolling when PhotoViewer is active
					pageMargin={0}
				>
					{tabScreens
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
	const { currentIndex, navigateToTab, isPhotoViewerActive } =
		useContext(TabContext)

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

	// Hide tab bar when PhotoViewer is active
	if (isPhotoViewerActive) {
		return null
	}

	return (
		<SafeAreaView edges={["bottom"]} style={styles.safeAreaContainer}>
			<View style={styles.tabBar}>
				{tabScreens.map((screen, index) => {
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
				component={SwipeableTabContent}
				options={{ tabBarStyle: { display: "none" } }}
			/>
		</Tab.Navigator>
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
