import { apiClient } from "./client";

export type LoginResponse = {
  success: boolean;
  access_token: string;
  token_type: "bearer" | string;
};

export type UserProfile = {
  id: number;
  email: string;
  full_name: string | null;
  profile_picture_url: string | null;
  business_name: string | null;
  business_type: string | null;
  auth_provider: string;
};

export type ProfileUpdatePayload = {
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
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

export async function register(
  email: string,
  password: string,
  businessName?: string,
  businessType?: string,
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>("/auth/register", {
    email,
    password,
    business_name: businessName?.trim() ? businessName.trim() : null,
    business_type: businessType?.trim() ? businessType.trim() : null,
  });
  return res.data;
}

export async function googleLogin(token: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/google", { token });
  return res.data;
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>("/auth/profile");
  return res.data;
}

export async function updateUserProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
  const res = await apiClient.put<UserProfile>("/auth/profile", payload);
  return res.data;
}

export async function uploadUserProfilePicture(file: File): Promise<UserProfile> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<UserProfile>("/auth/profile/picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

