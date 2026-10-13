import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent, type MouseEvent } from 'react'
import { AUTH_FILE_PATH, buttonClass, inputClass, sha256 } from '../auth'

export const Route = createFileRoute('/admin')({
  component: Admin,
})

const REPO_API = 'https://api.github.com/repos/bossxor/works-dashboard'
const CONTENTS_URL = `${REPO_API}/contents/${AUTH_FILE_PATH}`
const DISPATCH_URL = `${REPO_API}/actions/workflows/pages.yml/dispatches`

function Admin() {
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onRedeploy(e: MouseEvent<HTMLButtonElement>) {
    const token = String(new FormData(e.currentTarget.form!).get('token'))
    setBusy(true)
    setStatus(null)
    try {
      const res = await fetch(DISPATCH_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ref: 'main' }),
      })
      if (!res.ok) throw new Error(`갱신 요청 실패 (${res.status})`)
      setStatus('갱신 시작. 1~2분 뒤 반영됩니다.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const password = String(form.get('password'))
    const confirm = String(form.get('confirm'))
    const token = String(form.get('token'))
    if (!password || password !== confirm) {
      setStatus('새 비밀번호가 비어있거나 확인과 다릅니다.')
      return
    }

    setBusy(true)
    setStatus(null)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const current = await fetch(CONTENTS_URL, { headers })
      if (!current.ok) throw new Error(`파일 조회 실패 (${current.status})`)
      const { sha } = await current.json()

      const content = btoa(`{ "hash": "${await sha256(password)}" }\n`)
      const res = await fetch(CONTENTS_URL, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ message: 'chore: change password', content, sha }),
      })
      if (!res.ok) throw new Error(`커밋 실패 (${res.status})`)
      setStatus('변경 완료. 배포가 끝나면(1~2분) 반영됩니다.')
      formEl.reset()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3ec] text-[#1a1917] dark:bg-[#0e0d10] dark:text-[#ede9e3]">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-72">
        <h1 className="text-lg font-bold"># 관리자</h1>
        <input name="token" type="password" placeholder="GitHub 토큰 (Contents·Actions 쓰기)" className={inputClass} />
        <button type="button" onClick={onRedeploy} disabled={busy} className={buttonClass}>
          저장소 목록 지금 갱신
        </button>
        <h2 className="mt-4 text-sm font-bold">비밀번호 변경</h2>
        <input name="password" type="password" placeholder="새 비밀번호" className={inputClass} />
        <input name="confirm" type="password" placeholder="새 비밀번호 확인" className={inputClass} />
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? '처리 중...' : '비밀번호 변경'}
        </button>
        {status && <p className="text-xs">{status}</p>}
        <Link to="/" className="text-xs text-[#6b6660] dark:text-[#9a968f] hover:underline">
          ← 대시보드로
        </Link>
      </form>
    </div>
  )
}
