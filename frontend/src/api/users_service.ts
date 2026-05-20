import api from "./axios";

import type { User } from "@/types/User/User";
import type { CreateUserDto  } from "@/types/User/CreateUserDTO";
import type { UpdateUserDto } from "@/types/User/UpdateUserDTO";

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserDto) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function updateUser(
  id: number,
  data: UpdateUserDto
) {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

export async function getRoles() {
  const response = await api.get("/roles");
  return response.data;
}