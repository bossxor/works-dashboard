# GitHub 프로젝트 대시보드

여러 곳에서 개발한 GitHub 프로젝트를 한곳에서 모아 볼 수 있는 대시보드입니다. GitHub 사용자명 또는
조직명을 입력하면 해당 계정의 모든 public 저장소를 불러와서 다음 세 가지로 구분해 보여줍니다.

- **APK 다운로드** — 최신 GitHub Release에 `.apk` 파일이 첨부된 저장소. 바로 다운로드 링크 제공.
- **웹앱** — 저장소의 homepage(웹사이트 URL)가 설정된 저장소. 새 탭에서 바로 실행.
- **GitHub 전체 저장소** — 불러온 모든 public 저장소 목록.

## 기술 스택

- [TanStack Start](https://tanstack.com/start) (React 19 기반 풀스택 프레임워크)
- TanStack Router
- Tailwind CSS 4
- lucide-react 아이콘
- GitHub REST API (브라우저에서 직접 호출, 별도 백엔드/DB 없음)

## 로컬 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 뜨면 브라우저에서 열리는 페이지 상단 입력창에 GitHub 사용자명 또는 조직명(예:
`octocat`)을 입력하고 "불러오기"를 누르면 저장소 목록이 표시됩니다. 입력한 사용자명은
브라우저 localStorage에 저장되어 다음 방문 시 자동으로 불러옵니다.

> GitHub API는 비로그인 상태로 호출되며 IP당 시간 60회 요청 제한이 있습니다. 저장소가 매우 많은
> 계정이라면 일부 요청이 제한될 수 있습니다.

## 배포

Netlify에 배포되며, 별도의 환경 변수나 데이터베이스 설정이 필요하지 않습니다.
