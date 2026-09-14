import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Github,
  Smartphone,
  Globe,
  Download,
  ExternalLink,
  Star,
  GitFork,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

const GITHUB_OWNER = 'bossxor'
const THEME_KEY = 'github-dashboard:theme'

interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  homepage: string | null
  has_pages: boolean
  stargazers_count: number
  forks_count: number
  language: string | null
  fork: boolean
  archived: boolean
}

interface ReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

interface RepoWithExtras extends GithubRepo {
  apkAssets: ReleaseAsset[]
  webAppUrl: string | null
  webAppIsPages: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchApkAssets(fullName: string): Promise<ReleaseAsset[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/releases/latest`,
    )
    if (!res.ok) return []
    const release = await res.json()
    const assets: Array<ReleaseAsset> = release.assets ?? []
    return assets.filter((a) => a.name.toLowerCase().endsWith('.apk'))
  } catch {
    return []
  }
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    )
  }, [])

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // ignore storage errors (private mode, quota, etc.)
      }
      return next
    })
  }

  return { theme, toggleTheme }
}

function Home() {
  const [repos, setRepos] = useState<Array<RepoWithExtras>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setRepos([])

    async function load() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100&sort=updated`,
        )
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? '사용자 또는 조직을 찾을 수 없습니다.'
              : 'GitHub API 요청에 실패했습니다.',
          )
        }
        const baseRepos: Array<GithubRepo> = await res.json()
        const visibleRepos = baseRepos.filter((r) => !r.archived)

        const withExtras = await Promise.all(
          visibleRepos.map(async (repo) => {
            const apkAssets = await fetchApkAssets(repo.full_name)
            const webAppIsPages = !repo.homepage && repo.has_pages
            const webAppUrl =
              repo.homepage ||
              (repo.has_pages
                ? `https://${GITHUB_OWNER}.github.io/${repo.name}/`
                : null)
            return {
              ...repo,
              apkAssets,
              webAppUrl,
              webAppIsPages,
            }
          }),
        )

        if (!cancelled) {
          setRepos(withExtras)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const apkRepos = repos.filter((r) => r.apkAssets.length > 0)
  const webAppRepos = repos.filter((r) => r.webAppUrl)

  return (
    <div className="relative min-h-screen bg-[#f6f3ec] text-[#1a1917] dark:bg-[#0e0d10] dark:text-[#ede9e3] transition-colors duration-300">
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.12] dark:opacity-[0.07] text-black dark:text-white bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[length:22px_22px]"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-[#ddd8cc] dark:border-[#2a282e] bg-white/70 dark:bg-[#141317]/70 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
          {/* terminal chrome */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ddd8cc] dark:border-[#2a282e] bg-[#eee9dd] dark:bg-[#191720]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e0645c]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#98c379]/60" />
            </div>
            <span className="text-xs text-[#6b6660] dark:text-[#8d8a86] tracking-wide truncate">
              ~/{GITHUB_OWNER}/repos --live
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="흑백 테마 전환"
              aria-pressed={theme === 'dark'}
              className="ml-auto relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border border-[#ddd8cc] dark:border-[#3a373f] bg-[#dcd6c6] dark:bg-[#0b0a0c] transition-colors"
            >
              <span
                className={`absolute left-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-[#232128] shadow transition-transform duration-200 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-2.5 h-2.5 text-[#f0a13b]" />
                ) : (
                  <Sun className="w-2.5 h-2.5 text-[#b45f06]" />
                )}
              </span>
            </button>
          </div>

          <div className="px-5 sm:px-8 py-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b45f06] dark:text-[#f0a13b] mb-2">
              # {GITHUB_OWNER}/dashboard
            </p>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight">
              GitHub 프로젝트 대시보드
              <span className="cursor-blink inline-block w-2 h-6 bg-[#b45f06] dark:bg-[#f0a13b]" />
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#6b6660] dark:text-[#9a968f] leading-relaxed">
              <span className="text-[#b45f06] dark:text-[#f0a13b]">$</span>{' '}
              {GITHUB_OWNER} 계정의 저장소를 APK 다운로드, 웹앱, 전체 목록으로
              분류해서 보여줍니다. GitHub Pages로 배포된 저장소는 homepage
              설정 없이도 웹앱으로 인식됩니다.
            </p>

            {loading && (
              <div className="py-16">
                <div className="flex items-center gap-2 text-sm text-[#6b6660] dark:text-[#9a968f] mb-6">
                  <span className="text-[#b45f06] dark:text-[#f0a13b]">
                    $
                  </span>
                  <span>fetching {GITHUB_OWNER}/repos...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-[#b45f06] dark:text-[#f0a13b]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#ddd8cc] dark:border-[#2a282e] p-4 animate-pulse"
                    >
                      <div className="h-4 w-2/3 rounded bg-[#e5e0d3] dark:bg-[#232128] mb-3" />
                      <div className="h-3 w-full rounded bg-[#ece8dd] dark:bg-[#1c1b20] mb-1.5" />
                      <div className="h-3 w-4/5 rounded bg-[#ece8dd] dark:bg-[#1c1b20] mb-4" />
                      <div className="h-8 w-full rounded bg-[#ece8dd] dark:bg-[#1c1b20]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-lg border border-red-300/60 dark:border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
                <span className="font-semibold">error:</span> {error}
              </div>
            )}

            {!loading && !error && repos.length === 0 && (
              <p className="py-16 text-center text-sm text-[#9a968f]">
                $ echo "public 저장소를 찾을 수 없습니다."
              </p>
            )}

            {!loading && repos.length > 0 && (
              <div className="mt-8 space-y-10">
                <Section
                  icon={
                    <Smartphone className="w-4 h-4 text-[#b45f06] dark:text-[#f0a13b]" />
                  }
                  title="APK 다운로드"
                  count={apkRepos.length}
                  emptyText="APK 릴리스가 있는 저장소가 없습니다."
                >
                  {apkRepos.map((repo, i) => (
                    <RepoCard key={repo.id} repo={repo} index={i} />
                  ))}
                </Section>

                <Section
                  icon={
                    <Globe className="w-4 h-4 text-[#b45f06] dark:text-[#f0a13b]" />
                  }
                  title="웹앱"
                  count={webAppRepos.length}
                  emptyText="homepage 또는 GitHub Pages가 설정된 저장소가 없습니다."
                >
                  {webAppRepos.map((repo, i) => (
                    <RepoCard key={repo.id} repo={repo} index={i} />
                  ))}
                </Section>

                <Section
                  icon={
                    <Github className="w-4 h-4 text-[#b45f06] dark:text-[#f0a13b]" />
                  }
                  title="GitHub 전체 저장소"
                  count={repos.length}
                  emptyText="저장소가 없습니다."
                >
                  {repos.map((repo, i) => (
                    <RepoCard key={repo.id} repo={repo} index={i} />
                  ))}
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  count,
  emptyText,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-4 pb-2 border-b border-[#ddd8cc] dark:border-[#2a282e]">
        <span className="font-bold text-[#b45f06] dark:text-[#f0a13b]">
          &gt;
        </span>
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wider">
          {title}
        </h2>
        <span className="text-xs text-[#9a968f]">[{count}]</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-[#9a968f]">$ echo "{emptyText}"</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {children}
        </div>
      )}
    </section>
  )
}

function RepoCard({
  repo,
  index,
}: {
  repo: RepoWithExtras
  index: number
}) {
  return (
    <div
      className="group relative flex flex-col gap-3 rounded-lg border border-[#ddd8cc] dark:border-[#2a282e] bg-white/60 dark:bg-[#17161a]/60 p-4 opacity-0 [animation:fadeInUp_0.35s_ease_forwards] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#b45f06]/50 dark:hover:border-[#f0a13b]/40 hover:shadow-lg hover:shadow-black/5"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold break-all hover:text-[#b45f06] dark:hover:text-[#f0a13b] transition-colors"
        >
          {repo.name}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </a>
        <p className="text-sm text-[#6b6660] dark:text-[#9a968f] mt-1 line-clamp-2 min-h-[2.5rem]">
          {repo.description || '설명이 없습니다.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#9a968f]">
        {repo.language && <span>{repo.language}</span>}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {repo.forks_count}
        </span>
        {repo.webAppIsPages && (
          <span className="rounded border border-[#ddd8cc] dark:border-[#2a282e] px-1.5 py-0.5">
            GitHub Pages
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {repo.apkAssets.map((asset) => (
          <a
            key={asset.browser_download_url}
            href={asset.browser_download_url}
            className="flex items-center justify-between gap-2 text-xs font-semibold rounded border border-[#b45f06]/30 dark:border-[#f0a13b]/30 text-[#b45f06] dark:text-[#f0a13b] px-3 py-2 hover:bg-[#b45f06]/10 dark:hover:bg-[#f0a13b]/10 transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{asset.name}</span>
            </span>
            <span className="opacity-70 shrink-0">
              {formatBytes(asset.size)}
            </span>
          </a>
        ))}

        {repo.webAppUrl && (
          <a
            href={repo.webAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold rounded border border-[#ddd8cc] dark:border-[#3a373f] px-3 py-2 hover:border-[#b45f06]/50 dark:hover:border-[#f0a13b]/40 hover:bg-[#b45f06]/5 dark:hover:bg-[#f0a13b]/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            웹앱 새 탭에서 열기
          </a>
        )}
      </div>
    </div>
  )
}
