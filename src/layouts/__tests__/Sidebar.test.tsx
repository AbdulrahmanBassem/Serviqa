import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "../Sidebar";
import { renderWithProviders } from "../../test-utils/wrapper";

vi.mock("../../features/auth/api/authHooks", () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false })
}));

describe("Sidebar Component", () => {
  it("renders the application title", () => {
    renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Serviqa")).toBeInTheDocument();
  });

  it("renders all core navigation links", () => {
    renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Active Jobs")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Vehicles")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });
});