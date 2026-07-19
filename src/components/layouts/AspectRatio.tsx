import type * as React from "react";

import { cn } from "@/lib/utils";

// Named ratios so consumers can write `ratio="video"` instead of `16 / 9`.
const RATIO_PRESETS = {
  square: 1,
  portrait: 3 / 4,
  video: 16 / 9,
  wide: 21 / 9,
} as const;

type AspectRatioPreset = keyof typeof RATIO_PRESETS;

/*
 * Constrains a container to a fixed width/height ratio via the native CSS
 * `aspect-ratio` property. Use for image thumbnails, embed wrappers, video
 * tiles, and any layout that must hold a predictable shape across viewport
 * sizes. Pass a numeric `ratio` (e.g. `16 / 9`) or a named preset (`square`,
 * `portrait`, `video`, `wide`); the value flows through a `--ratio` custom
 * property to Tailwind's `aspect-(--ratio)` utility
 */
function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number | AspectRatioPreset }) {
  const value = typeof ratio === "number" ? ratio : RATIO_PRESETS[ratio];
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": value,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}

export { AspectRatio, type AspectRatioPreset };
