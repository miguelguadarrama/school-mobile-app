import { NavigationContainer } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"
import LoadingScreen from "./Loading"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/login/LoginEmail"
import LoginPassword from "../screens/login/LoginPassword"
import LoginVerifyEmail from "../screens/login/LoginVerifyEmail"
import LoginNewPassword from "../screens/login/LoginNewPassword"
import LoginNoAccountFound from "../screens/login/LoginNoAccountFound"

const Stack = createNativeStackNavigator()

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
	const { loggedIn, loading: authLoading } = useAuth()
	if (authLoading) {
		return <LoadingScreen />
	}

	if (!loggedIn) {
		return <LoginContainer />
	}
	return children
}

const LoginContainer = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="LoginEmail"
				screenOptions={{ headerShown: false }}
			>
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

export default AuthContainer
