import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initMock = vi.fn();

vi.mock("@microsoft/clarity", () => ({
  default: {
    init: (...args: unknown[]) => initMock(...args),
  },
}));

describe("initClarity", () => {
  let clarityScriptPresent = false;
  let windowClarity: ((...args: unknown[]) => void) | undefined;

  beforeEach(() => {
    initMock.mockClear();
    vi.resetModules();
    clarityScriptPresent = false;
    windowClarity = undefined;
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    vi.stubGlobal("document", {
      getElementById: (id: string) =>
        id === "clarity-script" && clarityScriptPresent ? { id } : null,
    });

    vi.stubGlobal("window", {
      get clarity() {
        return windowClarity;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  });

  it("does nothing when project ID is missing", async () => {
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("does nothing when project ID is whitespace", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "   ";
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("calls Clarity.init with the trimmed project ID", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "  xnaw70fayd  ";
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith("xnaw70fayd");
  });

  it("does not call Clarity.init twice in the same module lifetime", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    const { initClarity } = await import("./clarity");
    initClarity();
    initClarity();
    expect(initMock).toHaveBeenCalledTimes(1);
  });

  it("skips init when #clarity-script already exists", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    clarityScriptPresent = true;

    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("skips init when window.clarity is already a function", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    windowClarity = vi.fn();

    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });
});
