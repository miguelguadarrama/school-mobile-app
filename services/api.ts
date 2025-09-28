import { getToken, refreshAccessToken } from "./auth"

const EXPO_PUBLIC_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

// Callback to handle authentication failures
let onAuthFailure: (() => void) | null = null

export const setAuthFailureCallback = (callback: () => void) => {
  onAuthFailure = callback
}

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const makeRequest = async (retryCount = 0): Promise<any> => {
    const token = await getToken("access_token")
    if (__DEV__) {
      console.log("Token in fetcher:", token?.slice(0, 10) + "...")
    }

    const baseOptions: RequestInit = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }

    const url = `${EXPO_PUBLIC_API_BASE_URL}${endpoint}`
    if (__DEV__) {
      console.log("Fetching URL:", url)
    }

    const [response] = await Promise.all([
      fetch(url, baseOptions),
      new Promise((resolve) =>
        setTimeout(() => {
          resolve(true)
        }, __DEV__ ? 1000 : 0)
      ),
    ])

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && retryCount === 0) {
      if (__DEV__) {
        console.log("401 response, attempting to refresh token...")
      }

      const refreshSuccess = await refreshAccessToken()
      if (refreshSuccess) {
        if (__DEV__) {
          console.log("Token refreshed successfully, retrying request...")
        }
        return makeRequest(1) // Retry once with new token
      } else {
        if (__DEV__) {
          console.log("Token refresh failed, triggering logout")
        }
        // Trigger logout if available
        if (onAuthFailure) {
          onAuthFailure()
        }
        throw new Error("Authentication failed - please log in again")
      }
    }

    if (!response.ok) {
      throw new Error("API fetch failed")
    }

    return await response.json()
  }

  return makeRequest()
}
