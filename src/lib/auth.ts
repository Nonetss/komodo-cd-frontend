import { createAuthClient } from 'better-auth/react';
import { ssoClient } from '@better-auth/sso/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:4321',
  plugins: [ssoClient()],
});
