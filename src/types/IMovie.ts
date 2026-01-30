import type { Video } from "./ITV";

export interface MediaBase {
  id: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  adult: boolean;
  genre_ids: number[];
}

export interface title {
  title: string | number;
}

//TODO  Movie
// title이 movie랑 tv 네임이 다름
export interface Movie extends MediaBase {
  title: string;
  logo: string;
  genreNames: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Theme extends MediaBase {
  title: string;
  name: string;
  genreNames: string[];
}

//TODO 시즌 타입
export interface SeasonData {
  title: string;
  id: number;
  keywordId?: string;
  genreId?: string;
  startDate: string;
  endDate: string;
  poster_path: string;
  type: 'keyword' | 'genre';
}

export interface MovieState {
  movies: Movie[];
  themeMovies: Movie[];
  seasonMovies: SeasonData[];
  genres: Genre[];
  category: Record<string, Movie[]>;
  isLoading: boolean;
  Top: Movie[];
  Latest: Movie[];
  onFetchTOP: () => Promise<void>;
  onFetchUpcoming: () => Promise<void>;
  onfetchLatest: () => Promise<void>;
  onFetchGenres: () => Promise<[]>;
  getGenreMap: () => Promise<Record<number, string>>;
  onfetchSeason: (seasonData: SeasonData) => Promise<void>;
  onfetchTheme: (companyId: string) => Promise<Theme[] | void>;
  onfetchCate: (genreId: string | number) => Promise<Movie[] | void>;
  onFetchVideo: (id: number) => Promise<Video[]>;
}
