/**
 * Keep window scroll position fixed while Google GIS/Picker move focus.
 * `html { scroll-behavior: smooth }` makes those focus scrolls very visible.
 */
export function pinWindowScroll(): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const x = window.scrollX;
  const y = window.scrollY;
  const html = document.documentElement;
  const previousBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  const pin = () => {
    if (window.scrollX !== x || window.scrollY !== y) {
      window.scrollTo(x, y);
    }
  };

  window.addEventListener("scroll", pin, true);
  document.addEventListener("focusin", pin, true);
  pin();
  requestAnimationFrame(pin);

  return () => {
    window.removeEventListener("scroll", pin, true);
    document.removeEventListener("focusin", pin, true);
    pin();
    html.style.scrollBehavior = previousBehavior;
  };
}
