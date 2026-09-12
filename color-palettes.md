# Color Palettes

Registry of site color schemes so we can switch between them safely. All palettes keep the orange accent (`#f97316`) constant.

Tokens are defined in `tailwind.config.mjs` and map to:

- `primary` — page background (start/end of the body gradient)
- `secondary` — card background
- `soft` — borders, button backgrounds (also the `via` color in the gradient)
- `muted` — secondary/body text
- `accent` — orange (links, CTAs, hover)
- `shadow-glow` — `0 20px 60px rgba(249, 115, 22, 0.25)`

Body background gradient (`MainLayout.astro`): `bg-gradient-to-b from-primary via-soft to-primary`, with `text-slate-100` text.

---

## Current

| Token | Value |
|-------|-------|
| primary | `#0c1728` |
| secondary | `#111e32` |
| soft | `#1b2a44` |
| muted | `#a7b4c8` |
| accent | `#f97316` |

---

## Combo 1 — Neutral Graphite

| Token | Value |
|-------|-------|
| primary | `#0e1116` |
| secondary | `#161a20` |
| soft | `#232a33` |
| muted | `#9aa3ad` |
| accent | `#f97316` |

---

## Combo 2 — Warm Charcoal

| Token | Value |
|-------|-------|
| primary | `#141008` |
| secondary | `#1c1812` |
| soft | `#29231a` |
| muted | `#a39b8a` |
| accent | `#f97316` |

---

## Combo 3 — Neutralized Navy

| Token | Value |
|-------|-------|
| primary | `#0b1220` |
| secondary | `#121a2b` |
| soft | `#1f2a3d` |
| muted | `#8b95a6` |
| accent | `#f97316` |
