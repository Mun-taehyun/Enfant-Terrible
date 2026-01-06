import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const menuStyle = {
  display: 'block',
  padding: '6px 10px',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#334155',
  textDecoration: 'none',
};

const activeStyle = {
  backgroundColor: '#5aa6c9',
  color: '#ffffff',
  fontWeight: 600,
};

const sectionTitle = {
  marginTop: '16px',
  marginBottom: '6px',
  padding: '4px 8px',
  backgroundColor: '#e2f0f7',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '4px',
};

const AdminContainer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/admin/login', { replace: true });
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? { ...menuStyle, ...activeStyle } : menuStyle;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          height: '48px',
          backgroundColor: '#5aa6c9',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        {/* 메인 이동 */}
        <strong
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin')}
        >
          Admin
        </strong>

        {/* 오른쪽 버튼들 (absolute ❌) */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/mypage')}
          >
            관리자님
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={handleLogout}
          >
            로그아웃
          </span>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex' }}>
        <aside
          style={{
            width: '220px',
            backgroundColor: '#f1f5f9',
            padding: '12px',
          }}
        >
          <div style={sectionTitle}>운영</div>
          <NavLink to="/admin/categories" style={linkStyle}>카테고리 관리</NavLink>
          <NavLink to="/admin/dashboard" style={linkStyle}>쇼핑몰 매출확인</NavLink>

          <div style={sectionTitle}>상품제어</div>
          <NavLink to="/admin/products/display" style={linkStyle}>상품 진열</NavLink>
          <NavLink to="/admin/products/manage" style={linkStyle}>상품 관리</NavLink>

          <div style={sectionTitle}>1:1 채팅</div>
          <NavLink to="/admin/chats" style={linkStyle}>사용자 채팅방관리</NavLink>

          <div style={sectionTitle}>회원관리</div>
          <NavLink to="/admin/information" style={linkStyle}>사용자 정보조회</NavLink>
          <NavLink to="/admin/orders" style={linkStyle}>사용자 주문목록 조회</NavLink>
          <NavLink to="/admin/reviews" style={linkStyle}>사용자 후기삭제</NavLink>

          <div style={sectionTitle}>광고</div>
          <NavLink to="/admin/popup" style={linkStyle}>광고팝업</NavLink>
          <NavLink to="/admin/banner" style={linkStyle}>광고배너</NavLink>
        </aside>

        <main style={{ flex: 1, padding: '24px', backgroundColor: '#f5f6f8' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminContainer;

