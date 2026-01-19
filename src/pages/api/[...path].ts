import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request, params }) => {
  let backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  // Limpiar barra final si existe para evitar dobles barras
  if (backendUrl.endsWith('/')) backendUrl = backendUrl.slice(0, -1);

  const path = params.path;
  const url = new URL(request.url);
  const targetUrl = `${backendUrl}/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('referer'); // A veces causa problemas de seguridad en el backend

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.arrayBuffer()
          : undefined,
      redirect: 'manual',
    });

    // Extraer el cuerpo como buffer para asegurar que se envía completo
    const resBody = await response.arrayBuffer();

    // Clonar las cabeceras de respuesta pero filtrar las que causan problemas en proxies
    const resHeaders = new Headers(response.headers);
    resHeaders.delete('content-encoding'); // Dejar que Astro/Node lo maneje
    resHeaders.delete('transfer-encoding');
    resHeaders.delete('content-length'); // Se recalcula automáticamente

    return new Response(resBody, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error(`Proxy Error fetching ${targetUrl}:`, error);
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        target: targetUrl,
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
