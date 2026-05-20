export interface UpdateUserDto {
  username?: string
  email?: string
  password?: string
  role_id?: number | null
  is_active?: boolean
}