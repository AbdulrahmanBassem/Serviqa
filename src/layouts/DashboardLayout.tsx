import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import styles from "./DashboardLayout.module.css";

export const DashboardLayout = () => {
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const location = useLocation();
  const isAiPage = location.pathname === "/ai-assistant";

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuPath((openPath) =>
        openPath === location.pathname ? null : location.pathname,
      );
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    }
  };

  return (
    <div className={`${styles.layout} ${isDesktopCollapsed ? styles.collapsedLayout : ""}`}>
      <Sidebar
        isOpen={mobileMenuPath === location.pathname}
        isCollapsed={isDesktopCollapsed}
        onClose={() => setMobileMenuPath(null)}
      />
      <Header onMenuToggle={handleMenuToggle} />
      <main
        className={styles.main}
        style={isAiPage ? { padding: 0 } : {}}
      >
        <Outlet />
      </main>
    </div>
  );
};