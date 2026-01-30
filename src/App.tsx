import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Header from './pages/Header/Header';
import MainPage from './pages/Main/MainPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import PaymentPage from './pages/Subscription/PaymentPage';
import ProfileSettingPage from './pages/ProfileSetting/ProfileSettingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import ProfileEditPage from './pages/ProfileEdit/ProfileEditPage';
import Footer from './pages/Footer/Footer';
import MainMovie from './pages/Main/MainMovie';
import MainSeries from './pages/Main/MainSeries';
import ProfileSelectPage from './pages/ProfileSelect/ProfileSelectPage';
import ProfileCreatePageImage from './pages/ProfileCreate/ProfileCreatePageImage';
import ProfileCreatePageInfo from './pages/ProfileCreate/ProfileCreatePageInfo';
import SubComplete from './pages/Subscription/components/SubComplete';
import KidsMainPage from './pages/KidsMain/KidsMainPage';
import VideoPlayer from './pages/VideoPlayer/VideoPlayer';
import SearchPage from './pages/Search/SearchPage';
import PlayerControls from './pages/VideoPlayer/PlayerControls';
import WishlistPage from './pages/Wishlist/WishlistPage';
import { useProfileStore } from './store/useProfileStore';
import AuthRedirect from './pages/Auth/components/AuthRedirect';
import KidsDetail from './pages/KidsMain/components/KidsDetail';
import KidsMovie from './pages/KidsMain/KidsMovie';
import KidsSeries from './pages/KidsMain/KidsSeries';
import KidsSearch from './pages/KidsMain/components/KidsSearch';
import IntroPage from './pages/Intro/IntroPage';
import BottomNav from './pages/BottomNav/BottomNav';

function App() {
  const { initAuth, userData } = useAuthStore();
  const { initWithUser, initDefaultProfiles } = useProfileStore();
  const location = useLocation();

  // Footer를 숨길 페이지 경로들
  const hideFooterPaths = [
    '/login',
    '/signup',
    '/payment',
    '/subscription',
    '/subscription/success',
    '/profile/edit',
    '/profile/select',
    '/profile/create/image',
    '/profile/create/info',
    '/profile/setting',
    '/auth/redirect',
    '/intro',
  ];

  // Header를 숨길 페이지 경로들
  const hideHeaderPaths = ['/intro'];

  // 현재 경로가 Footer를 숨겨야 하는 페이지인지 확인
  const shouldHideFooter =
    hideFooterPaths.includes(location.pathname) || (location.pathname === '/' && !userData);

  // 현재 경로가 Header를 숨겨야 하는 페이지인지 확인
  const shouldHideHeader =
    hideHeaderPaths.includes(location.pathname) || (location.pathname === '/' && !userData);

  useEffect(() => {
    initAuth(); // 앱 시작 시 로그인 상태 초기화
  }, [initAuth]);

  useEffect(() => {
    if (userData?.uid) {
      initWithUser(userData.uid);
      initDefaultProfiles();
    }
  }, [userData, initWithUser, initDefaultProfiles]);

  return (
    <div>
      {!shouldHideHeader && <Header />}
      <Routes>
        <Route path="/" element={userData ? <MainPage /> : <IntroPage />} />
        {/* <Route path="/intro" element={<IntroPage />} /> */}
        <Route path="/movie" element={<MainMovie />} />
        <Route path="/series" element={<MainSeries />} />
        <Route path="/play/:type/:id" element={<VideoPlayer />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscription/success" element={<SubComplete />} />
        <Route path="/profile/setting" element={<ProfileSettingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/profile/select" element={<ProfileSelectPage />} />
        <Route path="/profile/create/image" element={<ProfileCreatePageImage />} />
        <Route path="/profile/create/info" element={<ProfileCreatePageInfo />} />
        <Route path="/kids" element={<KidsMainPage />} />
        <Route path="/kids/:friends" element={<KidsDetail />} />
        <Route path="/kids/movie" element={<KidsMovie />} />
        <Route path="/kids/series" element={<KidsSeries />} />
        <Route path="/play/:type/:id/video" element={<PlayerControls />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/auth/redirect" element={<AuthRedirect />} />
        <Route path="/kids/search" element={<KidsSearch />} />
      </Routes>
      <BottomNav />
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;
