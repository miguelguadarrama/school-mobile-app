import { getToken } from "./auth"

const {
  EXPO_PUBLIC_API_BASE_URL,
} = process.env

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken("access_token")
  if (__DEV__) {
    console.log("Token in fetcher:", token?.slice(0, 10) + "...")
  }
  const baseOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...options
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
      }, __DEV__ ? 2000 : 0)
    ),
  ])
  if (!response.ok) {
    throw new Error("API fetch failed")
  }
  return await response.json()
}
