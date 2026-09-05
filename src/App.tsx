import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginForm } from "./features/auth/components/LoginForm";
import { SignupForm } from "./features/auth/components/SignupForm";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Vehicles } from "./pages/Vehicles";
import { Jobs } from "./pages/Jobs";
import { Inventory } from "./pages/Inventory";
import { AiAssistant } from "./pages/AiAssistant";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;