import * as Application from 'expo-application'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { AppState, Platform } from 'react-native'
import { fetcher } from './api'
import { saveToken } from "./auth"

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