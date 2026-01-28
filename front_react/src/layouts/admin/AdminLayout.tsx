import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
