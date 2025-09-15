import type { APIRoute } from "astro";
import * as oidc from "openid-client";

const { OIDC_CLIENT_ID, OIDC_ISSUER, BASE_URL } = import.meta.env;

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  // Verificar variables de entorno necesarias
  if (!OIDC_CLIENT_ID || !OIDC_ISSUER) {
    return new Response("Missing OIDC env vars", { status: 500 });
  }

  try {
    // Obtener el id_token de las cookies si existe
    const accessToken = cookies.get("access_token")?.value;
    const idToken = cookies.get("id_token")?.value;

    // Limpiar todas las cookies de sesión
    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });
    cookies.delete("id_token", { path: "/" });
    cookies.delete("is_auth", { path: "/" });

    // Configurar la URL de redirección post-logout
    const baseUrl = BASE_URL || url.origin;
    const postLogoutRedirectUri = `${baseUrl}/auth`;

    // Descubrir la configuración del proveedor OIDC
    const issuer = new URL(OIDC_ISSUER);
    const config = await oidc.discovery(issuer, OIDC_CLIENT_ID);

    // Construir la URL del endpoint end_session
    const endSessionUrl = new URL(
      config.serverMetadata().end_session_endpoint ||
        `${OIDC_ISSUER}/oidc/v1/end_session`
    );

    // Parámetros para el logout según OpenID Connect RP-initiated logout
    const logoutParams = new URLSearchParams();

    // Si tenemos id_token, lo usamos como hint
    if (idToken) {
      logoutParams.set("id_token_hint", idToken);
    } else {
      // Si no tenemos id_token, usamos client_id
      logoutParams.set("client_id", OIDC_CLIENT_ID);
    }

    // URL de redirección después del logout
    logoutParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

    // Construir la URL completa de logout
    endSessionUrl.search = logoutParams.toString();

    // Redirigir al endpoint de logout de ZITADEL
    return new Response(null, {
      status: 302,
      headers: {
        Location: endSessionUrl.href,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // En caso de error, al menos limpiar las cookies locales
    cookies.delete("access_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });
    cookies.delete("id_token", { path: "/" });
    cookies.delete("is_auth", { path: "/" });

    // Redirigir a la página de auth con un parámetro de error
    return redirect("/auth?error=logout_failed");
  }
};
