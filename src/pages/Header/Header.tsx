import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom';
import './scss/Header.scss';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDepthOpen, setIsDepthOpen] = useState(false);
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLogin, onLogout } = useAuthStore();
  const { profiles, activeProfileId, editActiveProfile } = useProfileStore();
  // const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const isProfilePage = path.startsWith('/profile');
  const isLoginPage = path.startsWith('/login');
  const isSignupPage = path.startsWith('/signup');
  const isSubPage = path.startsWith('/subscription');
  const isPayPage = path.startsWith('/payment');

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
  const kids = useMatch('/kids/*');

  const isKidsProfile = activeProfile?.isKids === true;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    console.log(isKidsProfile);
  }, []);

  const toggleProfileDepth = () => {
    setIsDepthOpen((prev) => !prev);
  };

  const closeDepth = () => {
    setIsDepthOpen(false);
  };

  if (isProfilePage || isLoginPage || isSubPage || isPayPage) {
    return (
      <div
        className={`Header isprofile pullInner ${isScrolled ? 'active' : ''} ${kids ? 'kids' : ''
          } `}>
        <div className="Header-left">
          <Link to="/">
            <img src="/images/logo.svg" alt="로고" />
          </Link>
        </div>

        <div className="Header-right">
          {isLogin ? (
            <button className="onLogoutBtn" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="LinkBtn">
              로그인
            </Link>
          )}
        </div>
      </div>
    );
  }
  if (isKidsProfile) {
    return (
      <div className={`Header pullInner ${isScrolled ? 'kids' : ''} `}>
        {isLogin ? (
          <>
            <div className="Header-left">
              <h1 className="logo">
                <Link to="/">
                  <img src="/images/logo.svg" alt="로고" />
                </Link>
              </h1>
              <nav>
                <Link className="LinkBtn" to="/kids">
                  홈
                </Link>
                <Link className="LinkBtn" to="/kids/movie">
                  영화
                </Link>
                <Link className="LinkBtn" to="/kids/series">
                  시리즈
                </Link>
              </nav>
            </div>
            <div className="Header-right">
              <button className="search" onClick={() => navigate('/kids/search')}>
                <img src="/icon/search.svg" alt="검색 아이콘" />
              </button>
              <Link className="MyWish LinkBtn" to="/wishlist">
                내가 찜한 콘텐츠
              </Link>
              <div className="MyProfileDepth">
                <button className="MyProfile" onClick={toggleProfileDepth}>
                  <img src={activeProfile?.image} alt={activeProfile?.name || '프로필'} />
                </button>
                <ul
                  className={`ProfileDropdown ${isDepthOpen ? 'open' : ''}`}
                  onMouseLeave={closeDepth}>
                  <li>
                    <button
                      className="dropdownLink"
                      onClick={() => {
                        editActiveProfile();
                        navigate('/profile/edit');
                      }}>
                      내 프로필 수정
                    </button>
                  </li>
                  <li>
                    <Link to="/profile/select" className="dropdownLink">
                      프로필 변경
                    </Link>
                  </li>
                  <li>
                    <button className="dropdownLink" onClick={() => onLogout()}>
                      로그아웃
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="Header-left">
              <h1 className="logo">
                <Link to="/">
                  <img src="/images/logo.svg" alt="로고" />
                </Link>
              </h1>
            </div>
            <div className="Header-right">
              <Link to="/login" className="LinkBtn">
                로그인
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <header className={`Header pullInner ${isScrolled ? 'active' : ''} `}>
      {isLogin && !isSignupPage ? (
        <>
          <div className="Header-left">
            <h1 className="logo">
              <Link to="/">
                <img src="/images/logo.svg" alt="로고" />
              </Link>
            </h1>
            <nav className="web">
              <Link className="LinkBtn" to="/">
                홈
              </Link>
              <Link className="LinkBtn" to="/movie">
                영화
              </Link>
              <Link className="LinkBtn" to="/series">
                시리즈
              </Link>
            </nav>
          </div>
          <div className="Header-right">
            <button className="search" onClick={() => navigate('/search')}>
              <img src="/icon/search.svg" alt="검색 아이콘" />
            </button>
            <Link className="MyWish LinkBtn" to="/wishlist">
              내가 찜한 콘텐츠
            </Link>
            <div className="MyProfileDepth">
              <button className="MyProfile" onClick={toggleProfileDepth}>
                <img src={activeProfile?.image} alt={activeProfile?.name || '프로필'} />
              </button>
              <ul
                className={`ProfileDropdown ${isDepthOpen ? 'open' : ''}`}
                onMouseLeave={closeDepth}>
                <li>
                  <button
                    className="dropdownLink"
                    onClick={() => {
                      editActiveProfile();
                      navigate('/profile/edit');
                    }}>
                    내 프로필 수정
                  </button>
                </li>
                <li>
                  <Link to="/profile/select" className="dropdownLink">
                    프로필 변경
                  </Link>
                </li>
                {!isKidsProfile && (
                  <li>
                    <Link to="/profile/setting" className="dropdownLink">
                      계정 설정
                    </Link>
                  </li>
                )}
                <li>
                  <button className="dropdownLink" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="Header-left">
            <h1 className="logo">
              <Link to="/">
                <img src="/images/logo.svg" alt="로고" />
              </Link>
            </h1>
          </div>
          <div className="Header-right">
            <Link to="/login" className="LinkBtn">
              로그인
            </Link>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
