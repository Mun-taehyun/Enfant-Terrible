import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  // 🔹 자동 로그아웃 (1시간) — 유지
  useEffect(() => {
    const timer = setTimeout(() => {
      alert('1시간이 경과되어 자동 로그아웃 됩니다.');
      localStorage.removeItem('accessToken');
      navigate('/admin/login');
    }, 60 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
      }}
    >
      {/* 🔹 메인 안내 카드 (유지) */}
      <div
        style={{
          padding: '28px 40px',
          backgroundColor: '#5aa6c9',
          color: '#ffffff',
          borderRadius: '6px',
          textAlign: 'center',
          minWidth: '360px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        <h3
          style={{
            marginBottom: '10px',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Admin 메인 페이지입니다
        </h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
          좌측 메뉴를 통해<br />
          관리 기능을 선택해주세요.
        </p>
      </div>
    </div>
  );
};

export default Main;
