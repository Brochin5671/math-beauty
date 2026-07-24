import type * as React from "react";

import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

type ProcessOrientation = "horizontal" | "vertical";

/*
 * Container for a numbered process/workflow. Composes Stack for spacing and
 * renders a connecting line behind the ProcessStep children. `orientation`
 * lays the steps out vertically (default) or horizontally; horizontal flips
 * back to vertical below the `sm` breakpoint. The orientation is exposed as a
 * data attribute on a `group/process` so ProcessStep can restyle via CSS (no
 * context, which would not survive Astro rendering each child separately)
 * Pairs with ProcessStep for individual steps
 */
interface ProcessProps extends React.ComponentProps<"div"> {
  orientation?: ProcessOrientation;
}

function Process({ orientation = "vertical", className, children, ...props }: ProcessProps) {
  const horizontal = orientation === "horizontal";
  return (
    <Stack
      data-slot="process"
      data-orientation={orientation}
      gap="xl"
      className={cn(
        "group/process relative",
        horizontal && "sm:flex-row sm:justify-between sm:gap-0",
        className,
      )}
      {...props}>
      {/* Connecting line behind the step markers, inset by half the marker size.
          Tracks --process-marker-size for re-tokenization. Horizontal runs along
          the top on sm+, falling back to the vertical line on small screens. */}
      {horizontal ? (
        <>
          <div
            aria-hidden="true"
            className="absolute top-[calc(var(--process-marker-size,2.5rem)/2)] right-[10%] left-[10%] hidden h-px bg-border sm:block"
          />
          <div
            aria-hidden="true"
            className="absolute top-[calc(var(--process-marker-size,2.5rem)/2)] bottom-[calc(var(--process-marker-size,2.5rem)/2)] left-[calc(var(--process-marker-size,2.5rem)/2)] w-px bg-border sm:hidden"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute top-[calc(var(--process-marker-size,2.5rem)/2)] bottom-[calc(var(--process-marker-size,2.5rem)/2)] left-[calc(var(--process-marker-size,2.5rem)/2)] w-px bg-border"
        />
      )}
      {children}
    </Stack>
  );
}

/*
 * Individual step inside a Process container. Composes a horizontal Stack
 * to set a numbered circle beside the step content (title + description),
 * aligned to the vertical connecting line
 */
interface ProcessStepProps extends React.ComponentProps<"div"> {
  /** Step number displayed in the circle */
  step: number;
}

function ProcessStep({ step, className, children, ...props }: ProcessStepProps) {
  return (
    <Stack
      direction="horizontal"
      data-slot="process-step"
      gap="default"
      className={cn(
        "relative",
        // In a horizontal Process (sm+), stack the marker above centered content
        "group-data-[orientation=horizontal]/process:sm:flex-1 group-data-[orientation=horizontal]/process:sm:flex-col group-data-[orientation=horizontal]/process:sm:items-center group-data-[orientation=horizontal]/process:sm:text-center",
        className,
      )}
      {...props}>
      <div className="flex h-[var(--process-marker-size,2.5rem)] w-[var(--process-marker-size,2.5rem)] shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
        {step}
      </div>
      <div className="flex flex-col gap-1 pt-1 group-data-[orientation=horizontal]/process:sm:pt-0">
        {children}
      </div>
    </Stack>
  );
}

export { Process, type ProcessProps, ProcessStep, type ProcessStepProps };
