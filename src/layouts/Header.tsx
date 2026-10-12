import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { useShopProfile } from "../features/auth/api/shopHooks";
import { authService } from "../features/auth/api/authService";
import { 
  Menu, 
  Sparkles, 
  LogOut, 
  Store, 
  ChevronDown
} from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuToggle: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview Dashboard",
  jobs: "Active Jobs & Workflow",
  calendar: "Service Schedule & Appointments",
  clients: "Client Directory",
  vehicles: "Registered Fleet & Vehicles",
  inventory: "Parts & Supplies Inventory",
  "ai-assistant": "Shop Diagnostic AI Assistant",
  invoice: "Invoice & Handover Receipt",
};

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user } = useAuth();
  const { data: shopProfile } = useShopProfile();
  const { logout } = authService;
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathKey = location.pathname.split("/")[1] || "dashboard";
  const pageTitle = ROUTE_LABELS[pathKey] || pathKey.replace("-", " ");
  
  const shopDisplayName = shopProfile?.shopName || "Serviqa Auto Care";
  const ownerName = shopProfile?.ownerName || user?.email?.split("@")[0] || "Mechanic";
  const avatarInitials = ownerName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className={styles.header}>
      {/* Left: Menu toggle + Brand Breadcrumbs */}
      <div className={styles.leftSection}>
        <button 
          className={styles.menuToggleBtn} 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.breadcrumb}>
          <div className={styles.shopBadge}>
            <Store size={14} className={styles.shopIcon} />
            <span className={styles.shopName}>{shopDisplayName}</span>
          </div>
          <span className={styles.separator}>/</span>
          <h1 className={styles.currentPage}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right: Actions, AI Prompt, and User Dropdown */}
      <div className={styles.rightSection}>
        <div className={styles.liveSyncPill} title="Connected to Realtime Cloud Database">
          <span className={styles.liveDot} />
          <span>Live Sync</span>
        </div>

        <Link 
          to="/ai-assistant" 
          className={styles.aiActionBtn}
          title="Open AI Diagnostic Assistant"
        >
          <Sparkles size={15} className={styles.sparkleIcon} />
          <span>Ask AI</span>
        </Link>
        
        {/* User Profile Dropdown */}
        <div className={styles.profileContainer} ref={dropdownRef}>
          <button 
            className={styles.avatarBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="User profile and shop options"
          >
            <div className={styles.avatarCircle}>{avatarInitials}</div>
            <div className={styles.ownerInfo}>
              <span className={styles.ownerName}>{ownerName}</span>
            </div>
            <ChevronDown size={14} className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ""}`} />
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownShopTitle}>{shopDisplayName}</span>
                <span className={styles.dropdownEmail}>{user?.email}</span>
                {shopProfile?.phoneNumber && (
                  <span className={styles.dropdownPhone}>{shopProfile.phoneNumber}</span>
                )}
              </div>
              <div className={styles.dropdownDivider} />
              <button 
                onClick={handleLogout} 
                className={styles.dropdownItem}
                role="menuitem"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};