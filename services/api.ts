const {
  EXPO_PUBLIC_API_BASE_URL,
} = process.env

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${EXPO_PUBLIC_API_BASE_URL}${endpoint}`
  if (__DEV__) {
    console.log("Fetching URL:", url)
  }
  const [response] = await Promise.all([
    fetch(url, options),
    new Promise((resolve) =>
      setTimeout(() => {
        resolve(true)
      }, 2000)
    ),
  ])
  if (!response.ok) {
    throw new Error("API fetch failed")
  }
  return await response.json()
}
