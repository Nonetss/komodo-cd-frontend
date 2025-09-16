// src/middleware.ts
import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/perfil", "/admin"];

  const url = new URL(context.request.url);

  // Si la ruta está protegida
  if (protectedRoutes.some((route) => url.pathname.startsWith(route))) {
    // Aquí decides cómo comprobar autenticación
    // Ejemplo: token en cookie
    const token = context.cookies.get("auth_token")?.value;

    if (!token) {
      // No autenticado → redirigir a login
      return context.redirect("/login");
    }
    // Aquí podrías validar el token (JWT, sesión, etc.)
  }

  // Si todo está bien, continuar
  return next();
});
