import { createAuthClient } from 'better-auth/react';

const normalizeEnvUrl = (value?: string) => {
  if (!value) return undefined;
  // Algunos .env incluyen comillas dobles/siempre; eliminarlas evita URLs inválidas.
  return value.replace(/^['"]|['"]$/g, '');
};

// En navegador usamos SIEMPRE el mismo origen desde el que está corriendo la UI,
// para que las cookies de sesión se emitan/usen con el host correcto.
const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (normalizeEnvUrl(import.meta.env.BETTER_AUTH_URL) ??
      normalizeEnvUrl(import.meta.env.PUBLIC_APP_URL) ??
      'http://localhost:4321');

export const authClient = createAuthClient({ baseURL });
