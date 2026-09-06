import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientModal } from "../ClientModal";
import { renderWithProviders } from "../../../../test-utils/wrapper";
import * as clientHooks from "../../api/clientHooks";

// Intercept the API hooks to prevent real database calls
vi.mock("../../api/clientHooks");

describe("ClientModal Integration", () => {
  const mockCreateMutate = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Dynamically grab the exact type TanStack query expects
    vi.mocked(clientHooks.useCreateClient).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof clientHooks.useCreateClient>);
    
    vi.mocked(clientHooks.useUpdateClient).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof clientHooks.useUpdateClient>);
  });

  it("submits the form and triggers the create mutation with the correct payload", async () => {
    // userEvent perfectly simulates real browser typing and clicking
    const user = userEvent.setup();
    renderWithProviders(<ClientModal isOpen={true} onClose={mockClose} />);

    // Target the inputs by their accessible labels
    await user.type(screen.getByLabelText(/Full Name \*/i), "John Doe");
    await user.type(screen.getByLabelText(/Phone Number \*/i), "01001234567");
    await user.type(screen.getByLabelText(/Email Address/i), "john@example.com");
    
    // Trigger the form submission
    await user.click(screen.getByRole("button", { name: /Save Client/i }));

    // Assert the payload matches exactly what we expect
    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        fullName: "John Doe",
        phoneNumber: "01001234567",
        email: "john@example.com",
      },
      expect.any(Object)
    );
  });

  it("safely strips empty optional fields to prevent Firestore crashes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientModal isOpen={true} onClose={mockClose} />);

    await user.type(screen.getByLabelText(/Full Name \*/i), "Jane Doe");
    await user.type(screen.getByLabelText(/Phone Number \*/i), "01098765432");
    
    // Leave email and notes completely blank

    await user.click(screen.getByRole("button", { name: /Save Client/i }));

    // Assert that 'email' and 'notes' are completely missing from the payload
    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        fullName: "Jane Doe",
        phoneNumber: "01098765432",
      },
      expect.any(Object)
    );
  });
});