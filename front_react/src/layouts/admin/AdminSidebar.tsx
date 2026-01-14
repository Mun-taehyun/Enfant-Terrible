// src/layouts/admin/AdminSidebar.tsx
// src/layouts/admin/AdminSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import type { NavLinkRenderProps } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

// ✅ alias(@) 제거: 상대경로로 고정
import SidebarSection from '../../components/admin/SidebarComp';

import type { AdminNavSection } from '../../types/admin/navigation';

const ADMIN_NAV: AdminNavSection[] = [
  {
    title: '운영',
    items: [
      { label: '쇼핑몰 매출확인', to: '/admin/dashboard' },
      { label: '카테고리 관리', to: '/admin/categories' },
    ],
  },
  {
    title: '상품 제어',
    items: [
      { label: '상품 진열', to: '/admin/products/display' },
      { label: '상품 관리', to: '/admin/products/manage' },
    ],
  },
  {
    title: '고객 소통',
    items: [{ label: '사용자 채팅방 관리', to: '/admin/chat' }],
  },
  {
    title: '회원 관리',
    items: [
      { label: '사용자 정보 조회', to: '/admin/accounts' },
      { label: '주문 목록 조회', to: '/admin/orders' },
      { label: '리뷰 삭제 관리', to: '/admin/reviews' },
    ],
  },
  {
    title: '광고 및 홍보',
    items: [
      { label: '광고 팝업 설정', to: '/admin/popup' },
      { label: '광고 배너 설정', to: '/admin/banner' },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm('로그아웃 하시겠습니까?');
    if (!ok) return;

    // 프로젝트 기준 토큰 키
    localStorage.removeItem('accessToken');

    navigate('/admin/login', { replace: true });
  };

  const linkClassName = ({ isActive }: NavLinkRenderProps) =>
    isActive ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink;

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/admin" className={styles.brand}>
        Admin Panel
      </NavLink>

      <div className={styles.menu}>
        {ADMIN_NAV.map(section => (
          <SidebarSection key={section.title} title={section.title}>
            {section.items.map(item => (
              <NavLink key={item.to} to={item.to} className={linkClassName}>
                {item.label}
              </NavLink>
            ))}
          </SidebarSection>
        ))}
      </div>

      <div className={styles.logoutArea}>
        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
