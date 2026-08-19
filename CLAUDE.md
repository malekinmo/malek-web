## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Regla maestra: números y la fuente Blacker

`Blacker Sans Display` es una versión **trial**. Los números (0-9) técnicamente **sí existen** en el archivo de la fuente (el `cmap` los mapea a `zero`, `one`, `two`...), pero el glifo real fue reemplazado por un watermark de la casa de fuentes (se ve como un logo/texto "ZESAFONTS.COM" en vez del número).

Esto es importante porque **el fallback normal de `font-family` (`'Blacker Sans Display','Gotham',serif`) no alcanza a arreglarlo**: el navegador solo pasa al siguiente font de la lista cuando un glifo *falta*, y estos glifos no faltan, solo están corruptos/watermarked. Si ves un número roto en el sitio con este aspecto, este es el motivo.

**El fix real está a nivel de `@font-face`, con `unicode-range`:** cada declaración `@font-face` de `Blacker Sans Display` (hay dos lugares: `src/styles/global.css` y el bloque `<style is:global>` duplicado dentro de `src/pages/index.astro`) tiene:

```css
unicode-range: U+0000-002F, U+003A-10FFFF;
```

Este rango cubre todo el Unicode **excepto** `U+0030-0039` (los dígitos 0-9). Le dice al navegador "esta fuente no cubre los números", así que para esos caracteres específicos salta directo al siguiente font de la lista (`Gotham`) — sin importar si el archivo .woff2 técnicamente tiene o no un glifo ahí. Es la única forma confiable de resolver esto con esta fuente trial.

Reglas a seguir siempre que se agregue o edite texto en Blacker:

1. **No se necesita envolver los números manualmente en la mayoría de los casos** — el `unicode-range` ya resuelve esto automáticamente para cualquier texto en Blacker, en cualquier parte del sitio (hero, blog, propiedades, etc.).
2. **Si se agrega una nueva declaración `@font-face` para `Blacker Sans Display`** (por ejemplo un peso o variante nueva), hay que copiar también el `unicode-range: U+0000-002F, U+003A-10FFFF;` — si no, ese peso específico va a volver a mostrar el watermark en los números.
3. **`src/pages/index.astro` duplica las declaraciones `@font-face`** en vez de reusar las de `global.css` — cualquier fix a nivel de fuente (unicode-range, nuevos pesos, etc.) hay que aplicarlo en los dos lugares.
4. Si en algún componente puntual se necesita más control sobre el peso/tamaño exacto de un número dentro de texto Blacker, se puede seguir envolviendo en `<span style="font-family:'Gotham',sans-serif">` (hay un ejemplo en `index.astro`: `Recorrido <span style="font-family:'Gotham',sans-serif;font-weight:700">360°</span>`), pero ya no es necesario para que el número simplemente se vea bien.
5. Antes de dar por terminada cualquier tarea de diseño/contenido con números, probar el render real (`astro dev`) y no solo revisar el CSS — este bug en particular no se detecta leyendo el código, solo mirando la página, porque el glifo "existe" y el navegador no tira ningún error ni warning.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
