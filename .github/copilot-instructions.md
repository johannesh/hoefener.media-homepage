# Copilot Instructions — hoefener.media-homepage

## Project Overview

Astro 5 + Tailwind CSS v4 website for hoefener.media, based on the `astro-starter-pro` template.

## Tech Stack

- **Framework:** Astro 5 (content layer API, file-based routing)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Language:** TypeScript (strict)
- **Content:** Markdown / MDX blog posts
- **Icons:** `astro-icon` with lucide (`lucide:*`) and tabler (`tabler:*`) icon sets
- **Analytics:** Vercel Analytics + Speed Insights
- **Extras:** `@astrojs/sitemap`, `@astrojs/rss`, `remark-reading-time`

## Key Commands

```bash
npm run dev           # start dev server
npm run build         # production build
npm run preview       # preview production build
npm run check         # astro type check
npm run typecheck     # tsc --noEmit
npm run fix           # prettier + eslint fix
```

## Directory Structure

| Path                           | Purpose                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `src/config/site.ts`           | Global site config (name, URL, nav links, social links)                              |
| `src/content.config.ts`        | Blog collection schema                                                               |
| `src/content/blog/`            | Markdown/MDX blog posts                                                              |
| `src/layouts/BaseLayout.astro` | Base layout wrapper                                                                  |
| `src/pages/`                   | File-based routing                                                                   |
| `src/components/widgets/`      | Page section widgets (Hero, Features, Content, ServiceList, Values, …)               |
| `src/components/ui/`           | Reusable UI primitives (Button, Card, Form, Headline, Pagination, Tags, ThemeToggle) |
| `src/components/layout/`       | Navbar, Footer                                                                       |
| `src/components/seo/`          | Seo.astro, Schema.astro                                                              |
| `src/types/types.d.ts`         | Shared TypeScript interfaces                                                         |
| `src/styles/global.css`        | Global styles                                                                        |
| `public/`                      | Static assets                                                                        |

## Conventions

- **Path alias:** `@/` maps to `src/`
- **Icons:** `<Icon name="lucide:arrow-right" />` or `<Icon name="tabler:brand-github" />`
- **Widgets** accept the base `Widget` interface props: `id`, `isDark`, `bg`, `containerClass`, `classes`, `animate`
- **Blog frontmatter** schema: `title`, `description`, `pubDate`, `author`, `image?`, `tags?`, `category?`
- Reading time is injected into frontmatter automatically as `minutesRead` via `remark-reading-time`
- i18n: `en` (default, no prefix) + `es`
- Prefetch: all links, viewport strategy

## Shared TypeScript Interfaces (`src/types/types.d.ts`)

- `CallToAction` — `{ text, href, variant?, icon?, ariaLabel? }`
- `Feature` / `Value` — `{ title, description, icon?, iconClass? }`
- `Service` — `{ title, description, icon }`
- `Widget` — base props for all widget components
- `HeadlineProps`, `HeroProps` — extend `Widget`
