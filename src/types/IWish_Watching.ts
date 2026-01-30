// movie & tv 공통 타입
export interface MediaBase {
  id: number;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  adult: boolean;
  logo: string;
  cAge: string;
  title?: string;
  name?: string;
}

// 플레이 리스트 타입
export interface WatchingItem {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path?: string;
  backdrop_path?: string;
  title?: string;
  name?: string;
  progress?: number;
  currentTime?: number;
  duration?: number;
  updateAt?: number;
}

// 찜목록 타입
export interface WishItem {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path: string;
  backdrop_path?: string;
  title?: string; // movie
  name?: string; // tv
}
