# IT 온보딩 프로젝트 (IBK 퇴직연금 관리시스템)

기업 퇴직연금(DC/DB) 통합 관리 대시보드. 로그인 + 대시보드(현황 / 가입자 관리 / 기일 알림 / 서류 양식 / AI 챗봇).

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript, React 19 |
| 스타일 | Tailwind CSS v4 |
| UI | shadcn/ui (Radix UI) |
| 아이콘 | lucide-react |

## 사전 준비

- Node.js 20.9 이상 (Next.js 16 요구)
- npm (lockfile은 `package-lock.json` 하나만 사용)

```bash
node -v   # v20.9.0+
```

## 실행

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm start        # 빌드 결과 실행
```

로그인은 더미. 아무 값이나 입력 → 약 1초 후 `/dashboard` 이동. (실제 인증 미구현)

## 환경 변수

필수 변수 없음. 필요 시 루트에 `.env.local` 생성 (`.gitignore`로 커밋 제외).

```bash
# NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

`@vercel/analytics`는 프로덕션(`NODE_ENV=production`)에서만 동작.

## 폴더 구조

```
it-onboarding-project/
├── app/                      # App Router (폴더 = 라우팅)
│   ├── layout.tsx            # 루트 레이아웃 (메타데이터, 전역 CSS)
│   ├── page.tsx              # "/" 로그인
│   ├── globals.css           # 전역 스타일 + 테마 변수
│   └── dashboard/
│       └── page.tsx          # "/dashboard" 탭 전환 컨테이너
├── components/
│   ├── dashboard/            # 화면별 기능 컴포넌트
│   │   ├── sidebar.tsx           # 좌측 탭 네비게이션
│   │   ├── header.tsx            # 상단 헤더 / 검색 / 챗봇 열기
│   │   ├── overview.tsx          # 현황 대시보드 (DashboardOverview)
│   │   ├── member-management.tsx # 가입자 관리
│   │   ├── deadline-alerts.tsx   # 기일 알림
│   │   ├── document-forms.tsx    # 서류 양식
│   │   └── chatbot.tsx           # AI 챗봇 패널
│   └── ui/                   # shadcn/ui (실사용분만 유지)
│       ├── button.tsx  card.tsx  input.tsx  label.tsx
│       └── select.tsx  dialog.tsx  alert-dialog.tsx
├── lib/
│   ├── utils.ts              # cn() 클래스 병합 유틸
│   └── types.ts              # 공용 타입 (TabType 등)
├── public/                   # 정적 파일 (아이콘)
├── components.json           # shadcn/ui 설정
├── next.config.mjs           # Next.js 설정
├── postcss.config.mjs        # Tailwind v4 PostCSS
└── tsconfig.json             # TS 설정 (별칭 @/* → 루트)
```

화면 흐름:

```
app/page.tsx (로그인)
  └─ app/dashboard/page.tsx
       ├─ Sidebar → activeTab 전환
       ├─ activeTab → overview / members / deadlines / documents 렌더
       └─ Header 챗봇 버튼 → ChatBot 토글
```

## UI 컴포넌트 추가

`components/ui`에는 실사용 컴포넌트만 있음. 새 컴포넌트는 CLI로 추가.

```bash
npx shadcn@latest add <이름>   # 예: npx shadcn@latest add table
```

## 협업 규칙

- 의존성 추가 시 `package-lock.json` 함께 커밋
- 패키지 매니저는 npm으로 통일 (pnpm/yarn 혼용 금지)
- `.next/`, lockfile 외 산출물은 커밋 금지 (`.gitignore` 참고)

## 참고

- `next.config.mjs`의 `typescript.ignoreBuildErrors: true` 때문에 타입 오류가 있어도 빌드됨. 안정화되면 `false`로 변경 권장.
- 로그인/데이터는 더미. 백엔드 연동 시 API 호출 추가 필요.
