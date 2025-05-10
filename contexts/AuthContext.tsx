// src/contexts/AuthContext.tsx
import {
	login as authLogin,
	logout as authLogout,
	getSession,
	isAuthenticated,
} from "../services/auth"
import React, { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
	loggedIn: boolean
	user: any // you can type this better later if you decode idToken
	login: (_email: string, _password: string) => Promise<void>
	logout: () => Promise<void>
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
			}
			setLoading(false)
		}

		initializeAuth()
	}, [])

	const login = async (email: string, password: string) => {
		await authLogin(email, password)
		const session = await getSession()
		setUser(session)
		setLoggedIn(true)
	}

	const logout = async () => {
		await authLogout()
		setUser(null)
		setLoggedIn(false)
	}

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
