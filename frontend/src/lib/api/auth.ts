import type { AuthUser, StartOtpResponse, VerifyOtpResponse } from "@/types/auth";
import { apiClient } from "./client";

export async function startOtp(username: string): Promise<StartOtpResponse> {
  return apiClient<StartOtpResponse>("/api/auth/otp/start", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function resendOtp(challengeId: string): Promise<StartOtpResponse> {
  return apiClient<StartOtpResponse>("/api/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify({ challengeId }),
  });
}

export async function verifyOtp(
  challengeId: string,
  code: string,
): Promise<VerifyOtpResponse> {
  return apiClient<VerifyOtpResponse>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
}

export async function loginWithPassword(
  username: string,
  password: string,
): Promise<VerifyOtpResponse> {
  return apiClient<VerifyOtpResponse>("/api/auth/password/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function startForgotPassword(
  username: string,
): Promise<StartOtpResponse> {
  return apiClient<StartOtpResponse>("/api/auth/password/forgot/start", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function confirmForgotPassword(
  challengeId: string,
  code: string,
  newPassword: string,
): Promise<VerifyOtpResponse> {
  return apiClient<VerifyOtpResponse>("/api/auth/password/forgot/confirm", {
    method: "POST",
    body: JSON.stringify({ challengeId, code, newPassword }),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiClient<AuthUser>("/api/auth/me", { auth: true });
}

export async function updateAuthProfile(input: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}): Promise<AuthUser> {
  return apiClient<AuthUser>("/api/auth/profile", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      displayName: input.displayName ?? null,
    }),
  });
}

export async function logoutSession(): Promise<void> {
  await apiClient<void>("/api/auth/logout", {
    method: "POST",
    auth: true,
  });
}
