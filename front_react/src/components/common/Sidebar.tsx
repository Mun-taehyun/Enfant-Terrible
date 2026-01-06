import { NavLink } from 'react-router-dom';

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

const Sidebar = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? { ...menuStyle, ...activeStyle } : menuStyle;

  return (
    <div
      style={{
        width: '220px',
        height: '100%',
        backgroundColor: '#f1f5f9',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* 운영 */}
      <div style={sectionTitle}>운영</div>
      <NavLink to="/admin/categories" style={linkStyle}>
        카테고리 관리
      </NavLink>
      <NavLink to="/admin/dashboard" style={linkStyle}>
        쇼핑몰 매출확인
      </NavLink>

      {/* 상품제어 */}
      <div style={sectionTitle}>상품제어</div>
      <NavLink to="/admin/products/display" style={linkStyle}>
        상품 진열
      </NavLink>
      <NavLink to="/admin/products/manage" style={linkStyle}>
        상품 관리
      </NavLink>

      {/* 1:1 채팅 */}
      <div style={sectionTitle}>1:1 채팅</div>
      <NavLink to="/admin/chats" style={linkStyle}>
        사용자 채팅방관리
      </NavLink>

      {/* 회원관리 */}
      <div style={sectionTitle}>회원관리</div>
      <NavLink to="/admin/information" style={linkStyle}>
        사용자 정보조회
      </NavLink>
      <NavLink to="/admin/orders" style={linkStyle}>
        사용자 주문목록 조회
      </NavLink>
      <NavLink to="/admin/reviews" style={linkStyle}>
        사용자 후기삭제
      </NavLink>

      {/* 광고 */}
      <div style={sectionTitle}>광고</div>
      <NavLink to="/admin/popup" style={linkStyle}>
        광고팝업
      </NavLink>
      <NavLink to="/admin/banner" style={linkStyle}>
        광고배너
      </NavLink>

      <NavLink
      to="/admin"
      style={{
      display: 'block',
      fontWeight: 700,
      marginBottom: '12px',
      color: '#334155',
      textDecoration: 'none',
      }}
      >
      Admin
        </NavLink>
    </div>
  );
};

export default Sidebar;