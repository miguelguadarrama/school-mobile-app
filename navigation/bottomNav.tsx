import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import AnnouncementsScreen from "../screens/Announcements"
import SocialScreen from "../screens/Social"
import HomeScreen from "../screens/Home"
import MessagingScreen from "../screens/Messaging"
import OptionsScreen from "../screens/Options"
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const Tab = createBottomTabNavigator()

export default function BottomTabNavigator() {
	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: styles.tabBar,
				tabBarButton: (props) => (
					<TouchableWithoutFeedback onPress={props.onPress}>
						<View style={styles.tabButton}>{props.children}</View>
					</TouchableWithoutFeedback>
				),
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap

					switch (route.name) {
						case "Announcements":
							iconName = focused ? "notifications" : "notifications-outline"
							break
						case "Social":
							iconName = focused ? "albums" : "albums-outline"
							break
						case "Home":
							iconName = focused ? "home" : "home-outline"
							break
						case "Messaging":
							iconName = focused ? "chatbubbles" : "chatbubbles-outline"
							break
						case "Options":
							iconName = focused ? "settings" : "settings-outline"
							break
						default:
							iconName = "ellipse"
					}

					return (
						<View style={styles.iconContainer}>
							<Ionicons name={iconName} size={size} color={color} />
						</View>
					)
				},
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
			})}
		>
			<Tab.Screen name="Announcements" component={AnnouncementsScreen} />
			<Tab.Screen name="Social" component={SocialScreen} />
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Messaging" component={MessagingScreen} />
			<Tab.Screen name="Options" component={OptionsScreen} />
		</Tab.Navigator>
	)
}

const styles = StyleSheet.create({
	tabBar: {
		height: 100,
	},
	tabButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
})
