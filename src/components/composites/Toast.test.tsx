import { render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it } from "vitest";
import { Toast } from "./Toast";

// Toast wraps sonner's Toaster. We cover that our Toaster mounts the live region
// and surfaces dispatched toasts; sonner's queueing/animation internals are not
// re-tested.
afterEach(() => toast.dismiss());

describe("Toast", () => {
  it("renders the sonner notifications region", () => {
    render(<Toast />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("surfaces a message dispatched through sonner", async () => {
    render(<Toast />);
    toast("Saved successfully");
    expect(await screen.findByText("Saved successfully")).toBeInTheDocument();
  });
});
