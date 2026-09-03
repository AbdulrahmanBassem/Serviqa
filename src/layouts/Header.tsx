import { useAuth } from "../features/auth/context/AuthContext";
import styles from "./DashboardLayout.module.css";

export const Header = () => {
  const { user } = useAuth();
  const initial = user?.email?.[0].toUpperCase() || "S";

  return (
    <header className={styles.header}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--color-slate-900)" }}>
        Overview
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "0.875rem", color: "var(--color-slate-600)", fontWeight: "500" }}>
          {user?.email}
        </span>
        <div style={{ 
          width: "36px", 
          height: "36px", 
          borderRadius: "50%", 
          backgroundColor: "var(--color-primary-100)",
          color: "var(--color-primary-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}>
          {initial}
        </div>
      </div>
    </header>
  );
};