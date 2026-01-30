import { useProfileStore } from '../../store/useProfileStore';
import './scss/Footer.scss';

const Footer = () => {
  const { profiles, activeProfileId } = useProfileStore();

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
  const isKidsProfile = activeProfile?.isKids === true;

  // const isKids = !!useMatch('/kids/*');

  return (
    <div className={`footer normal ${isKidsProfile ? 'kidsMode' : ''}`}>
      <div className="inner">
        <div className="footerLogo">
          <img src="/images/logo.svg" alt="footer_logo" />
        </div>
        {/* <div className="infoWrap">
          <ul className="infoList">
            <li>
              <button>디즈니+이용약관</button>
            </li>
            <li>
              <button>개인정보 처리방침</button>
            </li>
            <li>
              <button>개인정보 처리방침 부속서</button>
            </li>
            <li>
              <button>관심 기반 광고</button>
            </li>
            <li>
              <button>고객센터</button>
            </li>
            <li>
              <button>다양한 시청 방법</button>
            </li>
            <li>
              <button>디즈니+소개</button>
            </li>
            <li>
              <button>통신판매업 사업자정보확인</button>
            </li>
          </ul>
        </div> */}
        <div className="footerBottom">
          <div className="footerBottomTop">
            <p>
              <span>월트디즈니컴퍼니코리아 유한책임회사</span>
              <span>대표자 : 김소연</span>
              <span>서울특별시 강남구 테헤란로 152, 7층 (우편번호: 06236)</span>
              <span>Email: help@disneyplus.kr</span>
              <span>연락처 : 080 822 1416</span>
              <span> 사업자등록번호 : 220-81-03347</span>
            </p>
            <p>
              <span>통신판매업 신고번호: 제2021-서울강남-05456호</span>
              <span>비디오물배급업 신고번호 : 제2016-16호</span>
              <span>호스팅서비스 사업자 : NSOne</span>
            </p>
          </div>
          <p> 디즈니+의 콘텐츠는 서비스 여부에 따라 달라질 수 있습니다.</p>
          <address>© 2025 Disney and its related entities. All Rights Reserved.</address>
        </div>
      </div>
    </div>
  );
};

export default Footer;
