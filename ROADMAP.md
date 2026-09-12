# Roadmap — Reader Experience & Hygiene

Nine approved items. Status boxes track progress (`[ ]` todo, `[x]` done).
Conventions for all items: follow `AGENTS.md`, keep changes incremental with
one commit per item, run `npm run build` after each.

Suggested build order: 404 → share buttons → prev/next → copy-code →
ToC → progress bar → newsletter → lighthouse → search console.

---

## 1. Custom 404 with search + popular links `[x]`

**Why:** current 404 is bare; don't strand mistyped visitors.
**Scope:**
- Rewrite `src/pages/404.astro`: keep illustration/heading, add `SearchForm`,
  plus 3–4 popular links (home, articles, skills, latest post — resolvable
  at build time via `getCollection`).
**Accept:** `/nonexistent` renders search + links; build passes.
**Effort:** S. **Depends on:** nothing.

## 2. Share buttons on articles `[x]`

**Why:** cheap distribution; pairs with the fixed OG card.
**Scope:**
- New `src/components/ShareButtons.astro` (X intent, LinkedIn share,
  copy-link via clipboard), rendered in `src/pages/articles/[...slug].astro`
  above `RelatedPosts`.
- Share URLs use canonical article URL + title.
**Accept:** each button opens the correct share target with title/URL.
**Effort:** S. **Depends on:** nothing.

## 3. Prev/next navigation (series-aware) `[ ] (dropped — RelatedPosts cards already cover discovery)`

**Why:** carry readers through the Expense Tracker sequence in order.
**Scope:**
- In `[...slug].astro`, compute siblings: if the post has `series`, use
  prev/next within that series ordered by `pubDate`; otherwise chronological
  neighbors (newest-first).
- Render a `← Prev / Next →` bar above `RelatedPosts`; hide the missing
  side at sequence ends.
**Accept:** correct links both directions on series + standalone posts.
**Effort:** S. **Depends on:** nothing.

## 4. Copy-code buttons on code blocks `[x]`

**Why:** case-study posts have `sh`/`json` snippets readers will lift.
**Scope:**
- Client-side script in `[...slug].astro`: for each `article pre`, inject
  a button copying `innerText` via `navigator.clipboard` (with fallback),
  styled with site tokens, showing transient `✓ Copied` feedback.
**Accept:** click copies exact code text; visible feedback; no layout shift.
**Effort:** S. **Depends on:** nothing.

## 5. Table of contents on long articles `[x]`

**Why:** several posts are 130+ lines with deep heading trees.
**Scope:**
- In `[...slug].astro`, use the `headings` returned by `entry.render()`
  (depth 2–3) to build a ToC — new `TableOfContents.astro` component.
- Sticky aside on desktop; hidden (or `<details>` collapsible) on mobile.
  Requires widening the article layout to a content+sidebar grid.
- Active-section highlight is v2, not in scope.
**Accept:** ToC lists every h2/h3 with working anchor links on desktop.
**Effort:** M. **Depends on:** nothing.

## 6. Reading progress bar `[x]`

**Why:** expected on long-form technical blogs.
**Scope:**
- Thin accent bar fixed under the navbar on article pages only
  (`[...slug].astro` or `MainLayout` behind a flag), width driven by a
  scroll listener from 0→100% across the article element.
**Accept:** bar tracks article scroll smoothly; absent on non-article pages.
**Effort:** S. **Depends on:** nothing (coordinate placement with ToC work).

## 7. Newsletter signup `[ ]`

**Why:** RSS exists, but email captures casual readers.
**Scope:**
- Embed form section on homepage (above latest articles). Provider TBD:
  Buttondown or Substack.
- Style embed to match site tokens; verify subscribe → confirmation flow.
**Accept:** working end-to-end signup from the live site.
**Effort:** S + account setup.
**Blocked on:** user creating the provider account first. No API keys or
secrets in the repo — embed snippet only.

## 8. Lighthouse / performance audit `[x]`

**Why:** verify AdSense + analytics scripts aren't tanking Core Web Vitals.
**Result (desktop, local static server, Sep 2026):**

| Page | Perf | A11y | BP | SEO | LCP | CLS |
|------|------|------|----|-----|-----|-----|
| Home (before) | 86 | 91 | 73 | 100 | 1.8s | 0.001 |
| Home (after) | 92 | 100 | 73 | 100 | 1.7s | 0.001 |
| Article (before) | 92 | 94 | 73 | 100 | 1.8s | 0.004 |
| Article (after) | 92 | 100 | 73 | 100 | 1.8s | 0.004 |

**Fixed from audit:** accent-button contrast (`text-white` → `text-primary`
on 3 CTAs), `<main>` landmark in `MainLayout`, byline `h3` → `p`
(heading-order).
**Remaining BP deductions (not chased):** AdSense third-party cookies +
related inspector issues; `/_vercel/*` script 404s are local-server
artifacts (scripts only exist in production). Unused-JS/render-blocking
savings flagged are Google Fonts + AdSense + Vercel scripts (third-party).
**Effort:** S (audit only; fixes are separate items). **Depends on:** nothing.

## 9. Sitemap/robots verification in Search Console `[ ]`

**Why:** sitemap exists but is unclaimed; confirm indexing.
**Scope (no code):**
- Verify property, submit `sitemap-index.xml`, confirm `robots.txt`,
  request indexing for key pages, review coverage after a few days.
**Accept:** property verified + sitemap submitted.
**Effort:** S. **Depends on:** user (needs Google account access).
