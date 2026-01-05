import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  // 🔹 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    alert('로그아웃 되었습니다.');
    navigate('/admin/login');
  };

  // 🔹 관리자 마이페이지 이동
  const goMyPage = () => {
    navigate('/admin/mypage');
  };

  // 🔹 자동 로그아웃 (1시간)
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
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
      }}
    >
      {/* 🔹 우측 상단 관리자 영역 */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          fontSize: '14px',
        }}
      >
        <span
          style={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={goMyPage}
        >
          
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '4px 10px',
            fontSize: '13px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
        
        </button>
      </div>

      {/* 🔹 메인 안내 카드 */}
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

