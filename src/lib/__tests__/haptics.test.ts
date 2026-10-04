import { afterEach, describe, expect, it, vi } from "vitest";
import { vibrate, vibrateLight, vibrateSuccess, vibrateWarning } from "@/lib/haptics";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("haptics", () => {
  it("no-ops when navigator is unavailable", () => {
    vi.stubGlobal("navigator", undefined);

    expect(() => vibrate()).not.toThrow();
    expect(() => vibrateSuccess()).not.toThrow();
    expect(() => vibrateWarning()).not.toThrow();
  });

  it("no-ops when navigator has no vibrate method", () => {
    vi.stubGlobal("navigator", {});

    expect(() => vibrate()).not.toThrow();
    expect(() => vibrateSuccess()).not.toThrow();
    expect(() => vibrateWarning()).not.toThrow();
  });

  it("vibrates for the given duration", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    vibrate(25);

    expect(vibrateMock).toHaveBeenCalledWith(25);
  });

  it("defaults to a short 10ms pulse", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    vibrate();

    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it("vibrateLight uses the same short pulse", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    vibrateLight();

    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it("vibrateSuccess uses a two-burst pattern", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    vibrateSuccess();

    expect(vibrateMock).toHaveBeenCalledWith([10, 30, 15]);
  });

  it("vibrateWarning uses a heavier two-burst pattern", () => {
    const vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });

    vibrateWarning();

    expect(vibrateMock).toHaveBeenCalledWith([20, 40, 20]);
  });
});
