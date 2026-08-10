import { authApi } from '@/api/client';

export interface AdminSignInRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  sessionId: string;
  code: string;
}

export interface AddEligibleParticipantRequest {
  email: string;
  firstName: string;
  lastName: string;
  userId?: string;
}

export interface AdminSignInResponse {
  requiresTwoFactor: boolean;
  sessionId?: string;
  email?: string;
  expiresInSeconds?: number;
  demoOtpCode?: string;
  accessToken?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  adminSignIn: (data: AdminSignInRequest) =>
    authApi.post<AdminSignInResponse>('/auth/admin-sign-in', data),
  verifyOtp: (data: VerifyOtpRequest) =>
    authApi.post<VerifyOtpResponse>('/auth/verify-2fa', data),
  resendOtp: (sessionId: string) =>
    authApi.post<{ demoOtpCode?: string }>('/auth/resend-otp', { sessionId }),
  registerEligibleParticipant: (data: AddEligibleParticipantRequest) =>
    authApi.post('/auth/eligible-participants', data),
  signOut: () => authApi.post('/auth/sign-out'),
};
