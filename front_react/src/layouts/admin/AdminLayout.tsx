import AdminSidebar from "./AdminSidebar";
import AdminOutlet from "./AdminOutlet.tsx";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <AdminOutlet />
    </div>
  );
};

export default AdminLayout;
