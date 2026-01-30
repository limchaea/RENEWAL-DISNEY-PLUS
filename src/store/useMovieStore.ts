import { create } from 'zustand';
import type { Movie, MovieState, SeasonData } from '../types/IMovie';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// =========================
// 연도 계산 (그대로 유지)
const createFullDateString = (dateString: string, isEnd = false): string => {
  const [month, day] = dateString.split('-').map(Number);
  let nowYear = new Date().getFullYear();
  const nowMonth = new Date().getMonth() + 1;

  if (nowMonth < 3 && month > 10 && month > nowMonth && !isEnd) {
    nowYear -= 1;
  }

  return `${nowYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// =========================
//  Store
export const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  themeMovies: [],
  seasonMovies: [],
  genres: [],
  category: {},
  Top: [],
  isLoading: false,
  Latest: [],

  // =========================
  // TODO 장르
  onFetchGenres: async () => {
    const res = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=ko`
    );
    const data = await res.json();
    set({ genres: data.genres });
    // console.log('onFetchGenres 타입 확인', data.genres);
    return data.genres;
  },
  //TODO 장르 한글 맴
  getGenreMap: async () => {
    let genres = get().genres;
    if (genres.length === 0) {
      genres = await get().onFetchGenres();
    }

    // console.log('genres 타입 확인', genres);
    return genres.reduce((acc, cur) => {
      acc[cur.id] = cur.name;
      return acc;
    }, {} as Record<number, string>);
  },
  // TODO 곧 개봉
  onFetchUpcoming: async () => {
    const genreMap = await get().getGenreMap();

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await res.json();

    const extra = await Promise.all(
      data.results.map(async (movie: Movie) => {
        const logoRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${API_KEY}`
        );
        const logoData = await logoRes.json();

        return {
          ...movie,
          logo: logoData.logos?.[0]?.file_path || 'none',
          genreNames: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean),
        };
      })
    );

    set({ movies: extra });
  },
  //TODO TOP10
  onFetchTOP: async () => {
    const genreMap = await get().getGenreMap();
    const resTOP = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await resTOP.json();
    const dataTOP = data.results;

    const TopMOV = dataTOP.map((mov: Movie) => {
      const genreNames = (mov.genre_ids || [])
        .map((id: number) => genreMap[id])
        .filter((name: string): name is string => !!name);
      return { ...mov, genreNames };
    });

    set({ Top: TopMOV });
  },

  //TODO 최신개봉작
  onfetchLatest: async () => {
    const resLatest = await fetch(
      `https://api.themoviedb.org/3/tv/airing_today?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await resLatest.json();
    const dataLatest = data.results;

    set({ Latest: dataLatest });

    console.log('dataLatest', data);
  },
  // TODO 카테고리
  onfetchCate: async (genreId) => {
    if (get().category[genreId]) return;

    const genreMap = await get().getGenreMap();
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko&with_genres=${genreId}`
    );
    const data = await res.json();

    const mapped = data.results.map((mov: Movie) => ({
      ...mov,
      genreNames: mov.genre_ids?.map((id) => genreMap[id]).filter(Boolean),
    }));

    set((state) => ({
      category: {
        ...state.category,
        [genreId]: mapped,
      },
    }));
  },
  // TODO 테마 (ThemeList 전용)
  onfetchTheme: async (companyId: string) => {
    set({ isLoading: true });
    try {
      const genreMap = await get().getGenreMap();
      const [tvRes, movieRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko-KR&with_watch_providers=${companyId}&watch_region=KR`
        ),
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko-KR&with_companies=${companyId}&watch_region=KR`
        ),
      ]);

      const tv = await tvRes.json();
      const movie = await movieRes.json();
      const merged = [...tv.results, ...movie.results].map((mov: Movie) => ({
        ...mov,
        genreNames: mov.genre_ids?.map((id) => genreMap[id]).filter(Boolean),
      }));
      //  theme  → themeMovies
      set({ themeMovies: merged });
    } finally {
      set({ isLoading: false });
    }
  },
  // TODO 시즌 (다른 컴포넌트용)
  onfetchSeason: async (seasonData: SeasonData) => {
    const genreMap = await get().getGenreMap();
    let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko-KR`;
    console.log('기본', apiUrl);
    const aa = await fetch(apiUrl);
    const dd = await aa.json();
    console.log('가공', dd.results);

    if (seasonData.genreId) {
      apiUrl += `&with_genres=${seasonData.genreId}`;
    }

    console.log('수정후', apiUrl);

    if (seasonData.title === 'classic') {
      apiUrl += `&primary_release_year.lte=1980`;
      apiUrl += `&sort_by=vote_average.desc`;
      apiUrl += `&vote_count.gte=500`;
    } else {
      // =========================
      //  시즌 날짜 필터
      // 시즌 시작일을 YYYY-MM-DD로 변환
      const startDate = createFullDateString(seasonData.startDate, false);
      // 시즌 종료일을 YYYY-MM-DD로 변환
      const endDate = createFullDateString(seasonData.endDate, true);

      // 파라미터   의미
      // TMDB에서 날짜 필터
      // primary_release_date.gte 날짜 이후 개봉
      apiUrl += `&primary_release_date.gte=${startDate}`;
      // primary_release_date.lte 날짜 이전 개봉
      apiUrl += `&primary_release_date.lte=${endDate}`;
      apiUrl += `&sort_by=popularity.desc`;
    }

    const res = await fetch(apiUrl);
    const data = await res.json();
    console.log('수정후 가공', data);

    const mapped = data.results.map((mov: Movie) => ({
      ...mov,
      genreNames: mov.genre_ids?.map((id) => genreMap[id]).filter(Boolean),
    }));
    console.log('시즌안 장르', genreMap);
    console.log('시즌', seasonData, mapped);
    //  theme  → seasonMovies
    set({ seasonMovies: mapped });
  },

  // 영화의 예고편을 가져올 메서드
  // TODO movie_id 자리에 매개값으로 받아온 ${id}를 넣고, ?뒤에 api 키값 & 추가하기
  // `https://api.themoviedb.org/3/movie/movie_id/videos?language=en-US`
  onFetchVideo: async (id) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
      );

      // 응답이 성공적이지 않을 경우 빈 배열 반환
      if (!res.ok) return [];

      const data = await res.json();

      // 데이터가 없거나 results가 없으면 빈 배열 반환
      const videos = data.results || [];

      set({ videos: videos });
      return videos;
    } catch (error) {
      console.error('비디오 페칭 에러:', error);
      return []; // 에러 발생 시 빈 배열 반환하여 .find() 에러 방지
    }
  },
}));
