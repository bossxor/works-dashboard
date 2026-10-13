import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Lock } from 'lucide-react'

export const AUTH_FILE_PATH = 'public/auth.json'
const AUTH_KEY = 'github-dashboard:auth'

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  )
  return Array.from(new Uint8Array(buf), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

export const pageClass =
  'min-h-screen flex items-center justify-center px-4 bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#0e0d10] dark:text-[#f5f5f7]'
export const cardClass =
  'w-full max-w-sm flex flex-col gap-3 rounded-3xl bg-white dark:bg-[#1c1c1e] p-8 shadow-sm'
export const inputClass =
  'rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] px-4 py-3 outline-none ring-2 ring-transparent focus:ring-[#b45f06] dark:focus:ring-[#f0a13b]'
export const buttonClass =
  'rounded-xl bg-[#b45f06] dark:bg-[#f0a13b] text-white dark:text-[#1d1d1f] py-3 font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50'

export interface AuthFile {
  hash: string
  adminHash: string
}

export function fetchAuth(): Promise<AuthFile> {
  return fetch(`${import.meta.env.BASE_URL}auth.json`, {
    cache: 'no-store',
  }).then((res) => res.json())
}

export function Gate({
  children,
  admin = false,
}: {
  children: ReactNode
  admin?: boolean
}) {
  const [hash, setHash] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    fetchAuth().then((data) => {
      const h = admin ? data.adminHash : data.hash
      setHash(h)
      if (!admin && localStorage.getItem(AUTH_KEY) === h) setUnlocked(true)
    })
  }, [admin])

  if (unlocked) return children
  if (!hash) return null

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = await sha256(
      String(new FormData(e.currentTarget).get('password')),
    )
    if (input === hash) {
      if (!admin) localStorage.setItem(AUTH_KEY, input)
      setUnlocked(true)
    } else {
      setWrong(true)
    }
  }

  return (
    <div className={pageClass}>
      <form onSubmit={onSubmit} className={cardClass}>
        <div className="mx-auto mb-2 w-14 h-14 rounded-2xl bg-[#b45f06] dark:bg-[#f0a13b] flex items-center justify-center text-white dark:text-[#1d1d1f]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-center">
          {admin ? '관리자 비밀번호' : '비밀번호를 입력하세요'}
        </h1>
        <input
          name="password"
          type="password"
          autoFocus
          placeholder="비밀번호"
          className={`mt-2 ${inputClass}`}
        />
        {wrong && (
          <p className="text-sm text-red-600 dark:text-red-400">
            비밀번호가 틀렸습니다.
          </p>
        )}
        <button type="submit" className={buttonClass}>
          입장
        </button>
      </form>
    </div>
  )
}
