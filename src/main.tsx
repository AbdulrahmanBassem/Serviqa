import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import { GlobalErrorBoundary } from "./components/errors/GlobalErrorBoundary";
import { AuthProvider } from "./features/auth/context/AuthContext";
import App from "./App.tsx";
import "./styles/variables.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);