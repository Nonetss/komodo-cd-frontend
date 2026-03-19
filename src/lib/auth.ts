import { createAuthClient } from 'better-auth/react';

// import.meta.env se inlinea en build-time y puede quedar undefined en producción.
// process.env siempre está disponible en runtime (Node/SSR).
const baseURL =
  (typeof process !== 'undefined' && process.env.BACKEND_URL) ||
  import.meta.env.BACKEND_URL ||
  'http://localhost:3000';

export const authClient = createAuthClient({ baseURL });
