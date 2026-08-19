## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Regla maestra: números y la fuente Blacker

`Blacker Sans Display` es una versión **trial** y no incluye glifos de números (0-9). Cualquier texto con números que use esta fuente cae al fallback y se ve con una tipografía distinta (serif, inconsistente con el diseño).

Reglas a seguir siempre que se agregue o edite texto en Blacker:

1. **Nunca hardcodear el fallback a `serif` solo.** El stack correcto es:
   `font-family:'Blacker Sans Display','Gotham',serif`
   Así, cualquier número (u otro glifo faltante) cae en Gotham en vez de una serif genérica.
2. **`--font-display` en `src/styles/global.css` ya tiene este fallback correcto** — cualquier elemento que use `var(--font-display)` (o los `h1`-`h4`, que lo heredan por default) está cubierto automáticamente.
3. **`src/pages/index.astro` define sus propios estilos inline** (no usa la variable) — si se agrega un bloque nuevo con `font-family:'Blacker Sans Display'`, hay que escribir el fallback completo `,'Gotham',serif`, no solo `,serif`.
4. **Para números grandes o destacados** (ej. "360°", cifras en hero, badges numerados) preferir envolver el número en un `<span style="font-family:'Gotham',sans-serif">` explícito en vez de confiar en el fallback automático — da más control sobre el peso y el tamaño exacto. Ejemplo ya usado en el sitio (`index.astro`): `Recorrido <span style="font-family:'Gotham',sans-serif;font-weight:700">360°</span>`.
5. Antes de dar por terminada cualquier tarea de diseño/contenido, buscar `Blacker Sans Display` en el repo y revisar que ningún texto con dígitos quede con el fallback incompleto (`,serif` sin `'Gotham'` antes).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
