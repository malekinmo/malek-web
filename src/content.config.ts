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
    ambientes: z.number(),
    banos: z.number(),
    orientacion: z.string().optional(),
    ubicacion: z.string().optional(),
    expensas: z.number().optional(),
    abl: z.number().optional(),
    antiguedad: z.number().optional(),
    coverImage: z.string(),
    gallery: z.array(z.string()).default([]),
    videoUrl: z.string().optional(),
    virtualTourUrl: z.string().optional(),
    mapEmbedUrl: z.string().optional(),
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
