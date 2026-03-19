import { createAuthClient } from 'better-auth/react';

const baseURL =
  import.meta.env.BETTER_AUTH_URL ||
  process.env.BETTER_AUTH_URL ||
  import.meta.env.PUBLIC_APP_URL ||
  process.env.PUBLIC_APP_URL ||
  'http://localhost:4321';

export const authClient = createAuthClient({ baseURL });
