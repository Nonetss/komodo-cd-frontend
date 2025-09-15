// src/pages/auth/callback.ts
import type { APIRoute } from "astro";
import * as oidc from "openid-client";

export const prerender = false;

const { OIDC_CLIENT_ID, OIDC_ISSUER, OIDC_REDIRECT_URI } = import.meta.env;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!OIDC_CLIENT_ID || !OIDC_ISSUER || !OIDC_REDIRECT_URI) {
    console.error("❌ Missing OIDC environment variables");
    return new Response("Missing OIDC env vars", { status: 500 });
  }

  // Obtener contexto de login
  const init = cookies.get("oidc_init")?.value;
  if (!init) {
    console.error("❌ Missing oidc_init cookie");
    cookies.delete("oidc_init");
    return redirect("/auth?error=missing_context");
  }

  let code_verifier = "";
  let expectedState: string | undefined;
  try {
    const payload = JSON.parse(decodeURIComponent(init));
    code_verifier = payload.code_verifier;
    expectedState = payload.state;
  } catch (error) {
    console.error("❌ Failed to parse oidc_init cookie:", error);
    cookies.delete("oidc_init");
    return redirect("/auth?error=invalid_context");
  }

  try {
    const issuer = new URL(OIDC_ISSUER);
    const config = await oidc.discovery(issuer, OIDC_CLIENT_ID);

    const currentUrl = new URL(request.url);

    // Construir la URL correcta considerando el proxy reverso
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");

    let correctUrl = currentUrl;
    if (forwardedProto && forwardedHost) {
      correctUrl = new URL(
        `${forwardedProto}://${forwardedHost}${currentUrl.pathname}${currentUrl.search}`
      );
    }

    const tokens = await oidc.authorizationCodeGrant(config, correctUrl, {
      pkceCodeVerifier: code_verifier,
      expectedState,
    });

    // Limpiar cookie temporal
    cookies.delete("oidc_init");

    // Guardar tokens
    if (tokens.access_token) {
      const maxAge = Number.isFinite(tokens.expires_in)
        ? Number(tokens.expires_in)
        : 3600;
      cookies.set("access_token", tokens.access_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge,
      });
    }

    if (tokens.refresh_token) {
      cookies.set("refresh_token", tokens.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 días
      });
    }

    // Marca de sesión para UI
    cookies.set("is_auth", "1", {
      path: "/",
      secure: true,
      sameSite: "lax",
      maxAge: 86400, // 24 horas
    });

    return redirect("/");
  } catch (err) {
    console.error("❌ Authentication failed:", err);
    console.error("❌ Error details:", {
      name: err instanceof Error ? err.name : "Unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    cookies.delete("oidc_init");

    // Crear un mensaje de error más específico
    let errorParam = "callback_failed";
    if (err instanceof Error) {
      if (err.message.includes("state")) {
        errorParam = "invalid_state";
      } else if (err.message.includes("code")) {
        errorParam = "invalid_code";
      } else if (err.message.includes("verifier")) {
        errorParam = "invalid_verifier";
      }
    }

    return redirect(`/auth?error=${errorParam}`);
  }
};
