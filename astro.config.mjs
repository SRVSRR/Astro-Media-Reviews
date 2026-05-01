import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://srvsrr.vercel.app",
  trailingSlash: "never",
  integrations: [tailwind(), sitemap()],
  output: 'server', // Keeps SSR if that's the goal
  adapter: vercel({
    webAnalytics: {
      enabled: true // Keep it enabled if needed, or set it to false if not
    }
  })
});
