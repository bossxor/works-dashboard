// Fetches repos + latest release assets at build time into public/repos.json,
// so visitors never hit the GitHub API rate limit.
import { writeFile } from 'node:fs/promises'

const OWNER = 'bossxor'
const SELF_REPO = 'works-dashboard'
const headers = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  return res.ok ? res.json() : null
}

const repos = await api(`/users/${OWNER}/repos?per_page=100&sort=updated`)
if (!repos) throw new Error('Failed to fetch repo list')

const result = await Promise.all(
  repos
    .filter((r) => !r.archived && r.name !== SELF_REPO)
    .map(async (r) => ({
      ...r,
      assets: (await api(`/repos/${r.full_name}/releases/latest`))?.assets ?? [],
    })),
)

await writeFile('public/repos.json', JSON.stringify(result))
console.log(`repos.json: ${result.length} repos`)
