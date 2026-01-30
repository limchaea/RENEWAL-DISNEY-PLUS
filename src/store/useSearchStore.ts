import { create } from 'zustand';
import { movieData as disney } from '../api/data';
import type { LocalContentItem } from '../types/IContentTypes';

type SearchFilter =
  | { type: 'genre'; genreId: number | number[]; value: string }
  | { type: 'country' | 'region'; value: string | string[] };

interface SearchState {
  searchResults: LocalContentItem[];
  searchWord: string;
  selectedFilter: SearchFilter | null;
  setSelectedFilter: (filter: SearchFilter) => void;
  clearSelectedFilter: () => void;
  setSearchWord: (keyword: string) => void;
  clearSearch: () => void;
  onSearch: (keyword: string) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchResults: [],
  searchWord: '',
  selectedFilter: null,

  setSelectedFilter: (filter) => {
    // 1. 상태 업데이트 (필터 저장 및 검색창 텍스트 설정)
    set({
      selectedFilter: filter,
      searchWord: typeof filter.value === 'string' ? filter.value : '',
    });

    // 2. 즉시 검색 실행 (필터가 설정된 직후의 상태로 검색)
    get().onSearch(get().searchWord);
  },

  clearSelectedFilter: () => {
    set({ selectedFilter: null });
    get().onSearch(get().searchWord);
  },

  setSearchWord: (keyword) => set({ searchWord: keyword }),

  clearSearch: () => set({ searchWord: '', searchResults: [], selectedFilter: null }),

  onSearch: (keyword) => {
    const currentFilter = get().selectedFilter;
    set({ searchWord: keyword });

    if (!keyword.trim() && !currentFilter) {
      set({ searchResults: [] });
      return;
    }

    const results = disney.filter((item) => {
      /* ---------- A. 텍스트 매칭 ---------- */
      const isMovie = item.category === 'movie';
      const title = (isMovie ? (item as any).title : (item as any).name) || '';
      const keywordLower = keyword.toLowerCase();

      // 필터명이 검색창에 입력되어 있을 때는 텍스트 검색을 무시함 (검색 결과가 0이 되는 것 방지)
      const isFilterTitle = currentFilter && keyword === (currentFilter as any).value;

      const textMatch =
        keyword.trim() && !isFilterTitle
          ? title.toLowerCase().includes(keywordLower) ||
            item.genre_title?.some((g) => g.toLowerCase().includes(keywordLower))
          : true;

      /* ---------- B. 필터 매칭 ---------- */
      let filterMatch = true;

      if (currentFilter) {
        // 1. 장르 필터 (SF & 판타지: [878, 14] 대응)
        if (currentFilter.type === 'genre') {
          const targetIds = currentFilter.genreId;
          const itemGenres = item.genre_ids || [];

          if (Array.isArray(targetIds)) {
            // 필터 ID 배열(SF, 판타지) 중 하나라도 영화의 장르 배열에 있으면 포함
            filterMatch = targetIds.some((id) => itemGenres.includes(id));
          } else {
            filterMatch = itemGenres.includes(targetIds);
          }
        }
      }

      return textMatch && filterMatch;
    });

    set({ searchResults: results.slice(0, 100) });
  },
}));
