import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

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

export const inputClass =
  'rounded border border-[#ddd8cc] dark:border-[#2a282e] bg-white dark:bg-[#17161a] px-3 py-2 text-sm outline-none focus:border-[#b45f06] dark:focus:border-[#f0a13b]'
export const buttonClass =
  'rounded bg-[#b45f06] dark:bg-[#f0a13b] text-white dark:text-[#0e0d10] py-2 text-sm font-semibold disabled:opacity-50'

export function Gate({ children }: { children: ReactNode }) {
  const [hash, setHash] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}auth.json`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { hash: string }) => {
        setHash(data.hash)
        if (localStorage.getItem(AUTH_KEY) === data.hash) setUnlocked(true)
      })
  }, [])

  if (unlocked) return children
  if (!hash) return null

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = await sha256(
      String(new FormData(e.currentTarget).get('password')),
    )
    if (input === hash) {
      localStorage.setItem(AUTH_KEY, input)
      setUnlocked(true)
    } else {
      setWrong(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3ec] text-[#1a1917] dark:bg-[#0e0d10] dark:text-[#ede9e3]">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-64">
        <label className="text-sm text-[#b45f06] dark:text-[#f0a13b]">
          $ password:
        </label>
        <input name="password" type="password" autoFocus className={inputClass} />
        {wrong && (
          <p className="text-xs text-red-600 dark:text-red-400">
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
