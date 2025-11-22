
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
  content: string // text message OR file caption
  message_type?: "text" | "attachment" // default: "text"
  attachment_url?: string // blob storage URL
  attachment_type?: "photo" | "video" | "document"
  attachment_mime_type?: string
  attachment_file_name?: string
  attachment_file_size?: number
  created_at: string
  read_at?: string | null
  isOptimistic?: boolean
}

export interface AttachmentData {
  type: "photo" | "video" | "document"
  localUri: string
  mimeType: string
  fileName: string
  fileSize: number
  thumbnailUri?: string // for videos
}