import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Github, Smartphone, Globe, Monitor, LayoutGrid, Sun, Moon } from 'lucide-react'

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
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

        <nav className="mt-8 flex gap-1 overflow-x-auto [scrollbar-width:none] border-b border-black/10 dark:border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 shrink-0 -mb-px border-b-2 px-3 py-2.5 font-semibold transition-colors ${
                tab === t.id
                  ? 'border-[#b45f06] text-[#b45f06] dark:border-[#f0a13b] dark:text-[#f0a13b]'
                  : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-white'
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
            <div className="h-96 rounded-2xl bg-white dark:bg-[#1c1c1e] animate-pulse" />
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

          {current.list.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#1c1c1e] divide-y divide-black/5 dark:divide-white/10 overflow-hidden">
              {current.list.map((app) => (
                <AppRow key={app.id} app={app} tab={tab} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const pillClass =
  'shrink-0 rounded-full px-5 py-1.5 text-sm font-bold transition-opacity hover:opacity-90'
const primaryPill = `${pillClass} bg-[#b45f06] text-white dark:bg-[#f0a13b] dark:text-[#1d1d1f]`
const secondaryPill = `${pillClass} bg-black/5 text-[#b45f06] dark:bg-white/10 dark:text-[#f0a13b]`

function pcLabel(fileName: string) {
  if (/setup|install/i.test(fileName)) return '설치형'
  const ext = fileName.split('.').pop()!.toLowerCase()
  return ext === 'exe' ? '포터블' : ext.toUpperCase()
}

function AppRow({ app, tab }: { app: App; tab: Tab }) {
  const apk = tab === 'apk' || tab === 'all' ? app.apkAssets[0] : undefined
  const pcAssets = tab === 'pc' || tab === 'all' ? app.pcAssets : []
  const webAppUrl = tab === 'web' || tab === 'all' ? app.webAppUrl : null
  const subtitle = {
    apk: () => `Android · ${formatBytes(app.apkAssets[0].size)}`,
    pc: () => `PC · ${formatBytes(app.pcAssets[0].size)}`,
    web: () => '웹앱',
    all: () =>
      [app.apkAssets[0] && 'Android', app.pcAssets[0] && 'PC', app.webAppUrl && '웹']
        .filter(Boolean)
        .join(' · ') || app.name,
  }[tab]()
  const title = app.description || app.name

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div
        className={`w-12 h-12 shrink-0 rounded-2xl ${ICON_COLORS[app.id % ICON_COLORS.length]} flex items-center justify-center text-xl font-bold text-white`}
      >
        {title.replace(/^[^\p{L}\p{N}]+/u, '').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold truncate">{title}</h2>
        <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] truncate">
          {subtitle}
        </p>
      </div>
      <div className="flex gap-1.5">
        {apk && (
          <a href={apk.browser_download_url} className={primaryPill}>
            받기
          </a>
        )}
        {pcAssets.map((asset) => (
          <a
            key={asset.browser_download_url}
            href={asset.browser_download_url}
            title={`${asset.name} (${formatBytes(asset.size)})`}
            className={primaryPill}
          >
            {pcAssets.length > 1 ? pcLabel(asset.name) : '받기'}
          </a>
        ))}
        {webAppUrl && (
          <a
            href={webAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={tab === 'web' ? primaryPill : secondaryPill}
          >
            열기
          </a>
        )}
        <a
          href={app.html_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub에서 보기"
          title="GitHub에서 보기"
          className="shrink-0 p-1.5 rounded-full text-[#6e6e73] hover:bg-black/5 dark:text-[#a1a1a6] dark:hover:bg-white/10"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
