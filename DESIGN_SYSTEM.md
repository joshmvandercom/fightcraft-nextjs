# FightCraft Design System

## Color Palette
- **Background**: `black` (#000) and `white` (#fff) only. No grays as primary backgrounds.
- **Text on black**: `white` for headings, `white/60` for body, `white/40` for secondary/muted, `white/30` for labels
- **Text on white**: `black` for headings, `black/60` for body, `black/40` for secondary/muted, `black/30` for labels
- **Borders**: `white/20` on dark, `black/10` on light. Hover: `white/60` or `white`
- **No accent colors**. Contrast and typography carry the design.

## Typography
- **Display font**: `font-display` — Timmons (custom). Used only for hero headlines.
- **Heading font**: `font-heading` — Barlow Condensed. Always `uppercase`, `font-bold`, `tracking-tight`.
- **Body font**: `font-body` — Poppins (set on `<body>`). Normal case, `leading-relaxed`.

### Type Scale
| Usage | Size |
|-------|------|
| Hero headline | `text-4xl sm:text-5xl md:text-7xl lg:text-8xl` |
| Section heading (h2) | `text-5xl md:text-6xl` (river sections) or `text-5xl md:text-7xl` (standalone) |
| Card heading (h3) | `text-2xl` to `text-4xl` |
| Body text | `text-lg` (river sections, primary content) or `text-sm` (cards, secondary) |
| Labels/eyebrows | `text-xs uppercase tracking-widest` with muted opacity |
| Nav links | `text-sm uppercase tracking-widest` |
| Dropdown items | `text-xs uppercase tracking-widest` |

## Spacing
- **Section padding**: `py-24 px-6`
- **Max width**: `max-w-7xl mx-auto` (global container)
- **Grid gap**: `gap-16` (river sections), `gap-8` (card grids), `gap-6` (tight grids)
- **Section headers**: `mb-16` below header block, `mt-6` for the rule

## Components

### Section Headers
```
<h2> font-heading text-5xl md:text-7xl uppercase font-bold tracking-tight
<div> w-16 h-px bg-white (or bg-black) mt-6
```

### Buttons
- **Primary (on dark)**: `bg-white text-black` — solid white, black text
- **Primary (on light)**: `bg-black text-white` — solid black, white text
- **Secondary (on dark)**: `border border-white/40 text-white` — outlined
- **Secondary (on light)**: `border border-black text-black` — outlined
- **All buttons**: `font-heading text-sm uppercase tracking-widest`, no rounded corners

### Cards
- No rounded corners anywhere (`rounded-none` or default)
- Border: `border border-white/20` on dark, `border border-black/10` on light
- Padding: `p-8`

### Images
- **Always grayscale**: `grayscale` CSS filter
- Program cards: `grayscale group-hover:grayscale-0` (color on hover)
- Hero/background images: grayscale + `bg-black/80` overlay

### Dividers
- Thin horizontal rules: `h-px bg-white` or `bg-black`
- Section dividers: `w-16 h-px` below headings
- Full-width: `border-t border-white/10` or `border-black/10`

## Layout Patterns

### River Section (alternating image + text)
- 2-column grid: `grid grid-cols-1 md:grid-cols-2 gap-16 items-center`
- Alternates bg: white then black
- Image on one side, text on other. Use `order-1/order-2` to flip on mobile.

### Card Grid
- 3-column: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Program grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Page Hero (inner pages)
- `min-h-[50vh]` default, `min-h-[70vh]` for tall variant
- Background: optional grayscale image + `bg-black/80` overlay, or solid black
- Content: centered, `pt-20` to clear nav

## Nav
- Fixed position, transparent on top, `bg-black/90 backdrop-blur-sm` after 100px scroll
- Dropdowns: `bg-black border border-white/20`, items `text-xs uppercase tracking-widest`
- Location context pill: right side, shows current gym with dropdown for programs/schedule

## Changelog
| Date | Decision |
|------|----------|
| 2026-03-31 | Black and white only — no accent colors |
| 2026-03-31 | All images use CSS grayscale filter |
| 2026-03-31 | No rounded corners on any element |
| 2026-03-31 | Barlow Condensed for all headings, always uppercase |
| 2026-03-31 | River section h2 bumped to `text-5xl md:text-6xl`, body to `text-lg` |
| 2026-03-31 | Core Values removed from homepage — lives on its own page at /about/core-values |
| 2026-03-31 | Hero changed from big logo to CTA: headline + subline + dual buttons |
| 2026-03-31 | `neutral-100` allowed as light gray background for alternating sections (not just black/white) |
| 2026-03-31 | Location page uses sticky left / scrolling right layout for programs section |
| 2026-03-31 | Program cards: `aspect-[16/10]`, grayscale→color on hover with `duration-700`, `scale-105` |
| 2026-03-31 | Location switcher navigates to `/{slug}` page instead of dynamic JS swap |
| 2026-03-31 | Location info displayed as horizontal 4-column bar on `neutral-100` |
| 2026-03-31 | Brand: underscore typography convention — `FIGHT_CRAFT`, `SAN_JOSE      CA`, `PREMIER_MARTIAL_ARTS` |
| 2026-03-31 | Brand: double-border box (outer `border-2` + inner `border`) for cards and badge |
| 2026-03-31 | Brand: `BrandBadge` component — FC mark + thin rule + underscore text. Sizes: sm/md/lg. Variants: light/dark |
| 2026-03-31 | Brand: location cards use double-border treatment + underscore city/state label |
| 2026-03-31 | Brand: eyebrow labels use `tracking-[0.3em]` with underscore naming |
| 2026-03-31 | Brand: footer uses FC mark + `FIGHT_CRAFT` text instead of logo image |
