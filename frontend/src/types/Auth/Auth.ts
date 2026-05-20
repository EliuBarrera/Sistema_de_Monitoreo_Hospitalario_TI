export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role_id: number;
    is_active: boolean;
    created_at: string;
  }
}