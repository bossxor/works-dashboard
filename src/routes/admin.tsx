import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import {
  AUTH_FILE_PATH,
  Gate,
  buttonClass,
  fetchAuth,
  inputClass,
  sha256,
} from '../auth'

export const Route = createFileRoute('/admin')({
  component: () => (
    <Gate admin>
      <Admin />
    </Gate>
  ),
})

const REPO_URL = 'https://github.com/bossxor/works-dashboard'

function Admin() {
  const [status, setStatus] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    if (!password || password !== form.get('confirm')) {
      setStatus('새 비밀번호가 비어있거나 확인과 다릅니다.')
      return
    }
    const { adminHash } = await fetchAuth()
    const hash = await sha256(password)
    await navigator.clipboard.writeText(
      `${JSON.stringify({ hash, adminHash }, null, 2)}\n`,
    )
    window.open(`${REPO_URL}/edit/main/${AUTH_FILE_PATH}`, '_blank')
    setStatus(
      '새 내용이 복사됐습니다. 열린 GitHub 화면에서 기존 내용을 지우고 붙여넣은 뒤 Commit changes를 누르세요. 1~2분 뒤 반영됩니다.',
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3ec] text-[#1a1917] dark:bg-[#0e0d10] dark:text-[#ede9e3]">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-72">
        <h1 className="text-lg font-bold"># 관리자</h1>
        <a
          href={`${REPO_URL}/actions/workflows/pages.yml`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} text-center`}
        >
          저장소 목록 갱신
        </a>
        <p className="text-xs text-[#6b6660] dark:text-[#9a968f]">
          열린 GitHub 화면에서 Run workflow → Run workflow 클릭
        </p>
        <h2 className="mt-4 text-sm font-bold">비밀번호 변경</h2>
        <input name="password" type="password" placeholder="새 비밀번호" className={inputClass} />
        <input name="confirm" type="password" placeholder="새 비밀번호 확인" className={inputClass} />
        <button type="submit" className={buttonClass}>
          비밀번호 변경
        </button>
        {status && <p className="text-xs">{status}</p>}
        <Link to="/" className="text-xs text-[#6b6660] dark:text-[#9a968f] hover:underline">
          ← 대시보드로
        </Link>
      </form>
    </div>
  )
}
