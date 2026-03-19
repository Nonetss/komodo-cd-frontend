# Komodo Frontend

> Parte de [Komodo CD](https://github.com/Nonetss/komodo-cd-frontend). Backend en [Nonetss/komodo-cd-backend](https://github.com/Nonetss/komodo-cd-backend).

Dashboard web para gestionar deploys sobre stacks de [Komodo](https://komo.do). Construido con **Astro 6** + **React 19**, **Tailwind CSS 4** y **Shadcn UI**. Se comunica con el [backend](https://github.com/Nonetss/komodo-cd-backend) via proxy Nginx en producción.

## Stack

- **[Astro 6](https://astro.build/)** — SSR con Node adapter
- **[React 19](https://react.dev/)** — Componentes interactivos
- **[Tailwind CSS 4](https://tailwindcss.com/)** + **[Shadcn UI](https://ui.shadcn.com/)** — UI
- **[Better Auth](https://www.better-auth.com/)** — Cliente de autenticación con soporte de sesión
- **[Bun](https://bun.sh/)** — Runtime y gestor de paquetes
- **Nginx** — Reverse proxy en producción (une frontend + backend en un solo puerto)

## Funcionalidades

- **Stacks** — Vista de todos los stacks de Komodo con estado, servicios, repo y commits. Acciones por stack: Pull, Redeploy, Pull + Redeploy. Snippets curl copiables por stack y acción.
- **Historial** — Registro de todas las acciones ejecutadas con usuario, resultado y timestamp.
- **Deploy manual** — Formulario con autocompletado de stacks para disparar deploys.
- **Credenciales** — Gestión de las credenciales de Komodo (URL, API key, secret).
- **API Keys** — Crear, listar y revocar API Keys para usar desde CI/CD.

## Desarrollo

```bash
bun install
cp .env.example .env
# Editar .env con tus valores
bun dev
```

Requiere el backend corriendo en `http://localhost:3000`. El servidor de desarrollo arranca en `http://localhost:4321` y proxea `/api/*` al backend automáticamente.

## Variables de entorno

| Variable          | Build-time | Descripción                                                                                                           |
| ----------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_URL` | ✅         | URL base para las llamadas de better-auth (`/api/auth/*`). En producción: la URL pública de la app                    |
| `PUBLIC_APP_URL`  | ✅         | URL que se muestra en los snippets curl del dashboard. Si no se define, se usa `window.location.origin` como fallback |
| `BACKEND_URL`     | —          | URL interna al backend. La usa Nginx para el proxy. Solo relevante en Docker (por defecto `http://backend:3000`)      |

> Las variables marcadas como **Build-time** se hornean en el bundle durante `bun run build`. Hay que pasarlas como `ARG` al construir la imagen Docker.

## Docker

La imagen incluye Nginx que actúa como reverse proxy: sirve el frontend Astro en `/` y redirige `/api/*` al contenedor backend.

```bash
docker build \
  --build-arg PUBLIC_APP_URL=https://app.example.com \
  --build-arg BETTER_AUTH_URL=https://app.example.com \
  -t komodo-frontend .

docker run -d \
  -p 80:80 \
  -e BACKEND_URL=http://backend:3000 \
  komodo-frontend
```

O con el `docker-compose.yml` del repositorio raíz (recomendado):

```bash
cp ../.env.example ../.env
# Editar ../.env
docker compose -f ../docker-compose.yml up -d --build
```

## CI/CD

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/docker-build.yml`) que construye y publica la imagen en GHCR automáticamente en cada push a `main` o ramas con prefijo `v*`.

La imagen se publica como `ghcr.io/<owner>/<repo>:latest`.

## Estructura

```
src/
├── components/
│   ├── features/
│   │   └── dashboard/
│   │       ├── Dashboard.tsx        # Tabs principales
│   │       ├── StacksPanel.tsx      # Vista de stacks + acciones + curls
│   │       ├── HistoryPanel.tsx     # Historial de acciones
│   │       ├── DeployPanel.tsx      # Deploy manual
│   │       ├── CredentialsPanel.tsx # Gestión de credenciales
│   │       └── ApiKeysPanel.tsx     # Gestión de API Keys
│   └── ui/                          # Componentes Shadcn UI
├── lib/
│   ├── api.ts                       # Cliente axios con todos los endpoints
│   └── auth.ts                      # Cliente Better Auth
├── pages/
│   ├── index.astro                  # Redirige a /dashboard o /login
│   ├── dashboard.astro              # Dashboard principal (protegida)
│   └── login/                       # Página de login
├── middleware.ts                    # Protección de rutas por sesión
└── styles/
gateway/
└── nginx.conf                       # Config de Nginx (con envsubst)
entrypoint.sh                        # Arranca Astro + Nginx
```
