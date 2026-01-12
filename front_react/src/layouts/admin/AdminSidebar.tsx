// src/layouts/admin/AdminSidebar.tsx
import { NavLink } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';

// 공통 스타일 정의
const menuStyle: CSSProperties = {
  display: 'block',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#334155',
  textDecoration: 'none',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
};

const activeStyle: CSSProperties = {
  backgroundColor: '#5aa6c9',
  color: '#ffffff',
  fontWeight: 600,
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div style={{ marginBottom: '16px' }}>
    <div
      style={{
        backgroundColor: '#e2f0f7',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#0f172a',
        borderRadius: '4px',
        marginBottom: '6px',
      }}
    >
      {title}
    </div>

    <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {children}
    </nav>
  </div>
);

// 활성화 링크 스타일 처리 함수
const linkStyle = ({ isActive }: { isActive: boolean }) =>
  isActive ? { ...menuStyle, ...activeStyle } : menuStyle;

const AdminSidebar = () => {
  return (
    <aside
      style={{
        width: '220px',
        height: '100vh',
        padding: '16px 12px',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e5e7eb',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
      }}
    >
      <NavLink
        to="/admin"
        style={{
          display: 'block',
          fontSize: '18px',
          fontWeight: 800,
          marginBottom: '20px',
          padding: '0 8px',
          color: '#1e293b',
          textDecoration: 'none',
        }}
      >
        Admin Panel
      </NavLink>

      <Section title="운영">
        <NavLink to="/admin/dashboard" style={linkStyle}>
          쇼핑몰 매출확인
        </NavLink>
        <NavLink to="/admin/categories" style={linkStyle}>
          카테고리 관리
        </NavLink>
      </Section>

      <Section title="상품 제어">
        <NavLink to="/admin/products/display" style={linkStyle}>
          상품 진열
        </NavLink>
        <NavLink to="/admin/products/manage" style={linkStyle}>
          상품 관리
        </NavLink>
      </Section>

      <Section title="고객 소통">
        <NavLink to="/admin/chat" style={linkStyle}>
          사용자 채팅방 관리
        </NavLink>
      </Section>

      <Section title="회원 관리">
        <NavLink to="/admin/accounts" style={linkStyle}>
          사용자 정보 조회
        </NavLink>
        <NavLink to="/admin/orders" style={linkStyle}>
          주문 목록 조회
        </NavLink>
        <NavLink to="/admin/reviews" style={linkStyle}>
          리뷰 삭제 관리
        </NavLink>
      </Section>

      <Section title="광고 및 홍보">
        <NavLink to="/admin/popup" style={linkStyle}>
          광고 팝업 설정
        </NavLink>
        <NavLink to="/admin/banner" style={linkStyle}>
          광고 배너 설정
        </NavLink>
      </Section>
    </aside>
  );
};

export default AdminSidebar;
