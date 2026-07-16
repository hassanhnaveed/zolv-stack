import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("pinWindowScroll", () => {
  let scrollX = 0;
  let scrollY = 0;
  let scrollBehavior = "";
  const listeners = new Map<string, Set<EventListener>>();

  beforeEach(async () => {
    scrollX = 0;
    scrollY = 200;
    scrollBehavior = "";
    listeners.clear();

    vi.stubGlobal("window", {
      get scrollX() {
        return scrollX;
      },
      get scrollY() {
        return scrollY;
      },
      scrollTo: (x: number, y: number) => {
        scrollX = x;
        scrollY = y;
      },
      addEventListener: (type: string, listener: EventListener) => {
        const set = listeners.get(type) ?? new Set();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener: (type: string, listener: EventListener) => {
        listeners.get(type)?.delete(listener);
      },
    });

    vi.stubGlobal("document", {
      documentElement: {
        style: {
          get scrollBehavior() {
            return scrollBehavior;
          },
          set scrollBehavior(value: string) {
            scrollBehavior = value;
          },
        },
      },
      addEventListener: (type: string, listener: EventListener) => {
        const set = listeners.get(type) ?? new Set();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener: (type: string, listener: EventListener) => {
        listeners.get(type)?.delete(listener);
      },
    });

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    // Import after stubs so the module sees the mocked globals.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("restores scroll position when scroll events fire", async () => {
    const { pinWindowScroll } = await import("./pin-window-scroll");
    const release = pinWindowScroll();
    scrollY = 0;
    listeners.get("scroll")?.forEach((listener) =>
      listener(new Event("scroll")),
    );
    expect(scrollY).toBe(200);
    release();
  });

  it("restores scroll on focusin", async () => {
    const { pinWindowScroll } = await import("./pin-window-scroll");
    const release = pinWindowScroll();
    scrollY = 50;
    listeners.get("focusin")?.forEach((listener) =>
      listener(new Event("focusin")),
    );
    expect(scrollY).toBe(200);
    release();
  });
});
