import { createAuthClient } from 'better-auth/react';
import { ssoClient } from '@better-auth/sso/client';

// En cliente: detecta la URL actual para que funcione en cualquier dominio
// En servidor (SSR): usa localhost (peticiones internas)
const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:4321';

export const authClient = createAuthClient({
  baseURL,
  plugins: [ssoClient()],
});
