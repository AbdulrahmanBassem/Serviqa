import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../Dashboard";
import { renderWithProviders } from "../../test-utils/wrapper";
import * as clientHooks from "../../features/clients/api/clientHooks";
import * as jobHooks from "../../features/jobs/api/jobHooks";
import * as inventoryHooks from "../../features/inventory/api/inventoryHooks";

// Intercept the API hooks to provide controlled data sets
vi.mock("../../features/clients/api/clientHooks");
vi.mock("../../features/jobs/api/jobHooks");
vi.mock("../../features/inventory/api/inventoryHooks");

describe("Dashboard Analytics Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(clientHooks.useClients).mockReturnValue({
      data: [{ id: "c1", fullName: "Alice" }, { id: "c2", fullName: "Bob" }],
      isLoading: false,
    } as unknown as ReturnType<typeof clientHooks.useClients>);

    vi.mocked(jobHooks.useJobs).mockReturnValue({
      data: [
        { id: "j1", status: "todo", estimatedCost: 150, title: "Oil Change" },
        { id: "j2", status: "in-progress", estimatedCost: 350, title: "Brakes" },
        { id: "j3", status: "done", estimatedCost: 1000, title: "Engine Swap" }, // Should be excluded from active revenue
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof jobHooks.useJobs>);

    vi.mocked(inventoryHooks.useInventory).mockReturnValue({
      data: [
        { id: "i1", itemName: "Oil Filter", quantity: 2 }, // Low stock
        { id: "i2", itemName: "Brake Pads", quantity: 20 }, // Normal stock
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof inventoryHooks.useInventory>);
  });

  it("calculates and renders the correct metric totals based on live data", () => {
    renderWithProviders(<Dashboard />);

    // Target the cards by their visible titles, then assert the expected number exists inside the same card wrapper
    const activeJobsCard = screen.getByText("Active Jobs").parentElement?.parentElement;
    expect(activeJobsCard).toHaveTextContent("2");
    
    const totalClientsCard = screen.getByText("Total Clients").parentElement?.parentElement;
    expect(totalClientsCard).toHaveTextContent("2");

    const pendingRevenueCard = screen.getByText("Pending Revenue").parentElement?.parentElement;
    expect(pendingRevenueCard).toHaveTextContent("$500.00");

    const lowStockCard = screen.getByText("Low Stock Alerts").parentElement?.parentElement;
    expect(lowStockCard).toHaveTextContent("1");
  });

  it("displays the recent active jobs and low stock alerts lists", () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("Oil Change")).toBeInTheDocument();
    expect(screen.getByText("Brakes")).toBeInTheDocument();
    
    // Engine Swap is 'done', so it shouldn't be in the active list
    expect(screen.queryByText("Engine Swap")).not.toBeInTheDocument(); 

    // Low stock alert list
    expect(screen.getByText("Oil Filter")).toBeInTheDocument();
    expect(screen.getByText("2 left")).toBeInTheDocument();
  });
});