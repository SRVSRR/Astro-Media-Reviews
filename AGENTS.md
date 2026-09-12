# AGENTS.md

Guidance for AI agents working in this repository. Follow these conventions to avoid introducing discrepancies with the existing code.

## Project Overview

Primary eportfolio + technical blog for **SRVSRR** (Rohan Nandan), a software engineering student. The homepage acts as a portfolio landing page (intro, skills, projects, resume download) with recent blog posts listed below. Built with **Astro 5** (static output) and deployed on **Vercel** at `https://srvsrr.dev`.

## Tech Stack

- **Astro** `^5.16.4` (dev dependency)
- **Tailwind CSS** `^3.4.18` via `@astrojs/tailwind`
- **TypeScript** `^5.9.3` (strict mode via `astro/tsconfigs/strict`)
- **@astrojs/sitemap**, **@astrojs/vercel** adapter
- **@vercel/analytics**, **@vercel/speed-insights**
- **@astrojs/check** (type-checking)
- Node `>=18.17.0`

## Commands

| Command            | Action                                  |
| ------------------ | --------------------------------------- |
| `npm install`      | Install dependencies                    |
| `npm run dev`      | Start dev server at `localhost:4321`    |
| `npm run build`    | `astro check && astro build`            |
| `npm run preview`  | Preview the production build            |
| `npm run astro`    | Run Astro CLI (e.g. `astro add`)        |

Run `npm run build` (includes `astro check`) after any changes to verify type-correctness.

## Commits

Work should be committed **incrementally**, not as one large diff. Break a task into small, logical units and commit each as a separate change:

- One logical change per commit (e.g. a feature, a fix, a refactor, a content edit — not all at once).
- Use concise, lowercase-prefixed messages matching the repo's conventional-commit style (see `git log`):
  - `Feat:` — a new feature or capability
  - `Fix:` — a bug fix
  - `Chore:` — maintenance, config, or non-functional changes
  - Plain messages are acceptable for content-only edits (e.g. `new blogs`, `ads.txt added`).
- Never commit secrets, `dist/`, `.astro/`, `node_modules/`, `.vercel/`, or `.env*`.
- Stage only the intended files (`git add <file>`), and review `git status` + `git diff` before committing.

## Project Structure

```
/
├── public/
│   ├── images/              # Article images (referenced by filename in frontmatter)
│   ├── rohan-nandan-resume.pdf    # Downloadable resume (generated from the .docx)
│   ├── rohan-nandan-resume.docx   # Resume source (Word doc)
│   ├── ads.txt              # Google AdSense
│   ├── robots.txt           # Sitemap: https://srvsrr.dev/sitemap-index.xml
│   ├── favicon.svg
│   └── apple-touch-icon*.png
├── src/
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── ArticleCard.astro
│   │   ├── RelatedPosts.astro    # bottom-of-article suggestions: same series (max 3) or tag overlap (max 3)
│   │   ├── Pagination.astro
│   │   ├── SearchForm.astro
│   │   └── Tags.astro
│   ├── content/
│   │   ├── blog/             # One .md file per article
│   │   └── config.ts         # Collection schema
│   ├── images/               # about.jpg, error-404.png, team*.png/webp
│   ├── layouts/
│   │   └── MainLayout.astro   # Shared shell: SEO, head, Navbar, Footer
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   ├── api/search.json.ts    # Dynamic API endpoint
│   │   └── articles/
│   │       ├── index.astro          # /articles
│   │       ├── [...slug].astro     # /articles/{slug}
│   │       ├── page/[page].astro   # /articles/page/{n}
│   │       ├── tag/[...tag].astro  # /articles/tag/{tag}
│   │       ├── browse.astro        # /articles/browse (Categories + Series)
│   │       ├── tags.astro          # 301 redirect → /articles/browse
│   │       └── search.astro        # /articles/search?query=
│   ├── constants.ts
│   ├── env.d.ts
│   └── utils.ts
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json
└── tsconfig.json
```

## Content Collection

Defined in `src/content/config.ts`. Collection name: **`blog`**.

Frontmatter schema (all fields in `entry.data`):

```ts
{
  title: string;          // required
  description?: string;   // optional
  pubDate: Date;          // required, e.g. 2026-01-31
  author: string;         // required
  image: string;          // required — filename only, e.g. 'image5.webp'
  tags: string[];         // required
  series?: string;        // optional — groups connected posts (e.g. 'Expense Tracker Case Studies')
}
```

**Important notes:**

- Article **slug** is resolved from the `slug:` frontmatter field when present; otherwise it falls back to the filename. Most `.md` files declare an explicit `slug:` that (in some cases) differs from the filename — use `entry.slug`, never derive from the filename.
- `image` is a **filename only**, resolved against `/images/` at render time. Put the actual file in `public/images/`.
- Sorting is always newest-first using `b.data.pubDate.valueOf()` (`b - a`).
- `tags` are single strings (e.g. `['Intro to Software Engineering']`).

## Routing Conventions

- Article listing: `/articles` (page 1), `/articles/page/{n}` (n > 1). Page 1 redirects to `/articles` (301).
- Individual article: `/articles/{slug}`.
- Tag filter: `/articles/tag/{tag}` — tags are URL-safe slugified via `slugify()` (see Utilities). e.g. `Intro to Software Engineering` → `/articles/tag/intro-to-software-engineering`.
- Browse page: `/articles/browse` — Categories + Series sections (`#categories`, `#series`, `#series-{slug}` anchors). Footer links top 5 tags and top 5 series here.
- Search: `/articles/search?query=...` (server-rendered) and `/api/search.json?query=...` (JSON; `prerender = false`).
- `trailingSlash: "never"` is set — do not add trailing slashes to internal links.
- Internal links use URL-safe lowercase slugs; `capitalize()` (from `src/utils.ts`) is used for display labels.

## Design System (Tailwind)

Custom theme defined in `tailwind.config.mjs`. Use these tokens instead of arbitrary values:

- **Font:** `font-sans` → `"Space Grotesk"`, `Inter`, system-ui
- **Colors:**
  - `primary`: `#0c1728`
  - `secondary`: `#111e32`
  - `accent`: `#f97316` (orange — used for links, CTAs, hover states)
  - `muted`: `#a7b4c8`
  - `soft`: `#1b2a44`
- **Shadow:** `shadow-glow`
- Body background gradient: `bg-gradient-to-b from-primary via-soft to-primary`, text `text-slate-100`.
- Cards: `bg-secondary border border-soft rounded-xl`.

## Utilities (`src/utils.ts`)

- `formatDate(date)` — long readable date.
- `capitalize(str)` — capitalize first letter of tags.
- `slugify(str)` — URL-safe lowercase hyphen slug (used for tag links).
- `calculateReadTime(content)` — word count / 200 wpm, returns `` `${minutes} min read` ``.

## Constants (`src/constants.ts`)

- `SITE_TITLE = 'SRVSRR'`
- `SITE_DESCIPTION` (note: typo in the variable name is intentional in the codebase — do not "fix" without renaming all usages)
- `HOMEPAGE_ARTICLE_LIMIT = 6`
- `ARTICLES_PER_PAGE = 6`

## Inline Image Style Hints

Markdown inline images (inside article bodies) support alignment/sizing via `alt`-text suffixes, styled globally in `src/pages/articles/[...slug].astro`:

- `![alt|small](/images/file.webp)` — 40% width
- `![alt|medium](/images/file.webp)` — 65% width
- `![alt|large](/images/file.webp)` — 85% width
- `![alt|left](/images/file.webp)` — floated left
- `![alt|right](/images/file.webp)` — floated right
- `![alt|center](/images/file.webp)` — centered (default)

## Layout & SEO

`MainLayout.astro` is the single shared layout. It handles:

- SEO meta tags (Open Graph, Twitter, canonical, robots)
- JSON-LD (`WebSite` always; `BlogPosting` passed via `jsonLd` prop for articles)
- Third-party scripts: Google AdSense, Umami analytics, Vercel Analytics + Speed Insights
- Google Fonts (Space Grotesk + Inter)

Props: `title`, `description`, `image`, `type` (`'website' | 'article'`), `noindex`, `publishedTime`, `author`, `jsonLd`.

Page titles are rendered as `` `${SITE_TITLE} - ${title}` ``.

## Conventions / Gotchas

- Blog listing uses a **list-card layout without a preview image** (`ArticleCard.astro`). The `image` frontmatter field is still required and is only rendered on the individual article page.
- Do not add code comments unless asked (see the Note in the repo's editing guidelines).
- `.astro` files use a `---` frontmatter block for JS/TS logic; props are typed with local `interface Props` blocks (not imported).
- TypeScript is strict; `npm run build` runs `astro check` first.
- `.DS_Store` files are git-ignored but currently exist in the working tree — do not stage or worry about them.
- Do not commit `dist/`, `.astro/`, `node_modules/`, `.vercel/`, or `.env*` (all git-ignored).
