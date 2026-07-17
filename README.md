# Malek Inmobiliaria — sitio web

Astro. Landing principal + una landing por propiedad + blog.
Panel de edición en /admin (Sveltia CMS, login con Personal Access Token de GitHub).

## Correr en local
npm install
npm run dev

## Deploy
Conectado a Cloudflare Workers (Workers Builds) desde el repo malekinmo/malek-web.
Build command: npm run build
Deploy command: npx wrangler deploy

## Fuentes
Faltan los archivos .woff2 licenciados en public/fonts/ (ver nombres esperados en src/styles/global.css)
