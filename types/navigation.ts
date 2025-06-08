export type AuthStackParamList = {
  LoginEmail: undefined
  LoginPassword: { email: string; sso_account: string }
  LoginVerifyEmail: { email: string }
  LoginNewPassword: { email: string, shouldReset?: boolean }
  LoginNoAccountFound: { email: string }
  LoginForgotCredentials: { email: string }
  // Add other screens later
}
