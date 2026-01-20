# Frontend Template - Astro + Better Auth + Shadcn UI

Template de frontend moderno y listo para producción usando **Astro 5**, **React**, **Tailwind CSS 4** y **Shadcn UI**. Diseñado para trabajar en conjunto con el backend [hono-template](https://github.com/Nonetss/hono-template).

## Características

- **Astro 5**: Framework web con SSR y Node adapter.
- **React 19**: Integración completa para componentes interactivos.
- **Tailwind CSS 4**: Estilos utilitarios de última generación.
- **Shadcn UI**: Componentes accesibles y personalizables.
- **Better Auth Client**: Autenticación integrada con soporte para email/password, OAuth y SSO.
- **Bun**: Runtime y gestor de paquetes ultrarrápido.
- **Docker Ready**: Listo para desplegar con Docker y Nginx como reverse proxy.
- **Linting & Formateo**: Prettier y Husky preconfigurados.

## Stack Completo

Este frontend está diseñado para funcionar con:

| Componente   | Repositorio                                                       |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | Este repositorio                                                  |
| **Backend**  | [Nonetss/hono-template](https://github.com/Nonetss/hono-template) |

El backend utiliza Hono, Better Auth y Drizzle ORM, también dockerizado y listo para producción.

## Requisitos Previos

- Bun instalado:

```bash
curl -fsSL https://bun.sh/install | bash
```

- Backend [hono-template](https://github.com/Nonetss/hono-template) corriendo en `http://localhost:3000`

## Instalación

1. Clona el repositorio:

```bash
git clone <tu-repo-url>
cd frontend
```

2. Instala las dependencias:

```bash
bun install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus valores.

## Variables de Entorno

```env
# URL del backend
BACKEND_URL="http://localhost:3000"
```

## Desarrollo local

```bash
bun install
bun run dev
```

El servidor estará disponible en `http://localhost:4321`.

## Autenticación

El frontend incluye integración con Better Auth para:

- **Login con email/password**: Formulario de login tradicional.
- **OAuth (Google)**: Login con cuenta de Google.
- **SSO (Authentik)**: Login con proveedores OIDC.

Las peticiones de autenticación se hacen a través del proxy API (`/api/*`) que redirige al backend.

## Producción con Docker

Para levantar el proyecto con Nginx y el proxy configurado:

```bash
docker compose up --build
```

El servidor estará disponible en el puerto `4321` (o el que hayas configurado en `compose.yml`).

## Estructura del Proyecto

```
src/
├── components/          # Componentes React y Astro
│   ├── features/        # Componentes de funcionalidades
│   │   └── login/       # Página y botones de login
│   └── ui/              # Componentes Shadcn UI
├── layouts/             # Layouts de Astro
├── lib/                 # Utilidades
│   ├── auth.ts          # Cliente Better Auth
│   └── utils.ts         # Helpers generales
├── pages/               # Rutas de Astro
│   ├── api/             # Proxy API hacia el backend
│   ├── login/           # Página de login
│   └── index.astro      # Página principal
├── styles/              # Estilos globales
│   └── global.css       # Variables CSS y Tailwind
└── middleware.ts        # Middleware de autenticación
```

## Scripts Disponibles

| Script            | Descripción                       |
| ----------------- | --------------------------------- |
| `bun run dev`     | Inicia el servidor con hot reload |
| `bun run build`   | Construye para producción         |
| `bun run preview` | Preview de la build de producción |
| `bun run format`  | Formatea el código con Prettier   |

## CI/CD

El proyecto incluye GitHub Actions para:

- Build automático de imagen Docker
- Push a registry en cada merge a `main`

Ver `.github/workflows/docker-build.yml` para configuración.
