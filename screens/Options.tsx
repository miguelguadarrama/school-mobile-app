import React, { useState, useEffect } from "react"
import { StyleSheet, Text, View, Switch, Alert, Linking, AppState } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { theme } from "../helpers/theme"
import { registerPushToken, unregisterPushToken, requestPermissions } from "../services/notifications"

const NOTIFICATION_PREFERENCE_KEY = 'user_notification_preference'

export default function OptionsScreen() {
	const [notificationsEnabled, setNotificationsEnabled] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [hasCheckedInitialStatus, setHasCheckedInitialStatus] = useState(false)

	useEffect(() => {
		initializeNotificationStatus()
	}, [])

	const getUserNotificationPreference = async (): Promise<boolean | null> => {
		try {
			const preference = await SecureStore.getItemAsync(NOTIFICATION_PREFERENCE_KEY)
			return preference ? JSON.parse(preference) : null
		} catch (error) {
			console.error('Error getting notification preference:', error)
			return null
		}
	}

	const setUserNotificationPreference = async (enabled: boolean): Promise<void> => {
		try {
			await SecureStore.setItemAsync(NOTIFICATION_PREFERENCE_KEY, JSON.stringify(enabled))
		} catch (error) {
			console.error('Error setting notification preference:', error)
		}
	}

	const initializeNotificationStatus = async () => {
		try {
			const userPreference = await getUserNotificationPreference()
			const { status } = await Notifications.getPermissionsAsync()
			const hasPermission = status === 'granted'

			// If user has no stored preference, show based on permission status but don't auto-save
			if (userPreference === null) {
				setNotificationsEnabled(hasPermission)
				// Don't save preference here - let user make explicit choice
			} else {
				// Use stored user preference combined with permission status
				setNotificationsEnabled(userPreference && hasPermission)
			}

			setHasCheckedInitialStatus(true)
		} catch (error) {
			console.error('Error initializing notification status:', error)
		}
	}

	// Refresh permission status when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			if (hasCheckedInitialStatus) {
				checkNotificationStatus(true) // Allow auto-register when returning from settings
			}
		}, [hasCheckedInitialStatus])
	)

	// Also refresh when app becomes active (returning from settings)
	useEffect(() => {
		const handleAppStateChange = (nextAppState: string) => {
			if (nextAppState === 'active' && hasCheckedInitialStatus) {
				checkNotificationStatus(true) // Allow auto-register when returning from settings
			}
		}

		const subscription = AppState.addEventListener('change', handleAppStateChange)
		return () => subscription?.remove()
	}, [hasCheckedInitialStatus])

	const checkNotificationStatus = async (shouldAutoRegister = false) => {
		try {
			const { status } = await Notifications.getPermissionsAsync()
			const hasPermission = status === 'granted'
			const userPreference = await getUserNotificationPreference()
			const wasEnabled = notificationsEnabled

			// The effective state is when user wants it AND has permission
			const shouldBeEnabled = userPreference === true && hasPermission

			setNotificationsEnabled(shouldBeEnabled)

			// Only auto-register when:
			// 1. User preference is true
			// 2. Permissions were just granted in settings (returning from settings)
			// 3. Not during initial load
			if (shouldAutoRegister && userPreference === true && !wasEnabled && shouldBeEnabled && hasCheckedInitialStatus) {
				console.log('Permissions were enabled in settings and user wants notifications, auto-registering push token...')
				const success = await registerPushToken()
				if (!success) {
					console.warn('Failed to auto-register push token')
				}
			}
		} catch (error) {
			console.error('Error checking notification status:', error)
		}
	}

	const handleNotificationToggle = async (value: boolean) => {
		if (value) {
			// Check current permission status first
			const { status: currentStatus } = await Notifications.getPermissionsAsync()
			const userPreference = await getUserNotificationPreference()
			const isFirstTime = userPreference === null

			// Only show settings alert if permission was explicitly denied AND it's not first time
			if (currentStatus === 'denied' && !isFirstTime) {
				// Permission was previously denied, need to go to settings
				Alert.alert(
					"Permisos Requeridos",
					"Las notificaciones están deshabilitadas. Para activarlas, ve a Configuración > Notificaciones y permite las notificaciones para esta aplicación.",
					[
						{ text: "Cancelar", style: "cancel" },
						{
							text: "Ir a Configuración",
							onPress: async () => {
								// Save user preference even if permission is denied
								await setUserNotificationPreference(true)
								Linking.openSettings()
							}
						}
					]
				)
				return
			}

			// Immediately update UI and set loading state
			setNotificationsEnabled(true)
			setIsLoading(true)

			// Background task: try to register (this will prompt for permission if first time)
			registerPushToken()
				.then(async (success) => {
					if (success) {
						// Save user preference as enabled
						await setUserNotificationPreference(true)
						// UI already shows ON, no need to set again
					} else {
						const { status: newStatus } = await Notifications.getPermissionsAsync()
						if (newStatus === 'denied') {
							// Revert UI state
							setNotificationsEnabled(false)
							// Save user preference as false since they denied
							await setUserNotificationPreference(false)
							Alert.alert(
								"Permisos Denegados",
								"Has denegado los permisos de notificación. Para activarlas, ve a Configuración > Notificaciones y permite las notificaciones para esta aplicación.",
								[
									{ text: "Cancelar", style: "cancel" },
									{
										text: "Ir a Configuración",
										onPress: async () => {
											// Save user preference as true (they want notifications)
											await setUserNotificationPreference(true)
											Linking.openSettings()
										}
									}
								]
							)
						} else {
							// Revert UI state
							setNotificationsEnabled(false)
							Alert.alert(
								"Error",
								"No se pudieron activar las notificaciones. Por favor, inténtalo de nuevo.",
								[{ text: "OK" }]
							)
						}
					}
				})
				.catch((error) => {
					console.error('Error enabling notifications:', error)
					// Revert UI state
					setNotificationsEnabled(false)
					Alert.alert(
						"Error",
						"Ocurrió un error al activar las notificaciones.",
						[{ text: "OK" }]
					)
				})
				.finally(() => {
					setIsLoading(false)
				})
		} else {
			// Immediately update UI for turning OFF
			setNotificationsEnabled(false)

			// Background task: save preference and unregister
			Promise.all([
				setUserNotificationPreference(false),
				unregisterPushToken()
			]).catch((error) => {
				console.error('Error disabling notifications:', error)
				// Could show a toast or silent error - don't revert UI for disable
			})
		}
	}

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.headerContainer}>
				<Text style={styles.heading}>Configuración</Text>
			</SafeAreaView>
			<View style={styles.content}>
				<View style={styles.settingItem}>
					<View style={styles.settingInfo}>
						<Text style={styles.settingTitle}>Notificaciones</Text>
						<Text style={styles.settingDescription}>
							Para recibir notificaciones de actualizaciones de estado o mensajes de la institución
						</Text>
					</View>
					<Switch
						value={notificationsEnabled}
						onValueChange={handleNotificationToggle}
						disabled={isLoading}
						trackColor={{ false: "#E2E8F0", true: theme.colors.primary }}
						thumbColor={notificationsEnabled ? theme.colors.white : "#F1F5F9"}
						ios_backgroundColor="#E2E8F0"
					/>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	headerContainer: {
		backgroundColor: theme.colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	heading: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.xl,
		fontWeight: "bold",
		color: theme.colors.primary,
		marginTop: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		paddingBottom: theme.spacing.sm,
	},
	content: {
		flex: 1,
		padding: theme.spacing.md,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: theme.colors.white,
		padding: theme.spacing.md,
		borderRadius: theme.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.gray,
		...theme.shadow.soft,
	},
	settingInfo: {
		flex: 1,
		marginRight: theme.spacing.md,
	},
	settingTitle: {
		fontFamily: theme.typography.family.bold,
		fontSize: theme.typography.size.md,
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	settingDescription: {
		fontFamily: theme.typography.family.regular,
		fontSize: theme.typography.size.sm,
		color: "#5A6B7A",
		lineHeight: 20,
	},
})
