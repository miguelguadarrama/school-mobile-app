// services/authService.ts
import * as SecureStore from "expo-secure-store"

const {
  EXPO_PUBLIC_AUTH0_DOMAIN,
  EXPO_PUBLIC_AUTH0_CLIENT_ID,
  EXPO_PUBLIC_AUTH0_AUDIENCE,
  EXPO_PUBLIC_AUTH0_SCOPE,
} = process.env

// Helpers to save and load tokens
export const saveToken = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value)
}

export const getToken = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key)
}

export const deleteToken = async (key: string) => {
  await SecureStore.deleteItemAsync(key)
}

// Login function
export const login = async (email: string, password: string) => {
  const audience = EXPO_PUBLIC_AUTH0_AUDIENCE.concat(
    EXPO_PUBLIC_AUTH0_AUDIENCE.slice(-1) === "/" ? "" : "/"
  )
  const body = {
    grant_type: "password",
    username: email,
    password,
    audience,
    scope: EXPO_PUBLIC_AUTH0_SCOPE,
    client_id: EXPO_PUBLIC_AUTH0_CLIENT_ID,
  }
  const response = await fetch(`https://${EXPO_PUBLIC_AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Login failed")
  }

  const data = await response.json()

  const expiresAt = new Date().getTime() + data.expires_in * 1000

  // Save tokens
  await saveToken("access_token", data.access_token)
  await saveToken("id_token", data.id_token)
  await saveToken("expires_at", expiresAt.toString())
}

// Check session validity
export const isAuthenticated = async (): Promise<boolean> => {
  const expiresAtStr = await getToken("expires_at")
  if (!expiresAtStr) return false
  const expiresAt = parseInt(expiresAtStr, 10)
  return new Date().getTime() < expiresAt
}

export const logout = async () => {
  await deleteToken("access_token")
  await deleteToken("id_token")
  await deleteToken("expires_at")
}

export const getSession = async () => {
  const idToken = await getToken("id_token")
  if (!idToken) return null
  return { idToken }
}
