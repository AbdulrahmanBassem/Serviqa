import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../features/auth/context/AuthContext";
import type { User } from "firebase/auth"; // Import the official type

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  const testQueryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={testQueryClient}>
      {/* Safely cast the mock user object */}
      <AuthContext.Provider value={{ user: { uid: 'mock-shop-id' } as unknown as User, isLoading: false }}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};