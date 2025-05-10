import LoginScreen from "../screens/login/LoginEmail"
import LoginNewPassword from "../screens/login/LoginNewPassword"
import LoginNoAccountFound from "../screens/login/LoginNoAccountFound"
import LoginPassword from "../screens/login/LoginPassword"
import LoginVerifyEmail from "../screens/login/LoginVerifyEmail"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"

const Stack = createNativeStackNavigator()

const LoginContainer = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="LoginEmail">
				<Stack.Screen name="LoginEmail" component={LoginScreen} />
				<Stack.Screen name="LoginPassword" component={LoginPassword} />
				<Stack.Screen
					name="LoginVerifyEmail"
					component={LoginVerifyEmail}
					options={{ title: "Verify Email" }}
				/>
				<Stack.Screen
					name="LoginNewPassword"
					component={LoginNewPassword}
					options={{ title: "Set New Password" }}
				/>
				<Stack.Screen
					name="LoginNoAccountFound"
					component={LoginNoAccountFound}
					options={{ title: "No Account Found" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default LoginContainer
