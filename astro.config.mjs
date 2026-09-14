import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import remarkImageAttrs from "./src/image-attrs-rehype.mjs";
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';

function buildArticleLastmod() {
  const dir = join(process.cwd(), 'src/content/blog');
  const map = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, file), 'utf8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    const data = YAML.parse(frontmatter[1]) ?? {};
    const pubDate = data.pubDate instanceof Date ? data.pubDate : new Date(data.pubDate);
    if (Number.isNaN(pubDate.valueOf())) continue;
    const slug = data.slug ?? file.replace(/\.md$/, '');
    map[`/articles/${slug}`] = pubDate.toISOString();
  }
  return map;
}

const articleLastmod = buildArticleLastmod();

// https://astro.build/config
export default defineConfig({
  site: 'https://srvsrr.dev',
  trailingSlash: "never",
  integrations: [tailwind(), sitemap({
    lastmod: new Date(),
    serialize(entry) {
      const url = entry.url.replace(/\/$/, '').replace(/^https?:\/\/[^/]+/, '');
      const lastmod = articleLastmod[url];
      if (lastmod) entry.lastmod = lastmod;
      return entry;
    },
    filter(page) {
      const url = page.replace(/\/$/, '').replace(/^https?:\/\/[^/]+/, '');
      return url !== '/articles/search' && url !== '/articles/tags';
    }
  })],
  output: 'static', // Pre-renders by default, keeps API dynamic
  adapter: vercel({
    webAnalytics: {
      enabled: true // Keep it enabled if needed, or set it to false if not
    }
  }),
  markdown: {
    remarkPlugins: [remarkImageAttrs]
  }
});
