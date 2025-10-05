export interface BlogPost {
  id: string
  academic_year_id: string
  classrom_id?: string
  title: string
  content: string
  author_id: string
  created_at: string
  published_at?: string
  post_media?: BlogPostMedia[]
  users: {
    id: string
    full_name: string
    email: string
  },
  classrooms: {
    id: string
    name: string
  }
}

export interface BlogPostMedia {
  id: string
  post_id: string
  file_url: string
  caption?: string
  author_id: string
  created_at: string
  deleted_at?: string
}