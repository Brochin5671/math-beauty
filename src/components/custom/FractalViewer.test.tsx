import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FractalViewer } from "./FractalViewer";

// happy-dom has no real 2D context, stub a functional one so the render loop
// runs and the island's draw wiring is exercised
function stubCanvas() {
  const ctx = {
    createImageData: (w: number) => ({ data: new Uint8ClampedArray(w * 4) }),
    putImageData: vi.fn(),
    clearRect: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  return ctx;
}

describe("FractalViewer", () => {
  beforeEach(() => {
    stubCanvas();
  });

  it("renders the canvas and both control tabs without crashing", () => {
    render(<FractalViewer />);
    expect(screen.getByRole("img", { name: /Mandelbrot Set/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Camera" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Render" })).toBeInTheDocument();
  });

  it("draws on mount via the stubbed context", () => {
    const ctx = stubCanvas();
    render(<FractalViewer />);
    expect(ctx.putImageData).toHaveBeenCalled();
  });

  it("steps the zoom value with the increase button", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    expect(screen.getByLabelText("Zoom")).toHaveValue(1);
    await user.click(screen.getByRole("button", { name: "Increase Zoom" }));
    expect(screen.getByLabelText("Zoom")).toHaveValue(1.15);
  });

  it("commits a directly typed zoom value on blur", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    const zoom = screen.getByLabelText("Zoom");
    await user.clear(zoom);
    await user.type(zoom, "3");
    await user.tab();
    expect(zoom).toHaveValue(3);
  });

  it("pans with the x and y steppers", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("button", { name: "Increase Pan X" }));
    expect(screen.getByLabelText("Pan X")).toHaveValue(25);
    await user.click(screen.getByRole("button", { name: "Decrease Pan Y" }));
    expect(screen.getByLabelText("Pan Y")).toHaveValue(-25);
  });

  it("resets the camera with the Reset button", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("button", { name: "Increase Pan X" }));
    await user.click(screen.getByRole("button", { name: "Increase Zoom" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("Pan X")).toHaveValue(0);
    expect(screen.getByLabelText("Zoom")).toHaveValue(1);
  });

  it("force-draws when Render is pressed", async () => {
    const ctx = stubCanvas();
    const user = userEvent.setup();
    render(<FractalViewer />);
    ctx.putImageData.mockClear();
    await user.click(screen.getByRole("button", { name: "Render" }));
    expect(ctx.putImageData).toHaveBeenCalled();
  });

  it("reveals the complex inputs when Julia Set is toggled on and steps them", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    expect(screen.queryByLabelText("Complex Real")).not.toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Julia Set" }));
    const cr = screen.getByLabelText("Complex Real") as HTMLInputElement;
    const ci = screen.getByLabelText("Complex Imaginary") as HTMLInputElement;
    expect(cr).toHaveValue(-0.70176);
    await user.click(screen.getByRole("button", { name: "Increase Complex Real" }));
    expect(cr.valueAsNumber).toBeCloseTo(-0.45176, 5);
    await user.click(screen.getByRole("button", { name: "Decrease Complex Imaginary" }));
    expect(ci.valueAsNumber).toBeCloseTo(0.3342, 5);
  });

  it("reveals and steps the exponent input for the Multibrot set", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    expect(screen.queryByLabelText("Exponent")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Fractal"), "multibrot");
    expect(screen.getByLabelText("Exponent")).toHaveValue(2);
    await user.click(screen.getByRole("button", { name: "Increase Exponent" }));
    expect(screen.getByLabelText("Exponent")).toHaveValue(2.25);
  });

  it("runs every keyboard camera shortcut", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.keyboard("d");
    expect(screen.getByLabelText("Pan X")).toHaveValue(25);
    await user.keyboard("w");
    expect(screen.getByLabelText("Pan Y")).toHaveValue(25);
    await user.keyboard("q");
    expect(screen.getByLabelText("Zoom")).toHaveValue(1.15);
    await user.keyboard("z");
    expect(screen.getByLabelText("Iterations")).toHaveValue(200);
    await user.keyboard("r");
    expect(screen.getByLabelText("Pan X")).toHaveValue(0);
    expect(screen.getByLabelText("Zoom")).toHaveValue(1);
    expect(screen.getByLabelText("Iterations")).toHaveValue(100);
    await user.keyboard("a");
    expect(screen.getByLabelText("Pan X")).toHaveValue(-25);
    await user.keyboard("s");
    expect(screen.getByLabelText("Pan Y")).toHaveValue(-25);
    // e zooms out, x holds iterations at the floor
    await user.keyboard("ex");
    expect(screen.getByLabelText("Iterations")).toHaveValue(100);
  });

  it("zooms toward the clicked point on canvas click", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("img", { name: /Mandelbrot Set/ }));
    expect(screen.getByLabelText("Zoom")).toHaveValue(1.15);
    // happy-dom reports a zero-size rect, which the backing scale has to survive without
    // poisoning the offsets
    expect(screen.getByLabelText("Pan X")).toHaveValue(0);
    expect(screen.getByLabelText("Pan Y")).toHaveValue(0);
  });

  it("changes coloring method, preset, gradient loop and auto-render on the Render tab", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("tab", { name: "Render" }));
    // clicking the label drives the coloring-method radio
    await user.click(screen.getByText("Smooth"));
    await user.selectOptions(screen.getByLabelText("Color preset"), "temperature");
    expect(screen.getByLabelText("Color preset")).toHaveValue("temperature");
    const loop = screen.getByRole("switch", { name: "Gradient Loop" });
    const loopBefore = loop.getAttribute("aria-checked");
    await user.click(loop);
    expect(loop.getAttribute("aria-checked")).not.toBe(loopBefore);
    const auto = screen.getByRole("switch", { name: "Auto-render" });
    await user.click(auto);
    expect(auto).not.toBeChecked();
  });

  it("exposes the three color sliders and preset picker on the Render tab", async () => {
    // Base UI keeps slider thumbs role-less until it measures layout, which
    // happy-dom lacks, so count the slider roots by data-slot instead of role
    const user = userEvent.setup();
    const { container } = render(<FractalViewer />);
    await user.click(screen.getByRole("tab", { name: "Render" }));
    expect(container.querySelectorAll('[data-slot="slider"]')).toHaveLength(3);
    expect(screen.getByLabelText("Color preset")).toBeInTheDocument();
  });
});
