# AGENTS.md

Overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

A single-page dashboard listing the public repositories of the `bossxor` GitHub account, split into
collapsible sections: APK downloads, web apps, PC tools, and the full repo list. All data is fetched
client-side directly from the public GitHub REST API — there is no backend, database, or stored
GitHub account.

Live site: https://bossxor.github.io/works-dashboard/

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (static prerender) |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | GitHub Pages via GitHub Actions |

## Directory Structure

```
├── .github/workflows/pages.yml  # Build + deploy to GitHub Pages on push to main
├── public/                      # Static assets (favicon, logo)
├── src
│   ├── routes
│   │   ├── __root.tsx           # <html>/<head>/<body> shell, page title, theme init script
│   │   └── index.tsx            # The entire dashboard UI and GitHub API fetching logic
│   ├── router.tsx               # TanStack Router setup
│   └── styles.css               # Tailwind import, font, dark variant, keyframes
├── vite.config.ts               # base '/works-dashboard/', prerender enabled
└── tsconfig.json
```

## Key Concepts

### Data flow (all in `src/routes/index.tsx`)

1. `GET https://api.github.com/users/bossxor/repos` fetches public repos. Archived repos and this
   repo itself (`works-dashboard`) are filtered out.
2. For each repo, `GET https://api.github.com/repos/{owner}/{repo}/releases/latest` is fetched to
   read release assets. This is unauthenticated, so it is subject to GitHub's ~60 requests/hour/IP
   rate limit.
3. Repos are categorized by:
   - **APK 다운로드** — latest release has a `.apk` asset. Cards show only APK downloads.
   - **웹앱** — repo has a `homepage`, or GitHub Pages enabled. Cards show only the web app link.
   - **PC 툴** — latest release has a `.exe` / `.msi` / `.zip` asset. Cards show only PC downloads.
   - **GitHub 전체 저장소** — every repo; cards show all available actions.

A repo can appear in more than one section.

### Static hosting

`vite build` prerenders `/` into `dist/client/index.html`; GitHub Pages serves `dist/client` under
`/works-dashboard/`. There is no server at runtime, so server functions / server routes won't work.

## Development Commands

```bash
pnpm dev     # Start dev server (http://localhost:3000/works-dashboard/)
pnpm build   # Production build into dist/client
```

## Conventions

- Components: PascalCase, colocated in `src/routes/index.tsx` for this single-page app.
- TypeScript strict mode; prefer explicit interfaces for GitHub API response shapes.
- Tailwind utility classes for styling; no custom CSS beyond `styles.css` base rules.
