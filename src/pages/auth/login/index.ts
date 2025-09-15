// src/pages/auth/login.ts
import type { APIRoute } from "astro";
import * as oidc from "openid-client";

const {
  OIDC_CLIENT_ID,
  OIDC_ISSUER,
  OIDC_REDIRECT_URI,
  OIDC_SCOPE,
  OIDC_ORG_ID,
} = import.meta.env;

export const GET: APIRoute = async () => {
  if (!OIDC_CLIENT_ID || !OIDC_ISSUER || !OIDC_REDIRECT_URI) {
    return new Response("Missing OIDC env vars", { status: 500 });
  }

  // Descubrimiento + config
  const issuer = new URL(OIDC_ISSUER);
  const config = await oidc.discovery(issuer, OIDC_CLIENT_ID);

  // Scopes (corrige la concatenación)
  const scope = `${OIDC_SCOPE} ${OIDC_ORG_ID}`;

  // PKCE + state
  const code_verifier = oidc.randomPKCECodeVerifier();
  const code_challenge = await oidc.calculatePKCECodeChallenge(code_verifier);
  const state = oidc.randomState(); // usa siempre state

  // Guarda lo necesario para el callback (cookie HttpOnly temporal)
  const payload = encodeURIComponent(
    JSON.stringify({ 
      code_verifier: code_verifier, 
      state: state 
    })
  );
  const tempCookie = `oidc_init=${payload}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`;

  // Construye URL de autorización
  const params: Record<string, string> = {
    redirect_uri: OIDC_REDIRECT_URI,
    scope,
    code_challenge,
    code_challenge_method: "S256",
    state,
  };
  const redirectTo = oidc.buildAuthorizationUrl(config, params);

  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": tempCookie,
      Location: redirectTo.href,
      "Cache-Control": "no-store",
    },
  });
};
