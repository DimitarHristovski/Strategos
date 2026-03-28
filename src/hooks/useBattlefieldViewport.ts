import { useEffect, type MutableRefObject, type RefObject } from "react";
import type { HoverScrollDirection } from "../game/types";

type UseBattlefieldViewportParams = {
  battlefieldViewportRef: RefObject<HTMLDivElement | null>;
  battlefieldPanCleanupRef: MutableRefObject<(() => void) | null>;
  showGridNavigation: boolean;
  hoverScrollDirection: HoverScrollDirection;
  isPanningGrid: boolean;
  setIsBattlefieldFullscreen: (value: boolean) => void;
};

/** Fullscreen sync, pan cleanup on unmount, and edge hover scrolling for oversized grids. */
export function useBattlefieldViewport({
  battlefieldViewportRef,
  battlefieldPanCleanupRef,
  showGridNavigation,
  hoverScrollDirection,
  isPanningGrid,
  setIsBattlefieldFullscreen
}: UseBattlefieldViewportParams) {
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBattlefieldFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setIsBattlefieldFullscreen]);

  useEffect(() => {
    return () => {
      battlefieldPanCleanupRef.current?.();
    };
  }, [battlefieldPanCleanupRef]);

  useEffect(() => {
    if (!showGridNavigation || !hoverScrollDirection || isPanningGrid) return;

    const viewport = battlefieldViewportRef.current;
    if (!viewport) return;

    const interval = window.setInterval(() => {
      const verticalAmount = 24;
      const horizontalAmount = 40;
      if (hoverScrollDirection === "up") viewport.scrollBy({ top: -verticalAmount });
      if (hoverScrollDirection === "down") viewport.scrollBy({ top: verticalAmount });
      if (hoverScrollDirection === "left") viewport.scrollBy({ left: -horizontalAmount });
      if (hoverScrollDirection === "right") viewport.scrollBy({ left: horizontalAmount });
    }, 30);

    return () => window.clearInterval(interval);
  }, [hoverScrollDirection, isPanningGrid, showGridNavigation]);
}
