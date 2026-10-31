# Disney+ 리뉴얼 프로젝트

React와 TypeScript로 Disney+ 콘텐츠 탐색 및 프로필 경험을 구현한 웹 리뉴얼 프로젝트입니다. Firebase Authentication 기반 로그인과 Firestore 사용자 데이터, Zustand 전역 상태 관리에 중점을 두었습니다.

## 목차

- [Project Overview](#project-overview)
- [Project Goals](#project-goals)
- [Project Info](#project-info)
- [Tech Stack](#tech-stack)
- [Main Features](#main-features)
- [Development](#development)
- [Authentication](#authentication)
- [Data Management](#data-management)
- [Troubleshooting](#troubleshooting)
- [Retrospective](#retrospective)
- [Preview](#preview)
- [Run Locally](#run-locally)
- [Links](#links)

## Project Overview

영화와 시리즈를 탐색하고 프로필에 따라 콘텐츠를 이용하는 Disney+ 웹 경험을 구현했습니다. 이메일·비밀번호 및 Google 로그인, 프로필 선택, Kids Mode, 위시리스트와 이어보기 기능을 제공합니다.

이번 리뉴얼에서 중점을 둔 부분은 사용자 인증과 데이터 관리입니다. TypeScript로 인증 사용자와 콘텐츠 데이터 형태를 정의하고, Firebase와 Zustand를 연결해 로그인 상태 및 프로필별 콘텐츠 목록을 관리합니다.

## Project Goals

- 콘텐츠 탐색부터 프로필 선택까지 주요 Disney+ 사용 흐름을 웹 화면으로 구성
- 이메일 및 Google 인증으로 로그인 흐름 구현
- 사용자와 활성 프로필을 기준으로 위시리스트 및 이어보기 데이터 분리
- Kids 프로필의 연령 제한을 적용해 연령에 맞는 콘텐츠 제공
- TypeScript 타입을 사용해 사용자·영화·시리즈 데이터 처리의 명확성 향상

## Project Info

| 항목 | 내용 |
| --- | --- |
| 프로젝트 유형 | Disney+ 웹 리뉴얼 |
| 진행 기간 | 확인 필요 |
| 담당 역할 | 확인 필요 |
| 참여 인원 | 확인 필요 |

## Tech Stack

| 분야 | 기술 |
| --- | --- |
| UI | React 19, TypeScript |
| 라우팅 | React Router |
| 스타일 | SCSS, CSS |
| 전역 상태 | Zustand |
| 인증 및 데이터 | Firebase Authentication, Cloud Firestore |
| 콘텐츠 데이터 | TMDB API, 로컬 JSON |
| 개발 및 빌드 | Vite |

## Main Features

- 이메일/비밀번호 회원가입 및 로그인
- Google 팝업 로그인
- 로그인 세션 복원
- 기본 프로필 생성, 프로필 추가·수정·선택
- Kids 프로필 및 생년월일 기준 콘텐츠 연령 제한
- 영화·시리즈 탐색, 검색, 상세 및 재생 화면
- 활성 프로필별 위시리스트
- 활성 프로필별 시청 중인 콘텐츠와 재생 정보

## Development

### TypeScript 타입 정의

TypeScript는 사용자 정보, 콘텐츠 종류에 따라 달라지는 데이터 형태, 스토어 상태와 액션을 코드에서 명시하고 관리하기 위해 사용합니다.

- `src/types/IAuth.ts`: Firebase 사용자 부가 정보와 Kids Mode 타입
- `src/types/IMovie.ts`, `src/types/ITV.ts`: 영화·시리즈 및 상세 데이터 타입
- `src/types/IContentTypes.ts`: API 로컬 콘텐츠 타입
- `src/types/IWish_Watching.ts`: 위시리스트와 시청 기록 타입

영화와 시리즈는 제목 필드 등 데이터 구조가 달라 각각의 타입을 사용하고, 저장되는 공통 목록은 `media_type: 'movie' | 'tv'`로 구분합니다.

### Zustand 상태 관리

기능별 스토어에서 인증, 프로필, 위시리스트, 이어보기, 콘텐츠 데이터를 관리합니다. 사용자 로그인 시 프로필 상태를 초기화하고, 선택한 활성 프로필 ID를 콘텐츠 데이터 요청에 사용합니다.

## Authentication

Firebase Authentication을 통해 이메일/비밀번호 가입 및 로그인을 구현했습니다. Google 로그인은 `GoogleAuthProvider`와 팝업 인증을 사용합니다. 이메일 로그인 과정에서는 `browserLocalPersistence`를 설정하며, 앱 시작 시 `onAuthStateChanged`로 기존 로그인 세션을 확인합니다.

계정의 부가 정보는 Firestore `users/{uid}` 문서에서 가져옵니다. Google 로그인으로 처음 가입한 경우 이름·이메일·프로필 이미지 정보를 사용자 문서에 생성합니다.

## Data Management

위시리스트와 시청 기록은 Firebase UID와 활성 프로필 ID를 포함한 Firestore 경로에 저장합니다.

```text
users/{uid}
├── 사용자 정보
│   ├── email, name, nickname 등
│   └── kidsMode: { isActive, year, month, date }
└── profiles/{profileId}
    ├── wishlist/{mediaType}-{contentId}
    └── playlist/{mediaType}-{contentId}
```

- `wishlist`: 콘텐츠 ID, `media_type`, 제목, 포스터 경로, 저장 시각
- `playlist`: 콘텐츠 ID, `media_type`, 재생 위치, 길이, 갱신 시각 등
- 문서 ID는 `movie-콘텐츠ID` 또는 `tv-콘텐츠ID` 형식

프로필 목록과 활성 프로필은 현재 Firestore가 아닌 브라우저 `localStorage`에 사용자별로 저장합니다. 저장 키는 `profile-storage-{uid}`입니다.

### 타입 정의 예시

```ts
export interface WishItem {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path: string;
  backdrop_path?: string;
  title?: string;
  name?: string;
}

export interface WatchingItem {
  id: number;
  media_type: 'movie' | 'tv';
  currentTime?: number;
  duration?: number;
  updateAt?: number;
}
```

### Kids Mode 연령 제한

`calculateAgeLimit`은 생년월일을 기준으로 만 나이를 계산하고, 0·5·7·12세 콘텐츠 제한값으로 변환합니다. 키즈 콘텐츠 스토어는 활성 프로필의 제한값을 기준으로 TMDB 연령 등급을 필터링하고, 키즈 모드에서 등급을 확인할 수 없는 콘텐츠는 제외합니다.

## Troubleshooting

### 새로고침 후 로그인 상태 복원

Firebase Auth의 로컬 지속성과 `onAuthStateChanged` 초기화를 사용해 저장된 인증 세션을 불러옵니다. 사용자 UID로 Firestore 사용자 정보를 다시 읽고 프로필 상태를 초기화합니다.

### 사용자별 콘텐츠 데이터 분리

위시리스트와 이어보기의 Firestore 참조를 `users/{uid}/profiles/{profileId}` 아래에 생성합니다. 프로필 전환 시 활성 프로필 ID를 바탕으로 해당 프로필의 컬렉션을 조회합니다.

### 콘텐츠 종류 표준화

콘텐츠 입력에서 `series`, `tv`, `movie`처럼 서로 다른 값이 들어올 수 있어 저장 전에 `movie` 또는 `tv` 형식으로 정규화하고 문서 ID에도 같은 값을 사용합니다.

> 위 항목은 코드에서 확인되는 처리 방식입니다. 실제 개발 중 발생한 타입 오류나 동기화 이슈의 원인·해결 기록은 별도 작업 기록이 없어 추가 확인이 필요합니다.

## Retrospective

코드에서 확인할 수 있는 회고 초안입니다. 실제 개발 경험에 맞게 보완해 주세요.

- **TypeScript 활용:** 사용자·콘텐츠·스토어 데이터의 형태를 코드에 드러내면서 여러 데이터 흐름을 명시적으로 다루는 기반을 마련했습니다.
- **개선점:** 일부 스토어 액션은 `any`를 사용하고 있어 콘텐츠 입력 타입을 공통 타입 또는 판별 유니온으로 정리하면 타입 안정성을 높일 수 있습니다.
- **개선점:** 프로필은 `localStorage`, 위시리스트와 시청 기록은 Firestore를 사용합니다. 기기 간 프로필 동기화가 필요하다면 프로필 데이터 저장 위치를 통합하는 방안을 검토할 수 있습니다.

## Preview

현재 저장소에서 README에 넣을 화면 캡처를 찾지 못해 이미지 슬롯만 마련했습니다. 캡처 파일을 `docs/images/`에 추가한 뒤 경로를 연결해 주세요.

| 화면 | 이미지 |
| --- | --- |
| 메인 페이지 | 준비 중 |
| 로그인 및 Google 로그인 | 준비 중 |
| 프로필 선택 | 준비 중 |
| Kids Mode | 준비 중 |
| 위시리스트 | 준비 중 |
| Firestore 구조 및 타입 정의 | 위 구조와 예시 코드 참고 |

## Run Locally

```bash
npm install
npm run dev
```

프로젝트 루트의 `.env`에 Firebase 환경 변수를 설정합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TMDB_API_KEY=
```

`.env` 파일은 Git에서 제외됩니다. 사용 가능한 스크립트는 `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`입니다.

## Links

- 배포 URL: 확인 필요
- GitHub Repository: 확인 필요
