import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import {
  AUTH_FILE_PATH,
  Gate,
  buttonClass,
  cardClass,
  fetchAuth,
  inputClass,
  pageClass,
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
    <div className={pageClass}>
      <form onSubmit={onSubmit} className={cardClass}>
        <h1 className="text-2xl font-bold">관리자</h1>

        <h2 className="mt-4 font-bold">앱 목록 갱신</h2>
        <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
          5분마다 자동 갱신됩니다. 바로 갱신하려면 열린 GitHub 화면에서 Run
          workflow를 두 번 누르세요.
        </p>
        <a
          href={`${REPO_URL}/actions/workflows/pages.yml`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          지금 갱신
        </a>

        <h2 className="mt-6 font-bold">입장 비밀번호 변경</h2>
        <input name="password" type="password" placeholder="새 비밀번호" className={inputClass} />
        <input name="confirm" type="password" placeholder="새 비밀번호 확인" className={inputClass} />
        <button type="submit" className={buttonClass}>
          비밀번호 변경
        </button>
        {status && (
          <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{status}</p>
        )}

        <Link
          to="/"
          className="mt-4 text-sm text-center text-[#6e6e73] dark:text-[#a1a1a6] hover:underline"
        >
          ← 앱 목록으로
        </Link>
      </form>
    </div>
  )
}
