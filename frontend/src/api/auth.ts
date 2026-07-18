import { api } from "./client";
import type { AuthResponse, LoginPayload, SignupPayload } from "./types";

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function signup(payload: SignupPayload) {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function logout(refreshToken: string) {
  await api.post("/auth/logout", { refresh_token: refreshToken });
}
