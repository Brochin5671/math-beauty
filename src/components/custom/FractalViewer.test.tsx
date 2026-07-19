import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByLabelText("Zoom")).toHaveValue("1");
    await user.click(screen.getByRole("button", { name: "Increase Zoom" }));
    expect(screen.getByLabelText("Zoom")).toHaveValue("1.15");
  });

  it("commits a directly typed zoom value on blur", async () => {
    const ctx = stubCanvas();
    const user = userEvent.setup();
    render(<FractalViewer />);
    const zoom = screen.getByLabelText("Zoom");
    await user.clear(zoom);
    await user.type(zoom, "3");
    ctx.putImageData.mockClear();
    await user.tab();
    expect(zoom).toHaveValue("3");
    // The commit reaches the draw state, not only the display
    expect(ctx.putImageData).toHaveBeenCalled();

    // Blurring re-arms the controlled sync, without which the field would stop
    // reflecting programmatic updates such as Reset
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(zoom).toHaveValue("1");
  });

  it("commits a typed value on Enter", async () => {
    const ctx = stubCanvas();
    const user = userEvent.setup();
    render(<FractalViewer />);
    const zoom = screen.getByLabelText("Zoom");
    await user.clear(zoom);
    await user.type(zoom, "3");
    ctx.putImageData.mockClear();
    await user.keyboard("{Enter}");
    expect(ctx.putImageData).toHaveBeenCalled();
  });

  it("refuses a zero zoom, which would divide by zero in the coordinate mapping", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    const zoom = screen.getByLabelText("Zoom");
    await user.clear(zoom);
    await user.type(zoom, "0");
    await user.tab();
    // The camera keeps the last drawable value and the field is put back to match
    expect(zoom).toHaveValue("1");
  });

  it("refuses a value too large for the coordinate mapping", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    const panX = screen.getByLabelText("Pan X");
    await user.click(panX);
    // All digits, so the input accepts the characters, but the number overflows to Infinity
    fireEvent.change(panX, { target: { value: "9".repeat(320) } });
    await user.tab();

    // The camera kept its drawable value, so panning still steps from zero
    await user.keyboard("d");
    expect(screen.getByLabelText("Pan X")).toHaveValue("25");
  });

  it("does not redraw when a field is focused and left unchanged", async () => {
    const ctx = stubCanvas();
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByLabelText("Pan X"));
    ctx.putImageData.mockClear();
    await user.tab();
    expect(ctx.putImageData).not.toHaveBeenCalled();
  });

  it("keeps the camera shortcuts alive after a stepper button takes focus", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("button", { name: "Increase Zoom" }));
    await user.keyboard("d");
    expect(screen.getByLabelText("Pan X")).toHaveValue("25");
  });

  it("pans with the x and y steppers", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("button", { name: "Increase Pan X" }));
    expect(screen.getByLabelText("Pan X")).toHaveValue("25");
    await user.click(screen.getByRole("button", { name: "Decrease Pan Y" }));
    expect(screen.getByLabelText("Pan Y")).toHaveValue("-25");
  });

  it("resets the camera with the Reset button", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("button", { name: "Increase Pan X" }));
    await user.click(screen.getByRole("button", { name: "Increase Zoom" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("Pan X")).toHaveValue("0");
    expect(screen.getByLabelText("Zoom")).toHaveValue("1");
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
    const cr = screen.getByLabelText("Complex Real");
    const ci = screen.getByLabelText("Complex Imaginary");
    expect(cr).toHaveValue("-0.70176");
    await user.click(screen.getByRole("button", { name: "Increase Complex Real" }));
    expect(cr).toHaveValue("-0.45176");
    await user.click(screen.getByRole("button", { name: "Decrease Complex Imaginary" }));
    expect(ci).toHaveValue("0.3342");
  });

  it("lets the complex real input overshoot its bound by one step, then stops", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("switch", { name: "Julia Set" }));
    const decrease = screen.getByRole("button", { name: "Decrease Complex Real" });

    // -0.70176 less six 0.25 steps lands one step past -2, which the guard allows
    for (let i = 0; i < 6; i++) await user.click(decrease);
    expect(screen.getByLabelText("Complex Real")).toHaveValue("-2.20176");

    expect(decrease).toBeDisabled();
  });

  it("reveals and steps the exponent input for the Multibrot set", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    expect(screen.queryByLabelText("Exponent")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Fractal"), "multibrot");
    expect(screen.getByLabelText("Exponent")).toHaveValue("2");
    await user.click(screen.getByRole("button", { name: "Increase Exponent" }));
    expect(screen.getByLabelText("Exponent")).toHaveValue("2.25");
  });

  it("runs every keyboard camera shortcut", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.keyboard("d");
    expect(screen.getByLabelText("Pan X")).toHaveValue("25");
    await user.keyboard("w");
    expect(screen.getByLabelText("Pan Y")).toHaveValue("25");
    await user.keyboard("q");
    expect(screen.getByLabelText("Zoom")).toHaveValue("1.15");
    await user.keyboard("z");
    expect(screen.getByLabelText("Iterations")).toHaveValue("200");
    await user.keyboard("r");
    expect(screen.getByLabelText("Pan X")).toHaveValue("0");
    expect(screen.getByLabelText("Zoom")).toHaveValue("1");
    expect(screen.getByLabelText("Iterations")).toHaveValue("100");
    await user.keyboard("a");
    expect(screen.getByLabelText("Pan X")).toHaveValue("-25");
    await user.keyboard("s");
    expect(screen.getByLabelText("Pan Y")).toHaveValue("-25");
    // e zooms out, x holds iterations at the floor
    await user.keyboard("ex");
    expect(screen.getByLabelText("Iterations")).toHaveValue("100");
  });

  it("zooms toward the clicked point on canvas click", async () => {
    const user = userEvent.setup();
    render(<FractalViewer />);
    await user.click(screen.getByRole("img", { name: /Mandelbrot Set/ }));
    expect(screen.getByLabelText("Zoom")).toHaveValue("1.15");
    // happy-dom reports a zero-size rect, which the backing scale has to survive without
    // poisoning the offsets
    expect(screen.getByLabelText("Pan X")).toHaveValue("0");
    expect(screen.getByLabelText("Pan Y")).toHaveValue("0");
  });

  describe("canvas gestures", () => {
    const getCanvas = () => screen.getByRole("img", { name: /Mandelbrot Set/ });
    const zoomValue = () => Number((screen.getByLabelText("Zoom") as HTMLInputElement).value);

    // happy-dom drops the pointer coordinates from a WheelEvent init, and a wheel with no
    // anchor is refused as a NaN camera step, so set them the way a browser would
    const wheel = (target: HTMLElement, deltaY: number, deltaMode = 0) => {
      const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY, deltaMode });
      Object.defineProperty(event, "clientX", { value: 160, configurable: true });
      Object.defineProperty(event, "clientY", { value: 160, configurable: true });
      fireEvent(target, event);
    };

    it("pans the camera with a pointer drag", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 140, clientY: 125 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });

      // The image follows the pointer, so the offsets move opposite on x and with it on y
      await waitFor(() => {
        expect(screen.getByLabelText("Pan X")).toHaveValue("-40");
        expect(screen.getByLabelText("Pan Y")).toHaveValue("25");
      });
    });

    it("holds a sub-threshold move until the press becomes a drag", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      // Under the threshold, so nothing moves yet and the anchor is not advanced
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 102, clientY: 100 });
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 110, clientY: 100 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });

      // The full 10px from the press point, not 8 from the ignored move nor 12 counting it twice
      await waitFor(() => expect(screen.getByLabelText("Pan X")).toHaveValue("-10"));
    });

    it("does not zoom on the click that closes a drag", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 140, clientY: 100 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });
      fireEvent.click(canvas);
      await waitFor(() => expect(screen.getByLabelText("Pan X")).toHaveValue("-40"));
      expect(zoomValue()).toBe(1);
    });

    it("still zooms on a tap that never became a drag", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });
      fireEvent.click(canvas);
      expect(zoomValue()).toBeCloseTo(1.15, 5);
    });

    it.each([
      ["pixel", 0],
      ["line", 1],
    ])("zooms in on a %s-mode wheel scroll", async (_mode, deltaMode) => {
      render(<FractalViewer />);
      wheel(getCanvas(), -100, deltaMode);
      await waitFor(() => expect(zoomValue()).toBeGreaterThan(1));
    });

    it("bounds a runaway wheel delta to one step", async () => {
      render(<FractalViewer />);
      // Page-mode deltas multiply by the element height, so an unbounded factor here
      // would zoom by many orders of magnitude in a single event
      wheel(getCanvas(), -100000);
      await waitFor(() => expect(zoomValue()).toBeGreaterThan(1));
      expect(zoomValue()).toBeLessThanOrEqual(4);
    });

    it("zooms out on a wheel scroll the other way", async () => {
      render(<FractalViewer />);
      wheel(getCanvas(), 100);
      await waitFor(() => expect(zoomValue()).toBeLessThan(1));
    });

    it("zooms with a two-pointer pinch", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerDown(canvas, { pointerId: 2, clientX: 120, clientY: 100 });
      // Spreading the fingers from 20px apart to 60px is a threefold zoom
      fireEvent.pointerMove(canvas, { pointerId: 2, clientX: 160, clientY: 100 });
      await waitFor(() => expect(zoomValue()).toBeCloseTo(3, 5));

      fireEvent.pointerCancel(canvas, { pointerId: 1 });
      fireEvent.pointerCancel(canvas, { pointerId: 2 });
    });

    it("ignores a move from a pointer that never went down", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      // A stray pointer must not register as a second finger nor move the camera
      fireEvent.pointerMove(canvas, { pointerId: 9, clientX: 300, clientY: 300 });
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 140, clientY: 100 });

      // Only the tracked pointer counted, so the pan is its 40px and the zoom never moved
      await waitFor(() => expect(screen.getByLabelText("Pan X")).toHaveValue("-40"));
      expect(zoomValue()).toBe(1);
    });

    it("survives two pointers meeting at the same spot, which would zoom to zero", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerDown(canvas, { pointerId: 2, clientX: 140, clientY: 100 });
      // Pinching the fingers together reports zero distance, a factor of zero
      fireEvent.pointerMove(canvas, { pointerId: 2, clientX: 100, clientY: 100 });

      // A zero zoom would divide by zero in seed and blank the canvas for good
      await waitFor(() => expect(zoomValue()).not.toBe(0));
      expect(zoomValue()).toBeGreaterThan(0);
    });

    it("re-measures the pinch when a finger lifts, instead of against the lifted one", async () => {
      render(<FractalViewer />);
      const canvas = getCanvas();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerDown(canvas, { pointerId: 2, clientX: 300, clientY: 100 });
      fireEvent.pointerDown(canvas, { pointerId: 3, clientX: 303, clientY: 100 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });
      // Measured against the lifted pair this reads as a 66x zoom out in one event
      fireEvent.pointerMove(canvas, { pointerId: 3, clientX: 306, clientY: 100 });

      await waitFor(() => expect(zoomValue()).toBeGreaterThan(0.5));
    });

    it("moves the camera without drawing while auto-render is off", async () => {
      const ctx = stubCanvas();
      const user = userEvent.setup();
      render(<FractalViewer />);
      await user.click(screen.getByRole("tab", { name: "Render" }));
      await user.click(screen.getByRole("switch", { name: "Auto-render" }));
      await user.click(screen.getByRole("tab", { name: "Camera" }));

      const canvas = getCanvas();
      ctx.putImageData.mockClear();
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 140, clientY: 100 });

      await waitFor(() => expect(screen.getByLabelText("Pan X")).toHaveValue("-40"));
      expect(ctx.putImageData).not.toHaveBeenCalled();
    });
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
