import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import styles from "./DashboardLayout.module.css";

export const DashboardLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};