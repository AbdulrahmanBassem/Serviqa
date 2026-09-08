import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { authService } from "../features/auth/api/authService";
import { Menu, Sparkles } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user } = useAuth();
  const { logout } = authService;
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Parse current route for the breadcrumb (e.g., "/inventory" -> "inventory")
  const currentPath = location.pathname.split("/").pop() || "dashboard";
  
  const initial = user?.email?.[0].toUpperCase() || "S";
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className={styles.header}>
      {/* Functional Breadcrumb */}
      <div className={styles.leftSection}>
        <button 
          className={styles.menuToggleBtn} 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <div className={styles.breadcrumb}>
          <span className={styles.separator}>/</span>
          <h1 className={styles.currentPage}>{currentPath}</h1>
        </div>
      </div>

      {/* Functional Actions */}
      <div className={styles.rightSection}>
        <Link to="/ai-assistant" className={styles.actionBtn}>
          <Sparkles size={16} />
          <span>Ask AI</span>
        </Link>
        
        <div className={styles.profileContainer}>
          <button 
            className={styles.avatarBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            aria-label="User menu"
          >
            {initial}
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};