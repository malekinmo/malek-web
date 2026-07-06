# Malek Inmobiliaria — sitio web

Sitio estático hecho con Astro. Landing principal para captación de vendedores + una landing por cada propiedad (generadas automáticamente desde src/content/properties) + blog.

## Estructura

```
src/
  content.config.ts        -> esquema de datos de "properties" y "blog"
  content/
    properties/*.md        -> una propiedad = un archivo (o se cargan desde el CMS)
    blog/*.md               -> un post = un archivo
  layouts/BaseLayout.astro  -> HTML base, header, footer, boton WhatsApp
  components/               -> Header, Footer, WhatsAppButton
  pages/
    index.astro              -> landing principal (vendedores)
    propiedades/index.astro  -> listado de propiedades
    propiedades/[slug].astro -> landing individual de cada propiedad
    blog/index.astro         -> listado de blog
    blog/[slug].astro        -> post individual
  styles/global.css          -> tokens de marca (color, tipografia, espaciado)
public/
  admin/                     -> panel Decap CMS (para cargar propiedades/posts sin codigo)
  fonts/                     -> ACA VAN LOS ARCHIVOS DE FUENTE (ver abajo)
  images/                    -> logo e imagenes propias
```

## 1. Correr en local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera /dist para produccion
```

## 2. Fuentes

El sitio ya esta armado para usar Blacker Sans Display, Gotham y Brittany
(ver src/styles/global.css), pero NO incluye los archivos de fuente
porque son licenciados. Hay que:

1. Convertir los .otf/.ttf que ya tenes a .woff2 (se puede con
   https://cloudconvert.com/ o herramientas locales).
2. Copiarlos a public/fonts/ con estos nombres exactos:
   - BlackerSansDisplay-Regular.woff2
   - BlackerSansDisplay-Bold.woff2
   - BlackerSansDisplay-ExtraBoldItalic.woff2
   - Gotham-Book.woff2
   - Gotham-Bold.woff2
   - Brittany.woff2

Si los nombres de archivo son otros, hay que actualizar las rutas en
src/styles/global.css (bloque @font-face al principio del archivo).

## 3. Cargar una propiedad nueva

Sin CMS (por ahora, a mano): copiar src/content/properties/laplata100.md,
renombrarlo (el nombre del archivo es la URL, ej. sanmartin450.md ->
/propiedades/sanmartin450) y completar los datos del encabezado (frontmatter).

Con CMS (Decap, en /admin): todavia falta un paso de configuracion
(servidor de autenticacion OAuth con GitHub) -- lo hacemos en la proxima
etapa, una vez que el sitio este publicado.

## 4. Subir a GitHub

```bash
cd malek-web
git init
git add .
git commit -m "Sitio inicial Malek Inmobiliaria"
git branch -M main
git remote add origin https://github.com/malekinmo/malek-web.git
git push -u origin main
```

(Si el repo malek-web todavia no existe en GitHub, crealo vacio primero,
sin README ni .gitignore, para que no choque con este push.)

## 5. Conectar a Cloudflare Pages

En Cloudflare -> Workers & Pages -> Create -> Pages -> Connect to Git ->
elegir malekinmo/malek-web, y configurar:

```
Framework preset: Astro
Build command: npm run build
Build output directory: dist
```

## 6. Dominio propio (nic.ar)

Una vez que el deploy funcione en *.pages.dev:
- Cloudflare Pages -> Custom domains -> agregar malek.com.ar
- Copiar los registros DNS que da Cloudflare
- Cargarlos en nic.ar (o migrar los nameservers a Cloudflare para
  gestionar todo desde ahi)
