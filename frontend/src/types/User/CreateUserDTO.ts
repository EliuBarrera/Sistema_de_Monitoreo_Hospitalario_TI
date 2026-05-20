export interface CreateUserDto {
  username: string
  email: string
  password: string
  role_id?: number | null
}