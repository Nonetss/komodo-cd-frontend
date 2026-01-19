import { authClient } from '@/lib/auth';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // 1. Evitar bucles en login y rutas de la API de auth
  if (
    context.url.pathname.startsWith('/login') ||
    context.url.pathname.startsWith('/api/auth')
  ) {
    return next();
  }

  // 2. Pillar la cookie de Astro
  const token = context.cookies.get('better-auth.session_token');

  if (!token) {
    return context.redirect('/login');
  }

  // 3. Usar el authClient pasando el header Cookie correctamente
  // Better Auth internamente usa fetch, así que le pasamos el string formateado
  const { data: session, error } = await authClient.getSession({
    fetchOptions: {
      headers: {
        // Importante: El backend necesita el par nombre=valor
        Cookie: `better-auth.session_token=${token.value}`,
      },
    },
  });

  // 4. Si hay error o no hay sesión, fuera
  if (error || !session) {
    return context.redirect('/login');
  }

  // 5. Meter la sesión en locals por si la necesitas en el frontmatter de tus páginas
  context.locals.user = session.user;
  context.locals.session = session.session;

  return next();
});
