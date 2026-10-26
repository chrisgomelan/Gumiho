# Gumiho (구미호)

A modern, ad-light streaming interface and tracker for **Korean Dramas (K-Dramas)** and **American / Western TV Series**, inspired by Kitsune.

## Features

- **Zero Database / Zero Accounts Required**: 100% client-side savepoints via `localStorage` with cross-tab sync and JSON export/import backups.
- **Zero API Keys Required**: Completely powered by public live TV endpoints (TVMaze REST API) with zero environment variable setup.
- **Multiple Free Streaming Servers**: High-availability embed player featuring multi-server fallback (MultiEmbed, VidSrc PM, VidSrc SH, AutoEmbed, 2Embed, and SmashyStream).
- **Instant AJAX Live Search**: Debounced keystroke search with in-memory caching and thumbnail previews.
- **Dedicated Category Tabs**: Strictly separated views for **K-Dramas** (`/kdramas`) and **American Series** (`/american`).
- **Fully Responsive**: Mobile-first touch targets, numeric keypads for timestamp bookmarks, 5-to-12 column responsive episode grids, and a floating Scroll-to-Top button.
- **Clean Aesthetic**: Inter typography, dark slate theme with rose accents, and pure SVG/Lucide icons with zero emojis.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

Gumiho is built with Next.js App Router and is 100% ready for instant deployment on Vercel:

### Option 1: Vercel Dashboard (Recommended)

1. Push your repository to GitHub / GitLab / Bitbucket:
   ```bash
   git add .
   git commit -m "feat: complete Gumiho streaming app"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Leave **Environment Variables blank** (Gumiho requires zero env variables).
5. Click **Deploy**.

### Option 2: Vercel CLI

```bash
npx vercel
```
Follow the CLI prompts to deploy directly from your terminal.
