import { fetcher } from "./api"

export const checkUserEmail = async (email: string) => {
  const response = await fetcher(`/users/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  }).catch((error) => {
    if (__DEV__) {
      console.error("Error checking user email:", error)
    }
    return null
  })
  return response
}

export const isValidPassword = (password: string) => {
  //Lower case (a-z), upper case (A-Z) and numbers (0-9)
  // minimum 8 characters
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return regex.test(password)
}

export const verifyOTP = async (email: string, code: string) => {
  const response = await fetcher(`/users/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  }).catch((error) => {
    if (__DEV__) {
      console.error("Error verifying OTP:", error)
    }
    return null
  })
  return response
}

export const triggerOTP = async (email: string) => {
  const response = await fetcher(`/users/otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  }).catch((error) => {
    if (__DEV__) {
      console.error("Error triggering OTP:", error)
    }
    return null
  })
  return response
}

export const trackLogin = async (email: string, sso_id: string) => {
  const response = await fetcher(`/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sso_id, email }),
  })
  return response
}

export const registerUser = async (email: string, password: string) => {
  const response = await fetcher(`/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  }).catch((error) => {
    if (__DEV__) {
      console.error("Error registering user:", error)
    }
    return null
  })
  return response
}
