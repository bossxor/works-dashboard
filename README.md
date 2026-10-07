# GitHub 프로젝트 대시보드

`bossxor` 계정의 public 저장소를 한곳에서 모아 볼 수 있는 대시보드입니다.

**사이트:** https://bossxor.github.io/works-dashboard/

저장소를 다음 네 가지로 구분해 보여주며, 각 섹션은 접고 펼칠 수 있습니다.

- **APK 다운로드** — 최신 GitHub Release에 `.apk` 파일이 있는 저장소. APK 다운로드만 표시.
- **웹앱** — homepage가 설정됐거나 GitHub Pages가 켜진 저장소. 웹앱 열기만 표시.
- **PC 툴** — 최신 Release에 `.exe` / `.msi` / `.zip` 파일이 있는 저장소. PC 파일 다운로드만 표시.
- **GitHub 전체 저장소** — 모든 public 저장소. 위 버튼이 모두 표시됨.

보관(archived)된 저장소와 이 대시보드 저장소(`works-dashboard`)는 목록에서 제외됩니다.

## 기술 스택

- [TanStack Start](https://tanstack.com/start) (React 19), TanStack Router
- Tailwind CSS 4, lucide-react 아이콘
- GitHub REST API (브라우저에서 직접 호출, 별도 백엔드/DB 없음)

## 로컬 실행 방법

```bash
pnpm install
pnpm dev
```

> GitHub API는 비로그인 상태로 호출되며 IP당 시간 60회 요청 제한이 있습니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions(`.github/workflows/pages.yml`)가 정적 사이트로 빌드해
GitHub Pages에 자동 배포합니다. 별도의 환경 변수나 데이터베이스 설정은 필요 없습니다.
