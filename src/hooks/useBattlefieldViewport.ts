import { useEffect, type MutableRefObject, type RefObject } from "react";
import type { HoverScrollDirection } from "../game/types";

/** Same step sizes as edge-rail hover scroll (per ~30ms tick); one key event ≈ one rail tick. */
const KEY_PAN_VERTICAL_PX = 24;
const KEY_PAN_HORIZONTAL_PX = 40;

function isKeyboardViewportPanBlockedTarget(target: EventTarget | null): boolean {
  const el = target instanceof HTMLElement ? target : null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return false;
}

type UseBattlefieldViewportParams = {
  battlefieldViewportRef: RefObject<HTMLDivElement | null>;
  battlefieldPanCleanupRef: MutableRefObject<(() => void) | null>;
  showGridNavigation: boolean;
  hoverScrollDirection: HoverScrollDirection;
  isPanningGrid: boolean;
  setIsBattlefieldFullscreen: (value: boolean) => void;
};

/** Fullscreen sync, pan cleanup on unmount, edge hover scroll, and keyboard pan for oversized grids. */
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
      if (hoverScrollDirection === "up") viewport.scrollBy({ top: -KEY_PAN_VERTICAL_PX });
      if (hoverScrollDirection === "down") viewport.scrollBy({ top: KEY_PAN_VERTICAL_PX });
      if (hoverScrollDirection === "left") viewport.scrollBy({ left: -KEY_PAN_HORIZONTAL_PX });
      if (hoverScrollDirection === "right") viewport.scrollBy({ left: KEY_PAN_HORIZONTAL_PX });
    }, 30);

    return () => window.clearInterval(interval);
  }, [hoverScrollDirection, isPanningGrid, showGridNavigation]);

  useEffect(() => {
    if (!showGridNavigation) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isKeyboardViewportPanBlockedTarget(e.target)) return;

      const key = e.key;
      let dx = 0;
      let dy = 0;
      if (key === "ArrowUp" || key === "w" || key === "W") dy = -KEY_PAN_VERTICAL_PX;
      else if (key === "ArrowDown" || key === "s" || key === "S") dy = KEY_PAN_VERTICAL_PX;
      else if (key === "ArrowLeft" || key === "a" || key === "A") dx = -KEY_PAN_HORIZONTAL_PX;
      else if (key === "ArrowRight" || key === "d" || key === "D") dx = KEY_PAN_HORIZONTAL_PX;
      else return;

      const viewport = battlefieldViewportRef.current;
      if (!viewport) return;

      e.preventDefault();
      viewport.scrollTop += dy;
      viewport.scrollLeft += dx;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showGridNavigation, battlefieldViewportRef]);
}
