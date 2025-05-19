import React, {
	JSX,
	useState,
	useRef,
	useCallback,
	createContext,
	useContext,
} from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view"
import type { NativeSyntheticEvent } from "react-native"
import AnnouncementsScreen from "../screens/Announcements"
import SocialScreen from "../screens/Social"
import HomeScreen from "../screens/Home"
import MessagingScreen from "../screens/Messaging"
import OptionsScreen from "../screens/Options"
import {
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const Tab = createBottomTabNavigator()
const { width: screenWidth } = Dimensions.get("window")

// Type definitions
interface TabScreen {
	name: string
	component: React.ComponentType<any>
}

interface TabContextType {
	currentIndex: number
	setCurrentIndex: (index: number) => void
	pagerRef: React.RefObject<PagerView | null> | null
	navigateToTab: (index: number) => void
}

interface PageScrollStateChangedEvent {
	pageScrollState: "dragging" | "idle" | "settling"
}

// Tab screens array to maintain order
const tabScreens: TabScreen[] = [
	{ name: "Announcements", component: AnnouncementsScreen },
	{ name: "Social", component: SocialScreen },
	{ name: "Home", component: HomeScreen },
	{ name: "Messaging", component: MessagingScreen },
	{ name: "Options", component: OptionsScreen },
]

// Context to share state between tab navigator and pager
const TabContext = createContext<TabContextType>({
	currentIndex: 2,
	setCurrentIndex: () => {},
	pagerRef: null,
	navigateToTab: () => {},
})

// Custom wrapper component that handles the swipe functionality
function SwipeableTabContent(): JSX.Element {
	const pagerRef = useRef<PagerView>(null)
	const [currentIndex, setCurrentIndex] = useState<number>(2) // Start with Home (index 2)
	const isSwipingRef = useRef<boolean>(false)
	const targetIndexRef = useRef<number>(2)

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
			if (index !== currentIndex && !isSwipingRef.current) {
				targetIndexRef.current = index
				setCurrentIndex(index)
				pagerRef.current?.setPage(index)
			}
		},
		[currentIndex]
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
			value={{ currentIndex, setCurrentIndex, pagerRef, navigateToTab }}
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
					scrollEnabled={true}
					pageMargin={0}
				>
					{tabScreens.map((screen, index) => (
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
function CustomTabBar(): JSX.Element {
	const { currentIndex, navigateToTab } = useContext(TabContext)
	const insets = useSafeAreaInsets()

	const getIconName = (
		routeName: string,
		focused: boolean
	): keyof typeof Ionicons.glyphMap => {
		switch (routeName) {
			case "Announcements":
				return focused ? "notifications" : "notifications-outline"
			case "Social":
				return focused ? "albums" : "albums-outline"
			case "Home":
				return focused ? "grid" : "grid-outline"
			case "Messaging":
				return focused ? "chatbubbles" : "chatbubbles-outline"
			case "Options":
				return focused ? "settings" : "settings-outline"
			default:
				return "ellipse"
		}
	}

	return (
		<View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
			{tabScreens.map((screen, index) => {
				const focused = currentIndex === index
				const color = focused ? "#007AFF" : "#8E8E93"
				const iconName = getIconName(screen.name, focused)

				return (
					<TouchableWithoutFeedback
						key={screen.name}
						onPress={() => navigateToTab(index)}
						accessible={true}
						accessibilityLabel={`${screen.name} tab`}
						accessibilityRole="tab"
						accessibilityState={{ selected: focused }}
					>
						<View style={styles.tabButton}>
							<View style={styles.iconContainer}>
								<Ionicons name={iconName} size={24} color={color} />
							</View>
						</View>
					</TouchableWithoutFeedback>
				)
			})}
		</View>
	)
}

// Wrapper for individual tab screens (if you need navigation props)
interface TabScreenWrapperProps {
	children: React.ReactNode
	index: number
}

function TabScreenWrapper({
	children,
	index,
}: TabScreenWrapperProps): JSX.Element {
	return <View style={styles.screenWrapper}>{children}</View>
}

export default function BottomTabNavigator(): JSX.Element {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: { display: "none" }, // Hide default tab bar
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
		backgroundColor: "#f5f5f5",
	},
	screenWrapper: {
		flex: 1,
	},
	tabBar: {
		flexDirection: "row",
		height: 100,
		backgroundColor: "#ffffff",
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "#e0e0e0",
		paddingTop: 0, // Add some top padding for the icons
	},
	tabButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 0,
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
		padding: 9,
	},
})
