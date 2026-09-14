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
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

const GITHUB_OWNER = 'bossxor'

interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  homepage: string | null
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
  hasWebApp: boolean
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

function Home() {
  const [repos, setRepos] = useState<Array<RepoWithExtras>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            return {
              ...repo,
              apkAssets,
              hasWebApp: Boolean(repo.homepage),
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
  const webAppRepos = repos.filter((r) => r.hasWebApp)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Github className="w-8 h-8 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">
            GitHub 프로젝트 대시보드
          </h1>
        </div>
        <p className="text-gray-500 mb-8">
          {GITHUB_OWNER} 계정의 GitHub 프로젝트를 한곳에서 확인하세요. APK
          파일은 바로 다운로드하고, 웹앱은 새 탭에서 실행할 수 있습니다.
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            저장소를 불러오는 중...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && repos.length === 0 && (
          <p className="text-gray-500 py-12 text-center">
            public 저장소를 찾을 수 없습니다.
          </p>
        )}

        {!loading && repos.length > 0 && (
          <div className="space-y-10">
            <Section
              icon={<Smartphone className="w-5 h-5 text-emerald-600" />}
              title="APK 다운로드"
              count={apkRepos.length}
              emptyText="APK 릴리스가 있는 저장소가 없습니다."
            >
              {apkRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </Section>

            <Section
              icon={<Globe className="w-5 h-5 text-blue-600" />}
              title="웹앱"
              count={webAppRepos.length}
              emptyText="homepage가 설정된 웹앱 저장소가 없습니다."
            >
              {webAppRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </Section>

            <Section
              icon={<Github className="w-5 h-5 text-gray-700" />}
              title="GitHub 전체 저장소"
              count={repos.length}
              emptyText="저장소가 없습니다."
            >
              {repos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </Section>
          </div>
        )}
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
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-400">({count})</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {children}
        </div>
      )}
    </section>
  )
}

function RepoCard({ repo }: { repo: RepoWithExtras }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 hover:text-blue-600 break-all"
        >
          {repo.name}
        </a>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
          {repo.description || '설명이 없습니다.'}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        {repo.language && (
          <span className="flex items-center gap-1">{repo.language}</span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {repo.forks_count}
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {repo.apkAssets.map((asset) => (
          <a
            key={asset.browser_download_url}
            href={asset.browser_download_url}
            className="flex items-center justify-between gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-2 transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Download className="w-4 h-4 shrink-0" />
              <span className="truncate">{asset.name}</span>
            </span>
            <span className="text-xs text-emerald-600 shrink-0">
              {formatBytes(asset.size)}
            </span>
          </a>
        ))}

        {repo.hasWebApp && repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            웹앱 새 탭에서 열기
          </a>
        )}
      </div>
    </div>
  )
}
