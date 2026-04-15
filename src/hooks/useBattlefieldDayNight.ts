import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Full cycle: one in-game day (seconds). */
const DAY_NIGHT_CYCLE_S = 180;

export type DayNightClockState = {
  timeLabel: string;
  /** True when simulated time is in [18:00, 06:00) — battlefield dark. */
  isNight: boolean;
  /** 0..1 darkness intensity (0 = daylight, 1 = deepest night). */
  nightStrength: number;
};

/** Minutes since midnight; cycle starts at 6:00 AM when t = 0. */
function totalMinutesSinceMidnight(t: number): number {
  return (6 * 60 + t * 24 * 60) % (24 * 60);
}

function smoothstep01(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped * clamped * (3 - 2 * clamped);
}

/** 0 = day overlay, 1 = full night overlay (with dusk/dawn ramps). */
function nightStrengthFromCycleT(t: number): number {
  const totalMinutes = totalMinutesSinceMidnight(t);
  const dawnStart = 5 * 60;
  const dayStart = 7 * 60;
  const duskStart = 17 * 60;
  const nightStart = 19 * 60;

  if (totalMinutes >= dayStart && totalMinutes < duskStart) return 0;
  if (totalMinutes >= nightStart || totalMinutes < dawnStart) return 1;
  if (totalMinutes >= dawnStart && totalMinutes < dayStart) {
    const p = (totalMinutes - dawnStart) / (dayStart - dawnStart);
    return 1 - smoothstep01(p);
  }
  const p = (totalMinutes - duskStart) / (nightStart - duskStart);
  return smoothstep01(p);
}

function formatTimeFromCycleT(t: number): string {
  const totalMinutes = totalMinutesSinceMidnight(t);
  const h24 = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? "AM" : "PM";
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Drives a pointer-events-none overlay on the battlefield: day vs night from clock hours.
 * Exposes a clock label synced to the same cycle for the header (high-frequency updates for smooth transitions).
 */
export function useBattlefieldDayNightOverlay(reduceMotion: boolean | null) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dayNightClock, setDayNightClock] = useState<DayNightClockState>(() => ({
    timeLabel: "6:00 AM",
    isNight: false,
    nightStrength: 0
  }));

  useEffect(() => {
    const cycleMs = DAY_NIGHT_CYCLE_S * 1000;

    const updateClock = () => {
      if (reduceMotion) {
        setDayNightClock({ timeLabel: "—", isNight: false, nightStrength: 0 });
        return;
      }
      const t = (performance.now() % cycleMs) / cycleMs;
      const nightStrength = nightStrengthFromCycleT(t);
      setDayNightClock({
        timeLabel: formatTimeFromCycleT(t),
        isNight: nightStrength >= 0.55,
        nightStrength
      });
    };

    updateClock();
    if (reduceMotion) return;
    // Higher frequency prevents visible stepping in CSS vars driven by `nightStrength`.
    const id = setInterval(updateClock, 120);
    return () => clearInterval(id);
  }, [reduceMotion]);

  useLayoutEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (reduceMotion) {
      el.style.removeProperty("background");
      el.style.removeProperty("mix-blend-mode");
      return;
    }

    const cycleMs = DAY_NIGHT_CYCLE_S * 1000;
    let id = 0;

    const tick = () => {
      const t = (performance.now() % cycleMs) / cycleMs;
      const night = nightStrengthFromCycleT(t);
      const day = 1 - night;

      el.style.background = `linear-gradient(180deg,
        rgba(255, 248, 230, ${0.05 + 0.1 * day}) 0%,
        rgba(135, 180, 255, ${0.14 * night}) 22%,
        rgba(45, 65, 120, ${0.38 * night}) 48%,
        rgba(12, 18, 42, ${0.58 * night}) 72%,
        rgba(4, 6, 16, ${0.72 * night}) 100%)`;
      el.style.mixBlendMode = night > 0.35 ? "multiply" : "normal";
      id = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);

  return { overlayRef, dayNightClock };
}
