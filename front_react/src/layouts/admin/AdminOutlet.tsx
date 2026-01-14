//src/layouts/admin/AdminOutlet.tsx

import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminOutlet = () => {
  return (
    <main className={styles.main}>
      <Outlet />
    </main>
  );
};

export default AdminOutlet;
