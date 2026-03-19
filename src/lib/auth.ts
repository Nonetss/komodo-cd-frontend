import { createAuthClient } from 'better-auth/react';
import { ssoClient } from '@better-auth/sso/client';

const baseURL =
  import.meta.env.BETTER_AUTH_URL ??
  import.meta.env.BACKEND_URL ??
  'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL,
  plugins: [ssoClient()],
});
