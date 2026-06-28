# RefuMap - Frontend

Este es el frontend oficial de RefuMap/AcopioSOS, construido sobre React, Vite y Tailwind CSS.

## Requisitos

- Node.js 18+
- npm o pnpm

## Instalación Local

1. Clona este repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo de configuración:
   ```bash
   cp .env.example .env
   ```
4. Configura `VITE_API_BASE_URL` en el archivo `.env` apuntando a tu backend local (por ejemplo, `http://localhost:8000`).
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Producción (Cloudflare Pages)

1. En la configuración de entorno de Cloudflare Pages, define la variable `VITE_API_BASE_URL` apuntando a tu API de producción (ej. `https://api.refumap.com`).
2. El comando de build es:
   ```bash
   npm run build
   ```
3. El directorio de salida (output directory) es `dist`.

## Smoke Test Post-Despliegue

Antes de subir a producción, puedes validar que el código compila y pasa el linter localmente:
```bash
npm run lint
npm run build
```
