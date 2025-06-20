import React, { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar, StyleSheet, View } from "react-native"
//import StatusBar from "../components/StatusBar"
import BottomTabNavigator from "../navigation/bottomNav"
import AuthContainer from "./AuthContainer"
import { SWRConfig } from "swr"
import { fetcher } from "../services/api"
import AppContainer from "./AppContainer"

export default function AppLayout() {
	return (
		<SWRConfig
			value={{
				fetcher, // global fetcher function
				dedupingInterval: 60000, // deduplicate requests for 60 seconds
				revalidateOnFocus: true, // revalidate when app comes back into focus (good for mobile)
				errorRetryCount: 1, // try 2 times on failure
				shouldRetryOnError: true, // automatically retry if network error
			}}
		>
			<AuthContainer>
				<AppContainer>
					<NavigationContainer>
						<StatusBar barStyle="dark-content" backgroundColor="#fff" />
						<View style={styles.container}>
							{/* Main Content Container */}
							<View style={styles.contentContainer}>
								<BottomTabNavigator />
							</View>
						</View>
					</NavigationContainer>
				</AppContainer>
			</AuthContainer>
		</SWRConfig>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFF",
	},
	statusBarContainer: {
		backgroundColor: "#DDD",
		paddingHorizontal: 0,
	},
	contentContainer: {
		flex: 1,
		backgroundColor: "#FFF",
	},
})
