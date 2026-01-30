import { useNavigate } from 'react-router-dom';
import './scss/BannerBtn.scss';
import { useWishStore } from '../store/useWishStore';
import { useWatchingStore } from '../store/useWatchingStore';
import { useMemo } from 'react';
import axios from 'axios'; // TMDB 데이터를 가져오기 위해 필요

interface BannerBtnProps {
  id: number;
  type: string;
}

const BannerBtn = ({ id, type }: BannerBtnProps) => {
  const navigate = useNavigate();
  const { wishlist, onToggleWish } = useWishStore();

  // 시청 목록 추가 함수 가져오기
  const { onAddWatching } = useWatchingStore();

  const isWished = useMemo(() => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist, id]);

  const goDetail = () => {
    navigate(`/play/${type}/${id}`);
  };

  // 재생 버튼 클릭 시 Watching 스토어에 저장하는 로직
  const goPlay = async () => {
    try {
      // 1. TMDB API를 통해 해당 콘텐츠의 상세 정보(포스터, 제목 등)를 먼저 가져옵니다.
      // (스토어에서 이미 상세 데이터를 관리한다면 그 데이터를 사용해도 됩니다)
      const API_KEY = '본인의_TMDB_API_KEY';
      const response = await axios.get(
        `https://api.themoviedb.org/3/${type}/${tmdb_id}?api_key=${API_KEY}&language=ko-KR`
      );
      const data = response.data;

      // 2. Watching 스토어에 저장할 객체 생성
      const watchingItem = {
        id: id,
        media_type: type as "movie" | "tv",
        title: data.title || data.name,
        backdrop_path: data.backdrop_path,
        poster_path: data.poster_path,
        WatchBar: 0, // 초기 진행률
      };

      // 3. 스토어에 추가 함수 실행
      onAddWatching(watchingItem);

      // 4. 비디오 페이지로 이동
      navigate(`/play/${type}/${id}/video`);
    } catch (error) {
      console.error('Watching 저장 실패:', error);
      // 에러가 나더라도 재생 페이지로는 이동하게 함
      navigate(`/play/${type}/${id}/video`);
    }
  };

  const handleWishClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWish({ id: id, media_type: type });
  };

  return (
    <div className="bannerBtnWrap">
      <button className="nowPlay" onClick={goPlay}>
        지금 재생하기
        <img src="/icon/nowPlay.svg" alt="재생" />
      </button>

      <button className="moreInfo" onClick={goDetail}>
        상세 정보
      </button>

      <button className={`heart ${isWished ? 'active' : ''}`} onClick={handleWishClick}></button>
    </div>
  );
};

export default BannerBtn;
