import { useAuth } from "../features/auth/context/AuthContext";

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-slate-900)" }}>
        Welcome back!
      </h2>
      <p style={{ color: "var(--color-slate-600)" }}>
        Your unique multi-tenant Shop ID is: 
        <code style={{ marginLeft: "0.5rem", background: "var(--color-slate-200)", padding: "0.2rem 0.4rem", borderRadius: "4px", color: "var(--color-slate-900)" }}>
          {user?.uid}
        </code>
      </p>
    </div>
  );
};