import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginForm } from "./features/auth/components/LoginForm";
import { SignupForm } from "./features/auth/components/SignupForm";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Temporary placeholders for the sidebar links to prevent routing errors */}
            <Route path="/jobs" element={<div>Active Jobs Module Loading...</div>} />
            <Route path="/clients" element={<div>Clients Module Loading...</div>} />
            <Route path="/vehicles" element={<div>Vehicles Module Loading...</div>} />
            <Route path="/inventory" element={<div>Inventory Module Loading...</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;