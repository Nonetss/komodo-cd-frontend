import { createAuthClient } from 'better-auth/react';
import { ssoClient } from '@better-auth/sso/client';

const baseURL = process.env.BETTER_AUTH_URL || '';

export const authClient = createAuthClient({
  baseURL,
  plugins: [ssoClient()],
});
