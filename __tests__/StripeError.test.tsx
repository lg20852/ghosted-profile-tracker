
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GhostCard from "../src/components/GhostCard";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Mock the supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: jest.fn()
    }
  }
}));

const mockGhost = {
  id: "1",
  name: "Test Company",
  company: "Test Company Inc.",
  spookCount: 3,
  lastSeen: new Date(),
  status: "active",
  photoURL: null,
  victimVenmos: []
};

describe("GhostCard with Stripe errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders properly when checkout fails", async () => {
    // Mock the Stripe checkout to fail
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      error: { message: "Failed to create checkout session" },
      data: null
    });

    render(
      <BrowserRouter>
        <GhostCard ghost={mockGhost} />
      </BrowserRouter>
    );

    // Find and click the "Settle Report" button
    const settleButton = screen.getByText(/Settle Report/i);
    fireEvent.click(settleButton);

    // Check that loading state is shown
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Payment Error/i)).toBeInTheDocument();
    });

    // Check that error message is shown
    expect(screen.getByText(/Failed to create checkout session/i)).toBeInTheDocument();

    // Find and click the "Try Again" button
    const retryButton = screen.getByText(/Try Again/i);
    expect(retryButton).toBeInTheDocument();
  });
});
