import { apiClient } from "@/src/api/client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfileResponse,
} from "@/src/api/types";

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/register",
    data,
  );
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/login",
    data,
  );
  return response.data;
}

export async function fetchMe(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>("/api/v1/users/me");
  return response.data;
}
