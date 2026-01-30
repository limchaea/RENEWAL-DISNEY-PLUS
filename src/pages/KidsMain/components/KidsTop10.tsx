import '../scss/KidsMovieList.scss';
import '../../Main/scss/Top10List.scss';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link, useMatch } from 'react-router-dom';
import type { Movie, title } from '../../../types/IMovie';
import HeaderTitle from '../../Main/components/HeaderTitle';
import { useKidsMoiveStore } from '../../../store/useKidsMovieStore';
import { useMovieStore } from '../../../store/useMovieStore'; // 비디오 페칭용
import VideoPopup from '../../Main/components/VideoPopup'; // 경로 확인 필요
import 'swiper/swiper.css';
import { useProfileStore } from '../../../store/useProfileStore';


const KidsTop10 = ({ title }: title) => {
  const kids = useMatch('/kids/*');
  const { onFetchTop10Movies, kidsTopMovie } = useKidsMoiveStore();
  const { onFetchVideo } = useMovieStore(); // 영화 비디오 가져오기 함수

  const { profiles, activeProfileId } = useProfileStore();

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
  const isKidsProfile = activeProfile?.isKids === true;

  // --- 팝업 상태 관리 ---
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [youtubeKey, setYoutubeKey] = useState('');
  const [popupData, setPopupData] = useState<Movie | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (kidsTopMovie.length === 0) {
      onFetchTop10Movies();
    }
  }, [kidsTopMovie, onFetchTop10Movies]);

  // --- 화면 경계 인식 마우스 핸들러 ---
  const handleMouseEnter = (e: React.MouseEvent, el: Movie) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // 1. 기본 왼쪽 시작점 계산
    let leftPos = rect.left - (containerRect?.left || 0);

    // 2. 팝업 예상 너비 (아이템의 1.1배 정도로 설정)
    const popupWidth = rect.width * 1.1;

    // 3. 우측 경계 인식: 팝업이 화면 오른쪽을 벗어나면 왼쪽으로 밀기
    if (rect.left + popupWidth > windowWidth - 30) {
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
    setYoutubeKey('');
    setPopupData(null);
  };

  return (
    <section
      className={`Top10List ${isKidsProfile ? 'kids' : ''}`}
      ref={containerRef}
      style={{ position: 'relative' }}>
      <HeaderTitle mainTitle={title} />
      <Swiper
        slidesPerView={4.2}
        spaceBetween={20}
        className="mySwiper"
        style={{ overflow: 'visible' }} // 팝업 노출용
      >
        {kidsTopMovie.slice(0, 7).map((el, i) => (
          <SwiperSlide key={el.id}>
            <Link
              to={`/play/movie/${el.id}`}
              onMouseEnter={(e) => handleMouseEnter(e, el)}
              onMouseLeave={() => {
                if (hoverTimer.current) clearTimeout(hoverTimer.current);
              }}>
              <div className={`movieThumbnail TopNumber number${1 + i}`}>
                <div className={`imgBox ${kids ? 'kids' : ''}`}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${el.poster_path}`}
                    alt={`${el.title} 썸네일`}
                  />
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 화면 경계가 반영된 비디오 팝업 */}
      {hoveredId && popupData && (
        <div
          className="external-popup-portal"
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: popupPos.top - 10,
            left: popupPos.left - popupPos.width * 0.05,
            width: popupPos.width * 1.1,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}>
          <VideoPopup
            youtubeKey={youtubeKey}
            title={popupData.title}
            id={popupData.id}
            mediaType="movie"
            posterPath={popupData.poster_path || ''}
            backdropPath={popupData.backdrop_path}
            onClose={handleMouseLeave}
          />
        </div>
      )}
    </section>
  );
};

export default KidsTop10;
