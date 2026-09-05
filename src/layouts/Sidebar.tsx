import { NavLink } from "react-router-dom";
import { Wrench, LayoutDashboard, Kanban, Users, Car, Package, LogOut, Bot } from "lucide-react";
import { authService } from "../features/auth/api/authService";
import styles from "./DashboardLayout.module.css";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Active Jobs", path: "/jobs", icon: Kanban },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Vehicles", path: "/vehicles", icon: Car },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot }
];

export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Wrench size={24} color="var(--color-primary-600)" />
        Serviqa
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <button onClick={() => authService.logout()} className={styles.logoutBtn}>
        <LogOut size={20} />
        Log Out
      </button>
    </aside>
  );
};