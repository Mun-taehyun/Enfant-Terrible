// src/layouts/admin/AdminSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './AdminSidebar.module.css';

type SectionProps = {
  title: string;
  children: ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionTitle}>{title}</div>
    <nav className={styles.sectionNav}>{children}</nav>
  </section>
);

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = confirm('로그아웃 하시겠습니까?');
    if (!ok) return;

    // 프로젝트 기준 토큰 키
    localStorage.removeItem('accessToken');

    // 혹시 쓰는 키가 있으면 같이 제거(없어도 문제 없음)
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminToken');

    navigate('/admin/login', { replace: true });
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink;

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/admin" className={styles.brand}>
        Admin Panel
      </NavLink>

      <Section title="운영">
        <NavLink to="/admin/dashboard" className={linkClassName}>
          쇼핑몰 매출확인
        </NavLink>
        <NavLink to="/admin/categories" className={linkClassName}>
          카테고리 관리
        </NavLink>
      </Section>

      <Section title="상품 제어">
        <NavLink to="/admin/products/display" className={linkClassName}>
          상품 진열
        </NavLink>
        <NavLink to="/admin/products/manage" className={linkClassName}>
          상품 관리
        </NavLink>
      </Section>

      <Section title="고객 소통">
        <NavLink to="/admin/chat" className={linkClassName}>
          사용자 채팅방 관리
        </NavLink>
      </Section>

      <Section title="회원 관리">
        <NavLink to="/admin/accounts" className={linkClassName}>
          사용자 정보 조회
        </NavLink>
        <NavLink to="/admin/orders" className={linkClassName}>
          주문 목록 조회
        </NavLink>
        <NavLink to="/admin/reviews" className={linkClassName}>
          리뷰 삭제 관리
        </NavLink>
      </Section>

      <Section title="광고 및 홍보">
        <NavLink to="/admin/popup" className={linkClassName}>
          광고 팝업 설정
        </NavLink>
        <NavLink to="/admin/banner" className={linkClassName}>
          광고 배너 설정
        </NavLink>
      </Section>

      {/* 맨 아래 로그아웃 */}
      <div className={styles.logoutArea}>
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
