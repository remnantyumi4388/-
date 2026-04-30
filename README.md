# AI Portfolio Archive

Next.js 포트폴리오 관리 웹입니다. 회원가입, 로그인, 사용자별 기록 관리, 기록 추가/수정/삭제, 상세 페이지를 지원합니다.

## 실행

```bash
npm install
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 기능

- 회원가입으로 사용자 계속 추가 가능
- 로그인한 사용자 이름 표시
- 사용자별 프로젝트/활동/수상/연구 분리
- 관리자에서 기록 추가, 수정, 삭제
- 공개 기록은 목록과 상세 페이지에서 확인
- Supabase 설정 전에는 브라우저 임시 저장
- Supabase 설정 후에는 DB 저장

## Supabase 연결

1. Supabase SQL Editor에서 `supabase-schema.sql`을 실행합니다.
2. Vercel 환경 변수에 아래 값을 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용됩니다. 브라우저에 노출하지 마세요.

## 꼬임 방지

- `npm.cmd run dev`: `.next-dev` 사용
- `npm.cmd run build`: `.next` 사용
- `npm.cmd run clean`: 캐시 삭제

개발 서버와 빌드 캐시를 분리해서 Windows, OneDrive, 한글 경로에서 생기던 Next 캐시 꼬임을 줄였습니다.
