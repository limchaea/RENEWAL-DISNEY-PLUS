import './scss/VideoPlayerPage.scss';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  Genre,
  MediaDetail,
  Video,
  CollectionMovie,
  Movie,
  TV,
  ReleaseDatesResult,
  ContentRatingResult,
  CollectionResponse,
} from '../../types/ITV';
import { useWatchingStore } from '../../store/useWatchingStore';
import { useWishStore } from '../../store/useWishStore';
import { generateProgress } from '../../utils/progress';

const VideoPlayer = () => {
  // --- 상태 관리 ---
  const [player, setPlayer] = useState<MediaDetail | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<(Movie | TV)[]>([]);
  const [certification, setCertification] = useState<string>('none');
  const [activeTab, setActiveTab] = useState('추천 콘텐츠');
  const [videos, setVideos] = useState<Video[]>([]);
  const [collectionMovies, setCollectionMovies] = useState<CollectionMovie[]>([]);

  // 에피소드 관련 상태 추가
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // 로딩 상태 - 초기값을 true로 설정
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true); // 연관
  const [isLoadingVideos, setIsLoadingVideos] = useState(true); // 예고편
  const [isLoadingCollection, setIsLoadingCollection] = useState(true); // 컬렉션

  // --- 훅 및 변수 ---
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const { id, type } = useParams();
  const { onAddWatching, onFetchWatching, watching } = useWatchingStore();
  const { wishlist, onToggleWish, onFetchWish } = useWishStore();
  const [isWishActive, setIsWishActive] = useState(false);

  const navigate = useNavigate();

  console.log('player', player);

  // TODO 에피소드 데이터 가져오기
  const fetchEpisodes = async (seasonNumber: number) => {
    if (!id) return;
    setIsLoadingEpisodes(true);
    try {
      // 1. 한국어 데이터 요청
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=ko-KR`
      );
      const data = await res.json();

      // 2. 만약 첫 번째 에피소드의 overview가 비어있다면 영어로 재시도 (선택 사항)
      if (data.episodes && data.episodes.length > 0 && !data.episodes[0].overview) {
        const engRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`
        );
        const engData = await engRes.json();
        setEpisodes(engData.episodes || []);
      } else {
        setEpisodes(data.episodes || []);
      }
    } catch (error) {
      console.error('에피소드 로드 실패:', error);
      setEpisodes([]);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  // 시즌 선택 핸들러
  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    fetchEpisodes(seasonNumber);
  };

  // TODO 탭 기능
  const generateTabList = () => {
    const tabs: string[] = [];

    if (!player) return tabs;

    // 에피소드가 있으면 맨 앞에 추가 (TV만)
    if ('seasons' in player && player.seasons && player.seasons.length > 0) {
      tabs.push('에피소드');
    }

    tabs.push('추천 콘텐츠');

    if (
      player.overview ||
      player.production_companies?.length > 0 ||
      ('release_date' in player && player.release_date)
    ) {
      tabs.push('작품정보');
    }

    // 예고편이 있을 때만 탭 추가
    if (videos.length > 0) {
      tabs.push('예고편');
    }

    // 컬렉션이 있을 때만 탭 추가 (영화만)
    if ('belongs_to_collection' in player && player.belongs_to_collection) {
      tabs.push('컬렉션');
    }

    return tabs;
  };

  const tabList = generateTabList();

  //TODO 1.상세데이터 호출
  const fetchMovieDetails = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=ko-KR`
      );
      const data = await res.json();
      setPlayer(data);

      if (data.genres) fetchRecommendations(data.genres);
      if (data.belongs_to_collection) {
        fetchCollectionMovies(data.belongs_to_collection.id);
      } else {
        // 컬렉션이 없으면 로딩 종료
        setIsLoadingCollection(false);
      }

      // TV 시리즈인 경우 첫 번째 시즌의 에피소드 자동 로드
      if (type === 'tv' && data.seasons && data.seasons.length > 0) {
        const firstSeason = data.seasons[0].season_number;
        setSelectedSeason(firstSeason);
        fetchEpisodes(firstSeason);
      }
    } catch (error) {
      console.error('영화 상세 로드 실패:', error);
      setIsLoadingCollection(false);
    }
  };

  //TODO 2. 추천 콘텐츠 호출
  const fetchRecommendations = async (genres: Genre[]) => {
    setIsLoadingRecommendations(true);
    try {
      const genreIds = genres.map((g) => g.id).join(',');
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${genreIds}&language=ko-KR&sort_by=popularity.desc`
      );
      const data = await res.json();
      const filtered: (Movie | TV)[] =
        data.results?.filter((item: TV) => item.id !== Number(id)).slice(0, 12) || [];
      setRecommendations(filtered);
    } catch (error) {
      console.error('추천 콘텐츠 로드 실패:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  //TODO 3. 연령 등급 호출
  const fetchCertification = async () => {
    try {
      const endpoint = type === 'movie' ? 'release_dates' : 'content_ratings';
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}/${endpoint}?api_key=${API_KEY}`
      );
      const data = await res.json();

      const NLInfo = data.results.find(
        (el: ReleaseDatesResult | ContentRatingResult) => el.iso_3166_1 === 'NL'
      );
      const cAge =
        type === 'movie'
          ? NLInfo?.release_dates?.[0]?.certification || 'none'
          : NLInfo?.rating || 'none';
      setCertification(cAge);
    } catch (error) {
      console.error('연령 등급 로드 실패:', error);
    }
  };

  //TODO 4. 로고 이미지 호출
  const fetchLogo = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}/images?api_key=${API_KEY}`
      );
      const data = await res.json();
      setLogo(data.logos?.[0]?.file_path || null);
    } catch (error) {
      console.error('로고 이미지 로드 실패:', error);
    }
  };

  //TODO 5. 예고편 호출
  const fetchVideos = async () => {
    setIsLoadingVideos(true);
    console.log('예고편 로딩 시작');
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
      );
      const data = await res.json();
      const results: Video[] = data.results || [];
      const trailers = results.filter((v) => v.type === 'Trailer');
      const videoList = trailers.length > 0 ? trailers : data.results;
      setVideos(videoList || []);
      console.log('예고편 로딩 완료:', videoList?.length || 0);
    } catch (error) {
      console.error('예고편 로드 실패:', error);
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
      console.log('예고편 로딩 상태 false로 변경');
    }
  };

  //TODO 6. 컬렉션 영화 목록 호출
  const fetchCollectionMovies = async (collectionId: number) => {
    setIsLoadingCollection(true);
    console.log('컬렉션 로딩 시작:', collectionId);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/collection/${collectionId}?api_key=${API_KEY}&language=ko-KR`
      );
      const data = await res.json();
      const collection: CollectionResponse = data;
      const filteredParts = collection.parts?.filter((movie) => movie.id !== Number(id)) || [];
      setCollectionMovies(filteredParts);
      console.log('컬렉션 로딩 완료:', filteredParts.length);
    } catch (error) {
      console.error('컬렉션 데이터 로드 실패:', error);
    } finally {
      setIsLoadingCollection(false);
      console.log('컬렉션 로딩 상태 false로 변경');
    }
  };

  useEffect(() => {
    onFetchWatching();
  }, [onFetchWatching]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPlayer(null);
    setRecommendations([]);
    setVideos([]);
    setCollectionMovies([]);
    setIsLoadingRecommendations(true);
    setIsLoadingVideos(true);
    setIsLoadingCollection(true);
    setEpisodes([]);

    // 데이터 호출
    fetchMovieDetails();
    fetchCertification();
    fetchLogo();
    fetchVideos();

    console.log('로딩 시작 - Videos:', true, 'Collection:', true);
  }, [id, type]);

  // TODO 에피소드가 있으면 초기 탭을 에피소드로 설정
  useEffect(() => {
    if (player && 'seasons' in player && player.seasons && player.seasons.length > 0) {
      setActiveTab('에피소드');
    } else {
      setActiveTab('추천 콘텐츠');
    }
  }, [player]);

  // ---채아 이벤트 핸들러 ---
  // 시청 시작 핸들러
  const handleVideoOpen = async () => {
    // 필수 데이터 체크 (type 정보 포함)
    if (!id || !type || !player || !player.poster_path) return;

    const title = 'title' in player ? player.title : player.name;

    const watchingItem = {
      id: Number(id),
      media_type: type,
      poster_path: player.poster_path,
      backdrop_path: player.backdrop_path || '',
      currentTime: 0,
      duration: 0,
      title: title,
    };

    await onAddWatching(watchingItem);
    navigate(`/play/${type}/${id}/video`);
  };

  // 찜하기 토글 핸들러
  // 현재 콘텐츠가 찜 목록에 있는지 여부를 판별.
  const isWished = wishlist.some(
    (item) => String(item.id) === String(id) && item.media_type === type
  );

  useEffect(() => {
    onFetchWish();
  }, [onFetchWish]);

  useEffect(() => {
    setIsWishActive(isWished);
  }, [isWished]);

  const handleWishToggle = () => {
    if (!id || !type || !player || !player.poster_path) return;

    // 즉시 UI 반영
    setIsWishActive((prev) => !prev);

    const title = 'title' in player ? player.title : player.name;

    onToggleWish({
      id: Number(id),
      media_type: type,
      poster_path: player.poster_path,
      backdrop_path: player.backdrop_path || '',
      title,
    });
  };

  // --- 데이터 가공 ---
  const getDisplayData = () => {
    if (!player) {
      return { firstDate: '', year: '', runTimeDisplay: '', title: '' };
    }
    const firstDate = 'first_air_date' in player ? player.first_air_date : player.release_date;
    const year = firstDate ? firstDate.split('-')[0] : '';
    let runTimeDisplay = '';
    if (type === 'movie' && 'runtime' in player) {
      runTimeDisplay = player.runtime ? `${player.runtime}분` : '';
    } else if (type === 'tv' && 'episode_run_time' in player) {
      runTimeDisplay = player.episode_run_time?.[0] ? `${player.episode_run_time[0]}분` : '';
    }
    const title = 'title' in player ? player.title : player.name;
    return { firstDate, year, runTimeDisplay, title };
  };
  const { year, runTimeDisplay, title } = getDisplayData();

  //  스켈레톤 컴포넌트
  const GridSkeleton = ({ count = 12 }: { count?: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="grid-item skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
        </div>
      ))}
    </>
  );

  const VideoSkeleton = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid-item skeleton">
          <div className="skeleton-video"></div>
          <div className="skeleton-text"></div>
        </div>
      ))}
    </>
  );

  // TODO 재생바
  const isWatching = watching.some(
    (item) =>
      String(item.id) === String(id) && item.media_type === (type === 'series' ? 'tv' : type)
  );

  const progress = isWatching && player ? generateProgress(player.id) : 0;

  return (
    <section className="VideoPlayer">
      {/* 메인 비주얼 영역 */}
      <div className="playerMain">
        {player && (
          <img
            src={`https://image.tmdb.org/t/p/original/${player.backdrop_path || player.poster_path
              }`}
            alt={title}
          />
        )}
        {!(player && player.id) ? (
          <div className="skeleton"></div>
        ) : (
          <div className="info-wrap">
            <div className="logo ">
              {logo ? (
                <img src={`https://image.tmdb.org/t/p/original/${logo}`} alt="logo" />
              ) : (
                <h1 className="logo-text">{title}</h1>
              )}
            </div>
            {/* 재생바 */}
            {isWatching && (
              <div className="progressBarWrap">
                <div className="progressBar">
                  <div className="now" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="info-flex">
              <span className={`info1 age age${certification}`}></span>
              <div className="innerFlex">
                <span className="info2">{year}</span>
                <span className="info3">{runTimeDisplay}</span>
                <p className="info4">
                  {player?.genres?.map((genre: Genre) => (
                    <span key={genre.id}>{genre.name}</span>
                  ))}
                </p>
              </div>
            </div>
            <div className="buttonWrap">
              <button className="play" onClick={handleVideoOpen}>
                지금 재생하기
              </button>
              <button
                className={`MyWish LinkBtn ${isWishActive ? 'active' : ''}`}
                onClick={handleWishToggle}
                aria-label="찜하기"></button>
            </div>
          </div>
        )}
      </div>

      {/* 탭 메뉴 및 상세 콘텐츠 영역 */}
      <div className="relatedInfo">
        <div className="buttonWrap">
          {tabList.map((el, i) => (
            <button
              key={i}
              className={activeTab === el ? 'active' : ''}
              onClick={() => setActiveTab(el)}>
              {el}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* 에피소드 탭 */}
          {activeTab === '에피소드' && player && 'seasons' in player && (
            <div className="episodes tab">
              {/* 시즌 선택 드롭다운 */}
              <div className="seasonSelector">
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}>
                  {player.seasons?.map((season: Season) => (
                    <option key={season.id} value={season.season_number}>
                      {season.name} ({season.episode_count}개 에피소드)
                    </option>
                  ))}
                </select>
              </div>

              {/* 에피소드 리스트 */}
              <div className="episodeList">
                {isLoadingEpisodes ? (
                  <GridSkeleton count={6} />
                ) : (
                  episodes.map((episode) => (
                    <div key={episode.id} className="episodeItem">
                      <div className="episodeThumbnail">
                        {episode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                            alt={episode.name}
                          />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                        <div className="episodeNumber">{episode.episode_number}</div>
                      </div>
                      <div className="episodeInfo">
                        <h3>{episode.name}</h3>
                        <p className="episode-meta">
                          {episode.runtime && `${episode.runtime}분`}
                          {episode.air_date && ` · ${episode.air_date}`}
                        </p>
                        <p className="episode-overview">
                          {episode.overview || '줄거리 정보가 없습니다.'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 추천 콘텐츠 탭 */}
          {activeTab === '추천 콘텐츠' && (
            <div className="recommend tab">
              <div className="grid col">
                {isLoadingRecommendations ? (
                  <GridSkeleton />
                ) : (
                  recommendations.map((item) => {
                    const itemTitle = 'title' in item ? item.title : item.name;
                    return (
                      <Link key={item.id} to={`/play/${type}/${item.id}`} className="grid-item">
                        <img
                          src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                          alt={itemTitle}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p>{itemTitle}</p>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 작품정보 탭 */}
          {activeTab === '작품정보' && player && (
            <div className="detailData tab">
              <ul>
                <li className="title">줄거리</li>
                <li className="overview">{player.overview || '등록된 줄거리가 없습니다.'}</li>
              </ul>
              {player.production_companies && player.production_companies.length > 0 && (
                <ul>
                  <li className="title">제작사</li>
                  <li className="prod-list">
                    {player.production_companies.map((company, idx) => (
                      <span key={company.id}>
                        {company.name}
                        {idx < player.production_companies!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </li>
                </ul>
              )}
              {'release_date' in player && player.release_date && (
                <ul>
                  <li className="title">개봉일</li>
                  <li>{player.release_date}</li>
                </ul>
              )}
            </div>
          )}

          {/* 예고편 탭 */}
          {activeTab === '예고편' && (
            <div className="trailers tab">
              <div className="videoWarp grid row">
                {isLoadingVideos ? (
                  <VideoSkeleton />
                ) : (
                  videos.slice(0, 6).map((video) => (
                    <div key={video.id} className="grid-item">
                      <div className="iframe-box">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.key}`}
                          title={video.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          allowFullScreen></iframe>
                      </div>
                      <p>{video.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 컬렉션 탭 */}
          {activeTab === '컬렉션' &&
            player &&
            'belongs_to_collection' in player &&
            player.belongs_to_collection && (
              <div className="collection tab">
                <ul className="collection-list grid col">
                  {isLoadingCollection ? (
                    <GridSkeleton count={6} />
                  ) : (
                    collectionMovies.map((movie) => (
                      <li key={movie.id} className="grid-item">
                        <Link to={`/play/movie/${movie.id}`}>
                          <img
                            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                            alt={movie.title}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
