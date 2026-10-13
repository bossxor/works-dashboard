import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Github,
  Smartphone,
  Globe,
  Monitor,
  LayoutGrid,
  Download,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

const GITHUB_OWNER = 'bossxor'
const THEME_KEY = 'github-dashboard:theme'
const PC_EXTENSIONS = ['.exe', '.msi', '.zip']
const ICON_COLORS = [
  'bg-orange-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-indigo-500',
]

interface GithubRepo {
  id: number
  name: string
  html_url: string
  description: string | null
  homepage: string | null
  has_pages: boolean
}

interface ReleaseAsset {
  name: string
  browser_download_url: string
  size: number
}

interface App extends GithubRepo {
  apkAssets: ReleaseAsset[]
  pcAssets: ReleaseAsset[]
  webAppUrl: string | null
}

type Tab = 'apk' | 'web' | 'pc' | 'all'

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function hasExtension(asset: ReleaseAsset, extensions: string[]) {
  const name = asset.name.toLowerCase()
  return extensions.some((ext) => name.endsWith(ext))
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
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('apk')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}repos.json`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('앱 목록을 불러오지 못했습니다.')
        return res.json()
      })
      .then((repos: Array<GithubRepo & { assets: ReleaseAsset[] }>) =>
        setApps(
          repos.map(({ assets, ...repo }) => ({
            ...repo,
            apkAssets: assets.filter((a) => hasExtension(a, ['.apk'])),
            pcAssets: assets.filter((a) => hasExtension(a, PC_EXTENSIONS)),
            webAppUrl:
              repo.homepage ||
              (repo.has_pages
                ? `https://${GITHUB_OWNER}.github.io/${repo.name}/`
                : null),
          })),
        ),
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : '알 수 없는 오류'),
      )
      .finally(() => setLoading(false))
  }, [])

  const tabs = [
    { id: 'apk', label: 'Android 앱', icon: Smartphone, list: apps.filter((a) => a.apkAssets.length > 0) },
    { id: 'web', label: '웹앱', icon: Globe, list: apps.filter((a) => a.webAppUrl) },
    { id: 'pc', label: 'PC 툴', icon: Monitor, list: apps.filter((a) => a.pcAssets.length > 0) },
    { id: 'all', label: '전체', icon: LayoutGrid, list: apps },
  ] as const
  const current = tabs.find((t) => t.id === tab)!

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#0e0d10] dark:text-[#f5f5f7] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {GITHUB_OWNER} Lab
            </h1>
            <p className="mt-2 text-base text-[#6e6e73] dark:text-[#a1a1a6]">
              직접 만든 앱들
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin"
              className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white px-2 py-1"
            >
              관리자
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="테마 전환"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <nav className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f]'
                  : 'bg-white text-[#1d1d1f] hover:bg-black/5 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:hover:bg-white/10'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {!loading && <span className="opacity-60">{t.list.length}</span>}
            </button>
          ))}
        </nav>

        <main className="mt-6">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-white dark:bg-[#1c1c1e] animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-5 py-4">
              {error}
            </p>
          )}

          {!loading && !error && current.list.length === 0 && (
            <p className="py-16 text-center text-[#6e6e73] dark:text-[#a1a1a6]">
              아직 등록된 앱이 없습니다.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {current.list.map((app, i) => (
              <AppCard key={app.id} app={app} tab={tab} index={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function AppCard({ app, tab, index }: { app: App; tab: Tab; index: number }) {
  const assets = [
    ...(tab === 'apk' || tab === 'all' ? app.apkAssets : []),
    ...(tab === 'pc' || tab === 'all' ? app.pcAssets : []),
  ]
  const webAppUrl = tab === 'web' || tab === 'all' ? app.webAppUrl : null
  const [primary, ...others] = assets
  const color = ICON_COLORS[app.id % ICON_COLORS.length]

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#1c1c1e] p-5 shadow-sm opacity-0 [animation:fadeInUp_0.3s_ease_forwards]"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 shrink-0 rounded-2xl ${color} flex items-center justify-center text-2xl font-bold text-white`}>
          {app.name.replace(/^(tool|game|inv)_/i, '').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold line-clamp-2">
            {app.description || app.name}
          </h2>
          <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] truncate">
            {app.name}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {primary && (
          <a
            href={primary.browser_download_url}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#b45f06] dark:bg-[#f0a13b] text-white dark:text-[#1d1d1f] py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            다운로드
            <span className="text-sm font-normal opacity-80">{formatBytes(primary.size)}</span>
          </a>
        )}
        {webAppUrl && (
          <a
            href={webAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-opacity hover:opacity-90 ${
              primary
                ? 'bg-black/5 dark:bg-white/10'
                : 'bg-[#b45f06] dark:bg-[#f0a13b] text-white dark:text-[#1d1d1f]'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            웹에서 열기
          </a>
        )}
        {others.map((asset) => (
          <a
            key={asset.browser_download_url}
            href={asset.browser_download_url}
            className="text-xs text-center text-[#6e6e73] dark:text-[#a1a1a6] hover:underline truncate"
          >
            다른 파일: {asset.name} ({formatBytes(asset.size)})
          </a>
        ))}
        {tab === 'all' && (
          <a
            href={app.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-[#6e6e73] dark:text-[#a1a1a6] hover:underline"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub에서 보기
          </a>
        )}
      </div>
    </div>
  )
}
