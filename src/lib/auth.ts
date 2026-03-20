import { createAuthClient } from 'better-auth/react';

const normalizeEnvUrl = (value?: string) => {
  if (!value) return undefined;
  // Algunos .env incluyen comillas dobles/siempre; eliminarlas evita URLs inválidas.
  return value.replace(/^['"]|['"]$/g, '');
};

// Usa el mismo origen del navegador cuando no hay configuración explícita,
// para evitar CORS por puertos/hosts distintos en desarrollo.
const baseURLEnv =
  normalizeEnvUrl(import.meta.env.BETTER_AUTH_URL) ??
  normalizeEnvUrl(import.meta.env.PUBLIC_APP_URL);

const baseURL =
  baseURLEnv ??
  (typeof window !== 'undefined' ? window.location.origin : undefined) ??
  'http://localhost:4321';

export const authClient = createAuthClient({ baseURL });
