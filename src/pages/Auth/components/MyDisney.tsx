// TODO My Disney 컴포넌트

import { useState } from 'react';

const brandList = [
  { id: 1, logoImg: '/images/auth/brand_disney.svg', dec: 'disney' },
  { id: 2, logoImg: '/images/auth/brand_abc.svg', dec: 'abc' },
  { id: 3, logoImg: '/images/auth/brand_espn.svg', dec: 'espn' },
  { id: 4, logoImg: '/images/auth/brand_marvel.svg', dec: 'marvel' },
  { id: 5, logoImg: '/images/auth/brand_starwars.svg', dec: 'starwars' },
  { id: 6, logoImg: '/images/auth/brand_hulu.svg', dec: 'hulu' },
  { id: 7, logoImg: '/images/auth/brand_ngc.svg', dec: 'ngc' },
];

const MyDisney = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`myDisneyWrap ${isOpen ? 'active' : ''}`}>
      <p className="myDisneyTitle" onClick={() => setIsOpen(!isOpen)}>
        MyDisney에 대해 더 알아보기 <span></span>
      </p>

      {isOpen && (
        <div className="myDisneyTextWrap">
          <div className="myDisneyInfoText">
            디즈니+는 The Walt Disney Family of Companies의 계열사입니다. MyDisney 계정으로 디즈니+,
            ESPN, Walt Disney World, 기타 다른 서비스 등 The Walt Disney Family of Companies의
            다양한 서비스에 간편하게 로그인해 보세요.
          </div>
          <div className="brandWrap">
            <ul className="brandList">
              {brandList.map((list) => (
                <li key={list.id}>
                  <img src={list.logoImg} alt={list.dec} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* <div className="myDisneyTextWrap">
        <div className="myDisneyInfoText">
          디즈니+는 The Walt Disney Family of Companies의 계열사입니다. MyDisney 계정으로 디즈니+,
          ESPN, Walt Disney World, 기타 다른 서비스 등 The Walt Disney Family of Companies의 다양한
          서비스에 간편하게 로그인해 보세요.
        </div>
        <div className="brandWrap">
          <ul className="brandList">
            {brandList.map((list) => (
              <li key={list.id}>
                <img src={list.logoImg} alt={list.dec} />
              </li>
            ))}
          </ul>
        </div>
      </div> */}
    </div>
  );
};

export default MyDisney;
