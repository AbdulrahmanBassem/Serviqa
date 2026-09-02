import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { LoginForm } from "./features/auth/components/LoginForm";
import { SignupForm } from "./features/auth/components/SignupForm";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Future protected routes (clients, inventory, jobs) will go here */}
        </Route>

        {/* Fallback Route: Redirect any unknown URL to the dashboard (which will then redirect to login if unauthenticated) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;