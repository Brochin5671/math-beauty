import type * as React from "react";

import { Grid } from "@/components/layouts/Grid";
import { cn } from "@/lib/utils";

/*
 * Responsive row of stat items. Composes Grid: each child is a Stat (or
 * any consumer-provided cell). columns picks the desktop track count; the
 * grid drops to fewer tracks on small screens (1-up for 3, 2-up for 4)
 */
interface StatsProps extends React.ComponentProps<"div"> {
  /** Desktop column count. 3 stacks 1-up on mobile, 4 stacks 2-up */
  columns?: 3 | 4;
}

function Stats({ columns = 4, className, ...props }: StatsProps) {
  return (
    <Grid
      data-slot="stats"
      cols={columns === 3 ? { base: 1, md: 3 } : { base: 2, md: 4 }}
      gap="xl"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export { Stat, type StatProps } from "@/components/elements/Stat";
export { Stats, type StatsProps };
