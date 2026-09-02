import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./config/queryClient";
import { GlobalErrorBoundary } from "./components/errors/GlobalErrorBoundary";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/context/AuthContext.tsx";
import "./styles/variables.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);