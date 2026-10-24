import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.date(),
        author: z.string(),
        image: z.string(),
        tags: z.array(z.string()),
        series: z.string().optional()
    }),
});

export const collections = {
    blog: blogCollection,
};
