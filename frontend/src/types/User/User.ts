export interface Role {
  id: number
  name: string
  description: string | null
}

export interface User {
  id: number
  username: string
  email: string

  role_id: number | null

  is_active: boolean

  created_at: string

  role: Role | null
}