// src/layouts/admin/AdminSidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

import SidebarSection from "../../components/admin/SidebarComp";
import type { AdminNavSection } from "../../types/admin/navigation";

const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "운영",
    items: [{ label: "쇼핑몰 매출확인", to: "" }],
  },
  {
    title: "상품 제어",
    items: [
      { label: "상품 관리", to: "products" },
      { label: "카테고리 관리", to: "categories" },
      { label: "상품 문의 관리", to: "product-inquiries" },
    ],
  },
  {
    title: "결제·주문",
    items: [
      { label: "주문 관리", to: "orders" },
      { label: "결제 관리", to: "payments" },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      { label: "게시글 관리", to: "posts" },
      { label: "사용자 채팅방 관리", to: "qna" },
    ],
  },
  {
    title: "회원 관리",
    items: [{ label: "사용자 정보 조회", to: "users" }],
  },
  {
    title: "광고 및 홍보",
    items: [
      { label: "광고 팝업 설정", to: "popups" },
      { label: "광고 배너 설정", to: "banners" },
    ],
  },
  {
    title: "추천",
    items: [
      { label: "추천 관리", to: "recommendations" },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm("로그아웃 하시겠습니까?");
    if (!ok) return;

    localStorage.removeItem("accessToken");
    navigate("/admin/login", { replace: true });
  };

  const linkClassName = ({ isActive }: NavLinkRenderProps) =>
    isActive ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink;

  return (
    <aside className={styles.sidebar}>
      <NavLink to="/admin" className={styles.brand}>
        Admin Panel
      </NavLink>

      <div className={styles.menu}>
        {ADMIN_NAV.map((section) => (
          <SidebarSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                className={linkClassName}
                end={item.to === ""}
              >
                {item.label}
              </NavLink>
            ))}
          </SidebarSection>
        ))}
      </div>

      <div className={styles.logoutArea}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
