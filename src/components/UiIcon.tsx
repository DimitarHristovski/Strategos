import { createElement, type ReactNode } from "react";
import { getUnitDisplayIcon } from "../game/unitCatalog";

type UiIconProps = {
  src: string;
  className?: string;
  alt?: string;
};

/** Small raster icon from `public/icons/ui/` (fixed size, no layout shift). */
export function UiIcon({ src, className = "h-6 w-6", alt = "" }: UiIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`pointer-events-none shrink-0 select-none object-contain ${className}`}
      draggable={false}
    />
  );
}

type TroopIconMarkProps = {
  unit: { role?: string; Icon?: string; ammo?: number; range?: number; move?: number } | null | undefined;
  imgClassName?: string;
  emojiClassName?: string;
};

/** Troop portrait: raster from `getTroopRasterIconSrc` when `role` is set; else emoji or legacy component. */
export function TroopIconMark({ unit, imgClassName = "h-6 w-6", emojiClassName }: TroopIconMarkProps): ReactNode {
  const v = getUnitDisplayIcon(unit);
  if (typeof v !== "string") return v ? createElement(v) : <span className={emojiClassName}>⚔️</span>;
  if (v.startsWith("/")) return <UiIcon src={v} className={imgClassName} alt="" />;
  return <span className={emojiClassName}>{v}</span>;
}
