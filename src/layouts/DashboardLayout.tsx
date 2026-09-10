import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import styles from "./DashboardLayout.module.css";

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAiPage = location.pathname === "/ai-assistant";

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main
        className={styles.main}
        style={
          isAiPage
            ? {
                padding: 0,
                overflow: "hidden",
                position: "relative",
                display: "flex" ,
              }
            : {}
        }
      >
        <Outlet />
      </main>
    </div>
  );
};
