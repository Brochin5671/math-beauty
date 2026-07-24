import type * as React from "react";

import { Grid } from "@/components/layouts/Grid";

/*
 * Responsive grid of logos that auto-wraps based on available width
 * Composes Grid's intrinsic auto-fit (minColWidth) so the layout adapts
 * without breakpoints. Each child should be a logo (img, svg, or Simple
 * Icons component)
 */

// size sets the minimum cell width; gap maps the local scale onto Grid's
// gap scale (which differs: this default is Grid's xl)
const MIN_COL_WIDTH = { sm: "80px", default: "120px", lg: "160px" } as const;
const GRID_GAP = { sm: "default", default: "xl", lg: "2xl" } as const;

interface LogoCloudProps extends React.ComponentProps<"div"> {
  /** Space between logos */
  gap?: "sm" | "default" | "lg";
  /** Minimum logo cell width, which sets how many fit per row */
  size?: "sm" | "default" | "lg";
}

function LogoCloud({ gap = "default", size = "default", className, ...props }: LogoCloudProps) {
  return (
    <Grid
      data-slot="logo-cloud"
      minColWidth={MIN_COL_WIDTH[size]}
      gap={GRID_GAP[gap]}
      align="center"
      justify="center"
      className={className}
      {...props}
    />
  );
}

export { LogoCloud, type LogoCloudProps };
