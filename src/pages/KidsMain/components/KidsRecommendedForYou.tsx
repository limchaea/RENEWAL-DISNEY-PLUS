import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';
import { Pagination } from 'swiper/modules';
import { Link, useMatch } from 'react-router-dom';
import HeaderTitle from '../../Main/components/HeaderTitle';
import VideoPopup from '../../Main/components/VideoPopup';
import { useMovieStore } from '../../../store/useMovieStore';
// import { useTvStore } from '../../../store/useTvStore';
import { useRecommendationStore } from '../../../store/useRecommendationStore';
import { useProfileStore } from '../../../store/useProfileStore';
import '../scss/KidsMovieList.scss';
import type { LocalContentItem } from '../../../types/IContentTypes';

const RecommendedForYou = () => {
  const { onFetchVideo } = useMovieStore();
  // const { onFetchTvVideo } = useTvStore();
  const { recommendedItems, isLoading, onGenerateRecommendations } = useRecommendationStore();
  const { activeProfile } = useProfileStore();

  // 1. 현재 키즈 경로(/kids/*)에 있는지 확인
  const isKidsPath = useMatch('/kids/*');

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [youtubeKey, setYoutubeKey] = useState('');
  const [popupData, setPopupData] = useState<LocalContentItem | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onGenerateRecommendations();
  }, [onGenerateRecommendations]);

  // 키즈 모드에서도 추천 스토어가 이미 필터링된 데이터를 제공하므로
  // 추가 필터링 없이 그대로 사용
  const displayItems = recommendedItems;
  const handleMouseEnter = (e: React.MouseEvent, el: LocalContentItem) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    let leftPos = rect.left - (containerRect?.left || 0);
    const popupWidth = rect.width * 1.2;

    if (rect.left + popupWidth > windowWidth - 20) {
      leftPos = leftPos - (popupWidth - rect.width);
    }

    const position = {
      top: rect.top - (containerRect?.top || 0),
      left: leftPos,
      width: rect.width,
    };

    hoverTimer.current = setTimeout(async () => {
      setPopupData(el);
      setPopupPos(position);
      setHoveredId(el.id);

      try {
        // 키즈 영화 비디오 데이터 가져오기
        const videos = await onFetchVideo(el.id);
        if (videos && videos.length > 0) {
          const trailer =
            videos.find(
              (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
            ) || videos.find((v) => v.site === 'YouTube');
          setYoutubeKey(trailer ? trailer.key : '');
        }
      } catch (error) {
        console.error(error);
        setYoutubeKey('');
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredId(null);
  };

  if (isLoading) return null;
  if (displayItems.length === 0) return null;

  return (
    <section
      className="RecommendedForYou movieList pullInner"
      ref={containerRef}
      style={{ position: 'relative' }}>
      <HeaderTitle mainTitle={`${activeProfile?.name || '우리 아이'}를 위한 추천 이야기`} />

      <Swiper
        slidesPerView={6.2}
        spaceBetween={20}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper"
        style={{ overflow: 'visible' }}>
        {displayItems.map((el: any, idx: number) => (
          <SwiperSlide key={`${el.media_type}-${el.id}-${idx}`}>
            <Link
              to={`/play/${el.media_type}/${el.id}`}
              onMouseEnter={(e) => handleMouseEnter(e, el)}
              onMouseLeave={() => {
                if (hoverTimer.current) clearTimeout(hoverTimer.current);
              }}>
              <div className={`movieThumbnail col ${isKidsPath ? 'kids' : ''}`}>
                <div className="imgBox">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${el.poster_path}`}
                    alt={el.title || el.name}
                  />
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {hoveredId && popupData && (
        <div
          className="external-popup-portal"
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: popupPos.top - 15,
            left: popupPos.left - popupPos.width * 0.1,
            width: popupPos.width * 1.2,
            zIndex: 1000,
          }}>
          <VideoPopup
            youtubeKey={youtubeKey}
            title={popupData.category === "movie" ? popupData.title : popupData.name}
            id={popupData.id}
            mediaType={popupData.media_type}
            posterPath={popupData.poster_path || ''}
            backdropPath={popupData.backdrop_path || ''}
            overview={popupData.overview}
            onClose={handleMouseLeave}
          />
        </div>
      )}
    </section>
  );
};

export default RecommendedForYou;
