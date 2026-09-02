import { useAuth } from "../features/auth/context/AuthContext";
import { authService } from "../features/auth/api/authService";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Shop Dashboard</h1>
      <p>Welcome! Your Firebase User ID (Shop ID) is: <strong>{user?.uid}</strong></p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Log Out
      </button>
    </div>
  );
};