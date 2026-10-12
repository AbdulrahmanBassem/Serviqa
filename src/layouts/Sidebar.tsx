import { NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, Users, Car, Package, LogOut, Bot, X, Calendar, Wrench } from "lucide-react";
import { authService } from "../features/auth/api/authService";
import styles from "./DashboardLayout.module.css";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Active Jobs", path: "/jobs", icon: Kanban },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Vehicles", path: "/vehicles", icon: Car },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot, isSpecial: true }
];

export const Sidebar = ({ isOpen, isCollapsed, onClose }: SidebarProps) => {
  return (
    <>
      {isOpen && <div className={styles.mobileBackdrop} onClick={onClose} aria-hidden="true" />}
      <aside 
        className={`${styles.sidebar} ${isOpen ? styles.open : ""} ${isCollapsed ? styles.collapsed : ""}`}
        aria-label="Main Navigation"
      >
        <div className={styles.brandContainer}>
          <div className={styles.brandLogoWrapper}>
            <img
              src="/serviqa logo blue.png"
              alt="Serviqa Logo"
              className={styles.logoFull}
            />
            <img
              src="/serviqa icon.png"
              alt="Serviqa Icon"
              className={styles.logoIcon}
            />
            <span className={styles.brandTitle}>Serviqa</span>
          </div>
          <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSectionLabel}>
            {!isCollapsed && <span>MAIN WORKSPACE</span>}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              title={item.name}
              className={({ isActive }) =>
                isActive 
                  ? `${styles.navItem} ${styles.activeNavItem} ${item.isSpecial ? styles.specialNavItem : ""}` 
                  : `${styles.navItem} ${item.isSpecial ? styles.specialNavItemMuted : ""}`
              }
            >
              <item.icon size={19} className={styles.navIcon} />
              <span className={styles.navText}>{item.name}</span>
              {item.isSpecial && !isCollapsed && (
                <span className={styles.aiBadge}>AI</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {!isCollapsed && (
            <div className={styles.proTipBox}>
              <div className={styles.proTipHeader}>
                <Wrench size={14} color="var(--color-primary-600)" />
                <span>Shop Pro</span>
              </div>
              <p>v2.4 Production Suite</p>
            </div>
          )}
          <button 
            onClick={() => authService.logout()} 
            className={styles.logoutBtn} 
            title="Log Out"
            aria-label="Log out of account"
          >
            <LogOut size={18} className={styles.navIcon} />
            <span className={styles.navText}>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};