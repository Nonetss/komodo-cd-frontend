import { createAuthClient } from 'better-auth/react';

// import.meta.env se inlinea en build-time y puede quedar undefined en producción.
// process.env siempre está disponible en runtime (Node/SSR).
const baseURL = import.meta.env.BACKEND_URL;

export const authClient = createAuthClient({ baseURL });
