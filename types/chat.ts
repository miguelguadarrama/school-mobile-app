
export interface chats {
  staff_id: string
  student_id: string
  role: "admin" | "teacher"
  userInfo: {
    id: string
    full_name: string
  }
  student_guardians?: {
    users: {
      full_name: string
      id: string
      sso_account: string | null
    }
  }[]
  messages: chat_message[]
}

export interface chat_message {
  id: string
  sender_alias: "staff" | "guardian"
  content: string
  created_at: string
  read_at?: string | null
  isOptimistic?: boolean
}