import { useAuth } from "../features/auth/context/AuthContext";
import styles from "./DashboardLayout.module.css";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user } = useAuth();
  const initial = user?.email?.[0].toUpperCase() || "S";

  return (
    <header className={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button 
          className={styles.menuToggleBtn} 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--color-slate-900)" }}>
          Overview
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
           width: "36px", height: "36px", borderRadius: "50%",
           backgroundColor: "var(--color-primary-100)", color: "var(--color-primary-700)",
           display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
        }}>
          {initial}
        </div>
      </div>
    </header>
  );
};