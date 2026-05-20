import api from "./axios";

import type { LoginData, RegisterData, AuthResponse, Role } from "@/types/Auth/Auth";

export const loginRequest = async (
  data: LoginData
): Promise<AuthResponse> => {

  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await api.get("/roles");
  return response.data;
}

export const registerRequest = async (
  data: RegisterData
) => {

  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};