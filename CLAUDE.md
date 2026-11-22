# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio / photography site for Benson Wu (吳秉乾), built with Astro 5 as a fully static site (`output: 'static'`, `build.format: 'directory'` → `/aboutme/index.html` etc.). Deployed at https://bhwu.pages.dev (Cloudflare Pages). UI text and code comments are mostly Traditional Chinese (`lang="zh-Hant"`).

## Commands

- `npm run dev` — dev server
- `npm run build` — runs `astro check` (TypeScript/Astro type checking) **then** `astro build`; type errors fail the build
- `npm run preview` — serve the built `dist/`
- `npx astro check` — type check only

There is no test suite or linter configured.

## Architecture

**Content is split for easy maintenance** (owner's request; `CONTENT.md` at the repo root is the owner-facing how-to — keep it in sync when changing data formats):
- `src/data/profile.ts` (profile, typewriter `roles`, interests), `social.ts`, `copy.ts` (all site wording), `photos.ts` (`ALBUM_SETTINGS`, `PHOTO_STORIES`), `experienceTypes.ts` (type → icon/label; add new types here + the icon to `icon_names` in Layout).
- `src/data/siteData.ts` only aggregates these into `SITE_DATA` (no content lives there).
- Experiences are an Astro content collection: one Markdown file per entry in `src/content/experiences/` (frontmatter `year: "YYYY/MM"`, `type`, `title`, optional `image`; body = description, rendered as Markdown). Schema in `src/content.config.ts`; `aboutme.astro` sorts by `year` descending.

**Photos are auto-discovered**: `src/utils/gallery.ts` globs every image under `src/assets/images/**` into `PHOTOS` (sorted by `albums` order, then filename) and `ALBUMS`. To add photos, drop files into a folder there — no code change. `ALBUM_SETTINGS` only maps folder → camera/film display names and order; `PHOTO_STORIES` (keyed by `/images/<folder>/<file>`) is optional, and photos without a story show no placeholder text (the owner doesn't intend to write stories for most). `photoUrls()` produces the 300/600w thumbnails and ≤1600px viewer image shared by `GalleryItem` and `RandomPhotos` (home page shows 6 random photos, re-picked client-side on every visit).

**Pages** (`src/pages/`): `index` (centered hero with typewriter roles, 2×2 About panels, 6 random photos, contact band), `aboutme` (bio + experiences timeline), `highlight` (title + album filter chips + 3-column square photo grid), `resume` (hidden from the navbar on purpose and `noindex` via Layout's `noindex` prop; sections auto-built from experiences by type per `src/data/resume.ts`, has print/PDF styles in the `@media print` block of `style.css`), `f1` (hidden + `noindex`; favourite drivers from `src/data/f1.ts`, live data fetched client-side in `src/scripts/f1.ts` from the Jolpica API with sessionStorage caching and max 2 concurrent requests; driver photos and circuit maps fetched at **build time** in `src/utils/f1Media.ts` from Wikipedia pageimages (free-licence only) + Commons attribution, hot-linked not stored — the owner asked for official F1 images/font but agreed to free-licensed ones first; styles in `src/styles/f1.css`, same site font, no emoji — the owner rejected both a separate F1 font and emoji), `callme` (centered card: email + copy button with `execCommand` fallback for non-HTTPS LAN testing + social icons). All wrap `src/layouts/Layout.astro` (also renders `.bg-grid`, back-to-top button, `#lg-refract` SVG filter).

**Positioning & layout preferences** (from the owner): the site is a CS (資工科) student's personal site — photography is only a hobby, and a resume page is planned later. The owner likes **symmetric, centered** layouts; dislikes section number labels like `// 01`, a scroll progress bar, hero stat counters, and cropping photos anywhere except the thumbnail grid (grids are 3-column square thumbnails — the owner chose this over masonry; the viewer and timeline dropdown show full photos), and wants it to work well on phones (375px baseline). The experience `type` (`school`/`cert`/`play`/`hobby`, defined in `experienceTypes.ts`) drives the timeline node icon and is meant for filtering a future resume page. Timeline photos are optional and live in an expandable `<details>` 照片 dropdown inside the card (full, uncropped; clicking opens the lightbox).

**Styling**: `src/styles/style.css` is a token-based design system (`--space-*`, `--radius-*`, `--fs-*`, `--surface-*`, `--line`) plus shared classes (`.container`, `.page`, `.section`, `.section-head`, `.eyebrow`, `.panel`, `.btn`, `.text-link`, `.masonry`). Rule of thumb from the owner: only clickable elements (a/button) get hover effects. `nav.css` styles the navbar: keep its layout and behaviour (desktop capsule + mobile top-left button and left drawer); its material comes from Liquid Glass. Fonts must stay unchanged (Chiron GoRound TC for headings).

**Images**: `src/utils/images.ts` (`imageModules`, `resolveImage`) maps `/images/...` paths to `ImageMetadata` for files in `src/assets/images/`; unresolved paths fall back to `public/` (avatar, favicon, og:image stay in `public/images/headportrait/`). Timeline photos use the same paths.

**Liquid Glass** (`src/styles/glass.css`): currently used **only on the back-to-top button** — the owner does not want buttons in glass. The navbar uses its own original glassmorphism look in `nav.css` (restored from v3: glass toggle, glass drawer, a glass pill per link, underline animation). `.glass` sets `position: relative` with zero specificity so components can still be `position: fixed`; refraction (`backdrop-filter: url(#lg-refract)`) only on Chromium via `html.lg-refract`.

**Animations**: `src/scripts/animations.ts` (GSAP + ScrollTrigger from npm). `initAnimations()` is skipped under `prefers-reduced-motion`; `initUI()` (back-to-top, refraction detection) always runs. Hooks by selector: `.hero-*` intro + `.hero-section` scroll parallax, `[data-scramble]`, `.typewriter[data-roles]`, `[data-scroll="fade-up"]`, `.tags`, `.gallery-item` ("film developing" blur→sharp reveal), `.timeline` (`.is-lit` / `.is-current` nodes), `.bg-grid` spotlight, `.magnetic-btn`, `.glass` pointer highlight. Dispatch `layout:changed` on `document` after layout shifts (e.g. album filtering) so ScrollTrigger refreshes. Owner wants animations "cool but not flashy". Hover styles live in `@media (hover: hover) and (pointer: fine)` blocks.

**Lightbox** (`src/components/Lightbox.astro`): any element with `.lightbox-trigger` + `data-img-src` / `data-title` / `data-description` opens it (triggers are `<a href>` so they're keyboard-accessible). IG-style viewer built as a 3-slide carousel track (prev | current | next) so swiping drags the neighbouring photo in continuously; DOM slides are rotated after each transition. Full-screen on mobile (swipe down to close), side-by-side card on desktop. No numeric counter (owner's request), only windowed dots. Triggers hidden by the album filter are skipped. Supports prev/next over all triggers on the page (buttons and ←/→, windowed dots), focus trap + focus restore, `[text](https://...)` links in title/description, and `?img=<original /images/... path>` deep links (matched via `data-original`).

`tsconfig.json` excludes `old/` and `DOSMTH/` so the backup copies don't affect `astro check`.

**Image protection** (owner's request): `astro.config.mjs` has a `prune-unused-images` integration that deletes unreferenced originals from `dist/_astro` after build (only thumbnails / ≤1600px viewer images are published); `public/_headers` sets `Cross-Origin-Resource-Policy: same-origin` + `X-Robots-Tag: noimageindex` on images; `src/scripts/protect.ts` blocks right-click/drag on photos and global `img` CSS disables drag/iOS long-press save. These are deterrents only — the source photos also live in the GitHub repo, so the repo should stay private.

**Deployment**: pushing to `main` on GitHub deploys the site (Cloudflare Pages builds it). A visitor counter (Pages Function + KV) was prototyped and parked in `old/lab-v4.3/` for later.

## Non-source directories

- `old/` — gitignored archive: the pre-Astro HTML/CSS/JS site, `src-backup-v3.6.1/`, `src-backup-v4.0.0/`, `src-backup-v4.1.0/` and `src-backup-v4.2.0/` (Astro sources before each redesign), and `unused-assets/` (unused 24 MB TTFs, font demo).
- `DOSMTH/` — design notes, prompts, and a TODO list (`code_optimization_todo.md`); gitignored. The owner's stated preferences there: dark-mode design, smooth Apple-style motion, keep existing content/features, don't delete existing files without agreement, don't AI-generate or modify images, and the avatar `S_11296777` is only for the avatar frame.
- `dist/`, `.astro/` — build output / generated types.
