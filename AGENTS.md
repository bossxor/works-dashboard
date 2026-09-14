# AGENTS.md

Overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

A single-page dashboard that lets a user type in any GitHub username or organization and see all of
its public repositories in one place, split into three views: repos with an APK download available
in their latest GitHub release, repos with a `homepage` URL (treated as a runnable web app), and the
full repo list. All data is fetched client-side directly from the public GitHub REST API — there is
no backend, database, or stored GitHub account.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── public/                  # Static assets (favicon, logo)
├── src
│   ├── routes
│   │   ├── __root.tsx        # Root layout: <html>/<head>/<body> shell, page title
│   │   └── index.tsx         # The entire dashboard UI and GitHub API fetching logic
│   ├── router.tsx            # TanStack Router setup
│   └── styles.css            # Tailwind import + base font styling
├── netlify.toml              # Netlify build command / publish dir / dev server settings
├── vite.config.ts            # TanStack Start + React + Tailwind + Netlify vite plugins
└── tsconfig.json
```

## Key Concepts

### Data flow (all in `src/routes/index.tsx`)

1. User types a GitHub username/org into the input and submits. The value is saved to
   `localStorage` (`github-dashboard:owner`) so it's remembered on next visit.
2. `GET https://api.github.com/users/{owner}/repos` fetches all public, non-archived repos.
3. For each repo, `GET https://api.github.com/repos/{owner}/{repo}/releases/latest` is fetched to
   look for assets ending in `.apk`. This is unauthenticated, so it is subject to GitHub's
   ~60 requests/hour/IP rate limit — acceptable for personal/small-scale use, but there is no
   token/auth wired in.
4. Repos are categorized by:
   - **APK download** — has at least one `.apk` release asset.
   - **웹앱 (web app)** — has a non-empty `homepage` field on the repo (opens in a new tab).
   - **GitHub 전체 저장소** — every fetched repo, regardless of category.

A repo can appear in more than one section if it has both an APK and a homepage.

### No backend / no persistence

This is intentionally backend-free: no Netlify Function, no database. If a signed-in GitHub
account or higher API rate limits are needed later, that would require a server-side proxy holding
a GitHub token (see `netlify-functions` skill) rather than calling the GitHub API from the browser.

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
```

## Conventions

- Components: PascalCase, colocated in `src/routes/index.tsx` for this single-page app.
- TypeScript strict mode; prefer explicit interfaces for GitHub API response shapes.
- Tailwind utility classes for styling; no custom CSS beyond `styles.css` base rules.
