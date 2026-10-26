import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const properties = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/properties' }),
  schema: z.object({
    title: z.string(),
    barrio: z.string(),
    price: z.number(),
    currency: z.string().default('USD'),
    m2: z.number(),
    // Los campos opcionales aceptan null: el CMS guarda así un campo que quedó vacío.
    m2Cubiertos: z.number().nullish(),
    ambientes: z.number(),
    dormitorios: z.number().nullish(),
    banos: z.number(),
    orientacion: z.string().nullish(),
    ubicacion: z.string().nullish(),
    piso: z.string().nullish(),
    expensas: z.number().nullish(),
    abl: z.number().nullish(),
    antiguedad: z.number().nullish(),
    caracteristicas: z.array(z.string()).nullish(),
    destacado: z.string().nullish(),
    coverImage: z.string(),
    gallery: z.array(z.string()).default([]),
    videoUrl: z.string().nullish(),
    videoVertical: z.boolean().default(false),
    virtualTourUrl: z.string().nullish(),
    mapEmbedUrl: z.string().nullish(),
    whatsappNumber: z.string().default('5491122540182'),
    whatsappMessage: z.string().default('Hola! Quiero saber más sobre esta propiedad.'),
    featured: z.boolean().default(true),
    order: z.number().default(0),
    publishDate: z.date().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    publishDate: z.date(),
    author: z.string().default('Malek Inmobiliaria'),
  }),
});

export const collections = { properties, blog };
