import { useLayoutEffect, useState } from "react";

const MENU_WIDTH = 220;

/**
 * Fixed coordinates for a popover anchored above a trigger (opens upward).
 */
export function usePopoverPosition(anchorRef, isOpen, { gap = 10, menuWidth = MENU_WIDTH } = {}) {
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      setPosition(null);
      return undefined;
    }

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const clampedCenter = Math.max(
        gap + menuWidth / 2,
        Math.min(centerX, window.innerWidth - menuWidth / 2 - gap)
      );

      setPosition({
        left: clampedCenter,
        bottom: window.innerHeight - rect.top + gap,
      });
    };

    update();
    const raf = requestAnimationFrame(update);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, anchorRef, gap, menuWidth]);

  return position;
}
