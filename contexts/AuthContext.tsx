// src/contexts/AuthContext.tsx
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import React, { createContext, useContext, useEffect, useState } from "react"
import { setAuthFailureCallback } from "../services/api"
import {
	login as authLogin,
	logout as authLogout,
	getSession,
	isAuthenticated,
} from "../services/auth"
import {
	registerPushToken,
	unregisterPushToken,
} from "../services/notifications"

interface AuthContextType {
	loggedIn: boolean
	user: any // you can type this better later if you decode idToken
	login: (_email: string, _password: string) => Promise<void>
	logout: () => Promise<void>
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const NOTIFICATION_PREFERENCE_KEY = "user_notification_preference"
const SELECTED_ROLE_KEY = "user_selected_role"

const shouldRegisterForNotifications = async (): Promise<boolean> => {
	try {
		// Check user preference
		const preferenceStr = await SecureStore.getItemAsync(
			NOTIFICATION_PREFERENCE_KEY
		)
		const userWantsNotifications = preferenceStr
			? JSON.parse(preferenceStr)
			: null

		// Check device permissions
		const { status } = await Notifications.getPermissionsAsync()
		const hasPermission = status === "granted"

		// Only register if user wants notifications AND has permission
		// If no preference stored, don't auto-register (user hasn't made a choice yet)
		return userWantsNotifications !== false && hasPermission
	} catch (error) {
		console.error("Error checking notification preference:", error)
		return false
	}
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [loggedIn, setLoggedIn] = useState(false)
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const initializeAuth = async () => {
			const auth = await isAuthenticated()
			if (auth) {
				const session = await getSession()
				setUser(session)
				setLoggedIn(true)
				// Only register push notifications if user wants them and has permission
				if (await shouldRegisterForNotifications()) {
					await registerPushToken()
				}
			}
			setLoading(false)
		}

		initializeAuth()
	}, [])

	const login = async (email: string, password: string) => {
		await authLogin(email, password)
		const session = await getSession()
		setUser(session)
		// Only register push notifications if user wants them and has permission
		await registerPushToken()

		setLoggedIn(true)
	}

	const logout = async () => {
		// Unregister push notifications before logout
		await unregisterPushToken()
		// Clear saved role preference
		try {
			await SecureStore.deleteItemAsync(SELECTED_ROLE_KEY)
		} catch (error) {
			console.error("Error clearing saved role:", error)
		}
		await authLogout()
		setUser(null)
		setLoggedIn(false)
	}

	// Set up auth failure callback when component mounts
	useEffect(() => {
		setAuthFailureCallback(() => {
			logout()
		})
	}, [])

	return (
		<AuthContext.Provider value={{ loggedIn, user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
