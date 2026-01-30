import HeaderTitle from '../../Main/components/HeaderTitle';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import '../scss/SearchTop10List.scss';

interface TMDBSearchItem {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  title?: string;
  name?: string;
}

interface SearchTop10Props {
  title: string;
  data: TMDBSearchItem[];
}

const SearchTop10List = ({ title, data }: SearchTop10Props) => {
  if (!data || data.length === 0) return null;

  return (
    <section className="searchTop10List">
      <HeaderTitle mainTitle={title} />
      <Swiper
        slidesPerView={5.3}
        spaceBetween={20}
        className="mySwiper"
        breakpoints={{
          0: {
            slidesPerView: 1.2,
            spaceBetween: 8,
          },
          281: {
            slidesPerView: 2.4,
            spaceBetween: 8,
          },
          481: {
            slidesPerView: 3.4,
            spaceBetween: 16,
          },
          769: {
            slidesPerView: 3.4,
            spaceBetween: 16,
          },
          1201: {
            slidesPerView: 4.2,
            spaceBetween: 16,
          },
        }}>
        {data.slice(0, 10).map((el) => (
          <SwiperSlide key={el.id}>
            <Link to={`/play/${el.media_type}/${el.id}`}>
              <div className="movieThumbnail">
                <div className="imgBox">
                  {el.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${el.poster_path}`}
                      alt={`${el.title || el.name} 썸네일`}
                    />
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default SearchTop10List;
