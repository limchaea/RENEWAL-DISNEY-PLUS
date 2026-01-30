// types/LocalContentTypes.ts

interface BaseContent {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_title: string[];
  age: number;
}

export interface LocalMovieItem extends BaseContent {
  category: 'movie';
  original_title: string;
  title: string;
  release_date?: string; // 여기에 오타가 없는지 확인!
  media_type: 'movie';
}

export interface LocalSeriesItem extends BaseContent {
  category: 'series';
  original_name: string;
  name: string;
  origin_country: string[];
  first_air_date?: string;
  media_type: 'tv';
}

export type LocalContentItem = LocalMovieItem | LocalSeriesItem;
