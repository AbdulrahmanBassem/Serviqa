import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobModal } from "../JobModal";
import { renderWithProviders } from "../../../../test-utils/wrapper";

// 1. Use exact relative paths from /jobs/components/__tests__/
// 2. Explicitly tell Vitest to treat these as mock functions
vi.mock("../../../clients/api/clientHooks", () => ({
  useClients: vi.fn(),
}));

vi.mock("../../../vehicles/api/vehicleHooks", () => ({
  useVehicles: vi.fn(),
}));

vi.mock("../../api/jobHooks", () => ({
  useCreateJob: vi.fn(),
  useUpdateJob: vi.fn(),
}));

// Import the specific hooks directly
import { useClients } from "../../../clients/api/clientHooks";
import { useVehicles } from "../../../vehicles/api/vehicleHooks";
import { useCreateJob, useUpdateJob } from "../../api/jobHooks";

describe("JobModal Relational Logic Integration", () => {
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateJob).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateJob>);

    vi.mocked(useUpdateJob).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateJob>);

    vi.mocked(useClients).mockReturnValue({
      data: [
        { id: "client-1", fullName: "Alice" },
        { id: "client-2", fullName: "Bob" }
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useClients>);

    vi.mocked(useVehicles).mockReturnValue({
      data: [
        { id: "veh-1", make: "Toyota", model: "Camry", clientId: "client-1" },
        { id: "veh-2", make: "Honda", model: "Civic", clientId: "client-2" },
        { id: "veh-3", make: "Ford", model: "Focus", clientId: "client-1" }
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useVehicles>);
  });

  // Keep your existing `it` block here...
  it("filters the vehicle dropdown based on the selected client", async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobModal isOpen={true} onClose={mockClose} />);

    // 1. Locate the Client and Vehicle dropdowns by their associated labels
    const clientDropdown = screen.getByLabelText(/Client/i) as HTMLSelectElement;
    const vehicleDropdown = screen.getByLabelText(/Vehicle/i) as HTMLSelectElement;

    // 2. Verify all vehicles are either disabled or hidden before a client is selected
    // (Depending on your UI logic, the dropdown might be disabled entirely)
    if (!vehicleDropdown.disabled) {
      expect(screen.queryByText(/Honda Civic/i)).not.toBeInTheDocument();
    }

    // 3. Select 'Alice' (client-1)
    await user.selectOptions(clientDropdown, "client-1");

    // 4. Verify only Alice's cars appear as selectable options
    expect(screen.getByText(/Toyota Camry/i)).toBeInTheDocument();
    expect(screen.getByText(/Ford Focus/i)).toBeInTheDocument();
    
    // 5. Verify Bob's car does NOT appear
    expect(screen.queryByText(/Honda Civic/i)).not.toBeInTheDocument();
  });
});