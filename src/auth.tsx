import { useEffect, useState, type ReactNode } from 'react'
import { Delete, Lock } from 'lucide-react'

export const AUTH_FILE_PATH = 'public/auth.json'
export const PIN_LENGTH = 4
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
  const [pin, setPin] = useState('')

  useEffect(() => {
    fetchAuth().then((data) => {
      const h = admin ? data.adminHash : data.hash
      setHash(h)
      if (!admin && sessionStorage.getItem(AUTH_KEY) === h) setUnlocked(true)
    })
  }, [admin])

  useEffect(() => {
    if (pin.length !== PIN_LENGTH || !hash) return
    sha256(pin).then((input) => {
      if (input === hash) {
        if (!admin) sessionStorage.setItem(AUTH_KEY, input)
        setUnlocked(true)
      } else {
        setWrong(true)
        setPin('')
      }
    })
  }, [pin, hash, admin])

  function press(key: string) {
    setWrong(false)
    setPin((p) =>
      key === 'back' ? p.slice(0, -1) : p.length < PIN_LENGTH ? p + key : p,
    )
  }

  useEffect(() => {
    if (unlocked) return
    function onKey(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('back')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlocked])

  if (unlocked) return children
  if (!hash) return null

  const keyClass =
    'w-16 h-16 rounded-full text-2xl font-semibold flex items-center justify-center bg-[#f5f5f7] dark:bg-[#2c2c2e] active:bg-black/15 dark:active:bg-white/20 transition-colors'

  return (
    <div className={pageClass}>
      <div className={`${cardClass} items-center`}>
        <div className="mb-2 w-14 h-14 rounded-2xl bg-[#b45f06] dark:bg-[#f0a13b] flex items-center justify-center text-white dark:text-[#1d1d1f]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold">
          {admin ? '관리자 비밀번호' : '비밀번호를 입력하세요'}
        </h1>
        <div className="my-4 flex gap-4">
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 ${
                wrong
                  ? 'border-red-500'
                  : i < pin.length
                    ? 'border-[#b45f06] bg-[#b45f06] dark:border-[#f0a13b] dark:bg-[#f0a13b]'
                    : 'border-[#c7c7cc] dark:border-[#48484a]'
              }`}
            />
          ))}
        </div>
        <p className="h-5 text-sm text-red-600 dark:text-red-400">
          {wrong && '비밀번호가 틀렸습니다.'}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)} className={keyClass}>
              {d}
            </button>
          ))}
          <span />
          <button type="button" onClick={() => press('0')} className={keyClass}>
            0
          </button>
          <button
            type="button"
            onClick={() => press('back')}
            aria-label="지우기"
            className="w-16 h-16 flex items-center justify-center text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
