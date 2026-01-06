// layouts/admin/AdminSidebar.tsx
import { NavLink } from 'react-router-dom';

const menuStyle = {
  display: 'block',
  padding: '6px 10px',
  fontSize: '13px',
  color: '#334155',
  textDecoration: 'none',
  borderRadius: '4px',
};

const activeStyle = {
  backgroundColor: '#5aa6c9',
  color: '#fff',
  fontWeight: 600,
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: '12px' }}>
    <div
      style={{
        backgroundColor: '#e2f0f7',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '4px',
        marginBottom: '6px',
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const linkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive ? { ...menuStyle, ...activeStyle } : menuStyle;

const AdminSidebar = () => {
  return (
    <aside
      style={{
        width: '200px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Admin</h2>

      <Section title="운영">
        <NavLink to="/admin/dashboard" style={linkStyle}>
          대시보드
        </NavLink>
        <NavLink to="/admin/categories" style={linkStyle}>
          카테고리 관리
        </NavLink>
      </Section>

      <Section title="상품제어">
        <NavLink to="/admin/products/display" style={linkStyle}>
          상품 진열
        </NavLink>
        <NavLink to="/admin/products/manage" style={linkStyle}>
          상품 관리
        </NavLink>
      </Section>

      <Section title="회원관리">
        <NavLink to="/admin/orders" style={linkStyle}>
          주문 관리
        </NavLink>
        <NavLink to="/admin/reviews" style={linkStyle}>
          리뷰 관리
        </NavLink>
      </Section>

      <Section title="광고">
        <NavLink to="/admin/popup" style={linkStyle}>
          팝업 관리
        </NavLink>
        <NavLink to="/admin/banner" style={linkStyle}>
          배너 관리
        </NavLink>
      </Section>
    </aside>
  );
};

export default AdminSidebar;

