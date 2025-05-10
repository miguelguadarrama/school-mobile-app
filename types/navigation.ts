export type AuthStackParamList = {
  LoginEmail: undefined
  LoginPassword: { email: string; sso_account: string }
  LoginVerifyEmail: { email: string }
  LoginNewPassword: { email: string }
  LoginNoAccountFound: { email: string }
  // Add other screens later
}
