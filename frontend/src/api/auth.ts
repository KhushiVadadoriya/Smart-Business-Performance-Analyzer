import { apiClient } from "./client";

export type LoginResponse = {
  success: boolean;
  access_token: string;
  token_type: "bearer" | string;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const res = await apiClient.post<LoginResponse>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

export async function register(email: string, password: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>("/auth/register", {
    email,
    password,
  });
  return res.data;
}

export async function googleLogin(token: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/google", { token });
  return res.data;
}

