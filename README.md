# AI Portfolio Archive

Next.js로 만든 포트폴리오 웹입니다. 로그인과 회원가입이 있고, 사용자는 자기 관리자 화면만 볼 수 있습니다.

## 실행

```bash
npm install
npm.cmd run dev
```

브라우저에서 `http://127.0.0.1:3000` 또는 `http://localhost:3000`을 엽니다.

## 꼬임 방지

- `npm.cmd run dev`: 개발 서버 전용 `.next-dev` 캐시를 씁니다.
- `npm.cmd run build`: 배포 빌드 전용 `.next` 캐시를 씁니다.
- `npm.cmd run clean`: 캐시와 dev 로그를 지웁니다.

예전처럼 dev 서버와 build가 같은 `.next` 폴더를 같이 쓰면 Windows + OneDrive + 한글 경로에서 캐시가 깨질 수 있습니다. 이제 두 캐시를 분리해서 그 문제를 줄였습니다.

## 기본 로그인

- 사용자 A: `green1234`
- 사용자 B: `white1234`
- 새 계정은 `/signup`에서 만들 수 있습니다.

배포할 때는 Vercel 환경 변수에서 꼭 비밀번호를 바꾸세요.

```bash
PORTFOLIO_USER_1_ID=user-a
PORTFOLIO_USER_1_NAME=사용자 A
PORTFOLIO_USER_1_PASSWORD=새비밀번호

PORTFOLIO_USER_2_ID=user-b
PORTFOLIO_USER_2_NAME=사용자 B
PORTFOLIO_USER_2_PASSWORD=새비밀번호
```

## Vercel 배포

1. GitHub에 이 프로젝트를 올립니다.
2. Vercel에서 저장소를 Import 합니다.
3. Framework는 Next.js로 둡니다.
4. 위 로그인 환경 변수와 Supabase 환경 변수를 필요에 맞게 넣습니다.

## Supabase

Supabase를 쓸 경우 `supabase-schema.sql`을 SQL Editor에서 실행합니다. `owner_id`가 사용자별 데이터 분리에 사용됩니다.
