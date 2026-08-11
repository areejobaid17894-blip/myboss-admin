import axios from 'axios';
import { env } from '@/config/env';
import { getAccessToken, getRefreshToken, setTokens } from '@/auth/tokenStorage';

let refreshInFlight: Promise<boolean> | null = null;

export async function tryRefreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) {
    await refreshInFlight;
    return Boolean(getAccessToken());
  }

  refreshInFlight = refreshAccessToken();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { data } = await axios.post<{ accessToken?: string; refreshToken?: string }>(
      `${env.authApiUrl}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30_000,
      },
    );

    if (!data.accessToken) return false;

    setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return true;
  } catch {
    return false;
  }
}
