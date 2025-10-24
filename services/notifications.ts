import * as Application from 'expo-application'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { AppState, Platform } from 'react-native'
import { fetcher } from './api'
import { saveToken } from "./auth"

// Notification channel IDs for grouping
export const NotificationChannels = {
  CHAT_MESSAGES: 'chat-messages',
  ANNOUNCEMENTS: 'announcements',
  STUDENT_UPDATES: 'student-updates',
  DEFAULT: 'default',
} as const

export interface PushToken {
  token: string
  type: 'expo' | 'ios' | 'android'
}

const getDeviceId = async (): Promise<string> => {
  try {
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId()
      if (androidId) return androidId
    }

    // Fallback to installation ID or session ID
    const installationId = Application.applicationId || Constants.sessionId
    return installationId || Device.modelName || 'unknown-device'
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to get device ID:', error)
    }
    return Constants.sessionId || Device.modelName || 'unknown-device'
  }
}

/**
 * Configure notification channels for Android (Android 8.0+)
 * This allows grouping and customizing notification behavior by type
 */
export const setupNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return
  }

  try {
    // Chat messages channel
    await Notifications.setNotificationChannelAsync(NotificationChannels.CHAT_MESSAGES, {
      name: 'Mensajes',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B9D',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      description: 'Notificaciones de nuevos mensajes de maestros',
    })

    // Announcements channel
    await Notifications.setNotificationChannelAsync(NotificationChannels.ANNOUNCEMENTS, {
      name: 'Anuncios',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250],
      lightColor: '#FF6B9D',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      description: 'Anuncios y publicaciones de la escuela',
    })

    // Student updates channel
    await Notifications.setNotificationChannelAsync(NotificationChannels.STUDENT_UPDATES, {
      name: 'Actualizaciones de Estudiante',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250],
      lightColor: '#FF6B9D',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      description: 'Actualizaciones sobre asistencia, estado y actividades del estudiante',
    })

    // Default channel
    await Notifications.setNotificationChannelAsync(NotificationChannels.DEFAULT, {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250],
      lightColor: '#FF6B9D',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      description: 'Notificaciones generales',
    })

    if (__DEV__) {
      console.log('Notification channels configured successfully')
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error setting up notification channels:', error)
    }
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const appState = AppState.currentState
    const isAppActive = appState === 'active'

    return {
      shouldShowAlert: !isAppActive,
      shouldPlaySound: !isAppActive,
      shouldSetBadge: !isAppActive,
      shouldShowBanner: !isAppActive,
      shouldShowList: !isAppActive,
    }
  },
})

export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    if (__DEV__) {
      console.log('Must use physical device for Push Notifications')
    }
    return false
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (__DEV__) {
    console.log('Existing notification permission status:', existingStatus)
  }
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (__DEV__) {
    console.log('Final notification permission status:', finalStatus)
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) {
      console.log('Failed to get push token for push notification!')
    }
    return false
  }

  saveToken("user_notification_preference", "true").catch((error) => {
    if (__DEV__) {
      console.error("Error saving notification preference:", error)
    }
  })

  return true
}

export const getPushToken = async (): Promise<PushToken | null> => {
  try {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log('Must use physical device for Push Notifications')
      }
      return null
    }

    const hasPermission = await requestPermissions()
    if (!hasPermission) {
      return null
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
    if (!projectId) {
      if (__DEV__) {
        console.log('Project ID not found')
      }
      return null
    }

    if (__DEV__) {
      console.log('Using Expo Project ID:', projectId)
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    let tokenType: 'expo' | 'ios' | 'android' = 'expo'
    if (Platform.OS === 'ios') {
      tokenType = 'ios'
    } else if (Platform.OS === 'android') {
      tokenType = 'android'
    }

    return {
      token: pushTokenData.data,
      type: tokenType,
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting push token:', error)
    }
    return null
  }
}

export const registerPushToken = async (): Promise<boolean> => {
  try {
    const pushToken = await getPushToken()
    if (!pushToken) {
      return false
    }

    if (__DEV__) {
      console.log('Push Token:', pushToken)
    }

    const response = await fetcher('/users/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: pushToken.token,
        deviceType: pushToken.type,
        deviceId: await getDeviceId(),
        data: {
          platform: Platform.OS,
          app_version: Constants.expoConfig?.version || '1.0.0',
          os_version: Device.osVersion || 'unknown',
        },
      }),
    }).catch((error) => {
      if (__DEV__) {
        console.error('Error registering push token:', error)
      }
      return null
    })

    if (response) {
      if (__DEV__) {
        console.log('Push token registered successfully')
      }
      return true
    }

    return false
  } catch (error) {
    if (__DEV__) {
      console.error('Error in registerPushToken:', error)
    }
    return false
  }
}

export const unregisterPushToken = async (): Promise<boolean> => {
  try {
    const pushToken = await getPushToken()
    const response = await fetcher('/users/push', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: await getDeviceId(),
        token: pushToken ? pushToken.token : null,
      }),
    }).catch((error) => {
      if (__DEV__) {
        console.error('Error unregistering push token:', error)
      }
      return null
    })

    if (response) {
      if (__DEV__) {
        console.log('Push token unregistered successfully')
      }
      return true
    }

    return false
  } catch (error) {
    if (__DEV__) {
      console.error('Error in unregisterPushToken:', error)
    }
    return false
  }
}

export interface NotificationData {
  type: 'chat_message' | 'announcement' | 'student_update'
  targetRole: 'guardian' | 'staff' | 'admin'
  // For chat messages
  chatPartnerId?: string  // staff_id for guardian, student_id for staff/admin
  studentId?: string      // For guardian role to identify which student's chat
  // For announcements and student updates
  postId?: string
  // Generic action
  screen?: string
}

type NotificationHandler = (data: NotificationData) => void

let notificationHandlerCallback: NotificationHandler | null = null

/**
 * Register a handler to process notification taps
 * This should be called from your navigation/app container with logic to navigate
 */
export const setNotificationHandler = (handler: NotificationHandler) => {
  notificationHandlerCallback = handler
}

export const setupNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    if (__DEV__) {
      console.log('Notification received:', notification)
    }
  })

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    if (__DEV__) {
      console.log('Notification response:', response)
    }

    // Handle notification tap
    const data = response.notification.request.content.data
    if (data && notificationHandlerCallback && typeof data === 'object') {
      const notificationData = data as unknown as NotificationData
      if (notificationData.type && notificationData.targetRole) {
        notificationHandlerCallback(notificationData)
      }
    }
  })

  return () => {
    notificationListener.remove()
    responseListener.remove()
  }
}

export const clearAllNotifications = async () => {
  await Notifications.dismissAllNotificationsAsync()
}

export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync()
}

export const setBadgeCount = async (count: number) => {
  await Notifications.setBadgeCountAsync(count)
}