# Astro Template

Una base sencilla para proyectos con Astro 5.

## Características

- **Astro 5** (modo SSR con Node adapter).
- **Tailwind CSS 4** y **Shadcn UI** preconfigurados.
- **Bun** como gestor de paquetes.
- **Docker** listo para usar con Nginx como reverse proxy.
- **Linting & Formateo** con Prettier y Husky.

## Desarrollo local

Para empezar a trabajar:

```bash
bun install
bun run dev
```

## Producción con Docker

Para levantar el proyecto con Nginx y el proxy configurado:

```bash
docker compose up --build
```

El servidor estará disponible en el puerto `4321` (o el que hayas configurado en `compose.yml`).
