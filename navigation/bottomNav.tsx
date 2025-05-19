import React, { useState, useRef, useCallback } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import PagerView from "react-native-pager-view"
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

// Tab screens array to maintain order
const tabScreens = [
	{ name: "Announcements", component: AnnouncementsScreen },
	{ name: "Social", component: SocialScreen },
	{ name: "Home", component: HomeScreen },
	{ name: "Messaging", component: MessagingScreen },
	{ name: "Options", component: OptionsScreen },
]

// Context to share state between tab navigator and pager
const TabContext = React.createContext({
	currentIndex: 2,
	setCurrentIndex: () => {},
	pagerRef: null,
})

// Custom wrapper component that handles the swipe functionality
function SwipeableTabContent() {
	const pagerRef = useRef(null)
	const [currentIndex, setCurrentIndex] = useState(2) // Start with Home (index 2)
	const isSwipingRef = useRef(false)
	const targetIndexRef = useRef(2)

	// Handle page selection from PagerView with better sync
	const onPageSelected = useCallback((event) => {
		const newIndex = event.nativeEvent.position
		setCurrentIndex(newIndex)
		targetIndexRef.current = newIndex
		isSwipingRef.current = false
	}, [])

	// Handle when page scrolling starts
	const onPageScrollStateChanged = useCallback(
		(event) => {
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
		(index) => {
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
		(ScreenComponent, index) => {
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
function CustomTabBar() {
	const { currentIndex, navigateToTab } = React.useContext(TabContext)
	const insets = useSafeAreaInsets()

	const getIconName = (routeName, focused) => {
		switch (routeName) {
			case "Announcements":
				return focused ? "notifications" : "notifications-outline"
			case "Social":
				return focused ? "albums" : "albums-outline"
			case "Home":
				return focused ? "home" : "home-outline"
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
function TabScreenWrapper({ children, index }) {
	return <View style={styles.screenWrapper}>{children}</View>
}

export default function BottomTabNavigator() {
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
