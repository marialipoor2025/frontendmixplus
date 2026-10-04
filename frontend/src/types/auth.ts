export type StartOtpResponse = {
  challengeId: string;
  maskedDestination: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  /** Present only with Mock SMS in Development */
  devCode?: string | null;
};

export type AuthUser = {
  id: string;
  displayName: string;
  phone?: string | null;
  email?: string | null;
};

export type VerifyOtpResponse = {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthUser;
};
