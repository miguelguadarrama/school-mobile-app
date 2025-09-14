// SocialStack.tsx
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SocialScreen from "../Social"
import PhotoGridScreen from "./Grid"
import { NavigationContainer } from "@react-navigation/native"
import PhotoViewerScreen from "./Viewer"

const Stack = createNativeStackNavigator()

const SocialStack = () => {
	return (
		<Stack.Navigator
			initialRouteName="Social"
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen
				name="Social"
				component={SocialScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="PhotoGrid"
				component={PhotoGridScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="PhotoViewer"
				component={PhotoViewerScreen}
				options={{
					headerShown: false,
					presentation: "fullScreenModal", // Makes it feel more immersive
					animation: "fade", // Smooth transition
					gestureEnabled: false, // Disable navigation gestures for this screen
				}}
			/>
		</Stack.Navigator>
	)
}

export default SocialStack
