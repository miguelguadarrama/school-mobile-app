import { user } from "./user"

export interface chats {
  staff_id: string
  student_id: string
  role: "admin" | "teacher"
  staff: user
  messages: chat_message[]
}

export interface chat_message {
  id: string
  sender_alias: "staff" | "guardian"
  content: string
  created_at: string
  isOptimistic?: boolean
}