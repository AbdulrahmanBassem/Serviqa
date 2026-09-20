import { NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, Users, Car, Package, LogOut, Bot, X, Calendar } from "lucide-react";
import { authService } from "../features/auth/api/authService";

// Import both your full logo and your icon-only logo
import logoFull from "/serviqa logo blue.png";
import logoIcon from "/serviqa icon.png"; // Add this file to your public folder!

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
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot }
];

export const Sidebar = ({ isOpen, isCollapsed, onClose }: SidebarProps) => {
  return (
    <>
      {isOpen && <div className={styles.mobileBackdrop} onClick={onClose} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""} ${isCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.brandContainer}>
          {/* Render both images, we will show/hide them via CSS */}
          <img
            src={logoFull}
            alt="Serviqa Logo"
            className={styles.logoFull}
          />
          <img
            src={logoIcon}
            alt="Serviqa Icon"
            className={styles.logoIcon}
          />
          <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              title={item.name}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem
              }
            >
              <item.icon size={20} className={styles.navIcon} />
              <span className={styles.navText}>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={() => authService.logout()} className={styles.logoutBtn} title="Log Out">
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navText}>Log Out</span>
        </button>
      </aside>
    </>
  );
};