import type * as React from "react";

import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

/*
 * Container for chronological milestones. Composes Stack for the vertical
 * rhythm and renders a connecting line that TimelineItem dots align to.
 * Pairs with TimelineItem for individual milestones
 */
interface TimelineProps extends React.ComponentProps<"div"> {}

function Timeline({ className, children, ...props }: TimelineProps) {
  return (
    <Stack data-slot="timeline" gap="xl" className={cn("relative", className)} {...props}>
      {/* Connecting line, inset by half the dot size so it runs through the
          milestone dots. Tracks --timeline-marker-size for re-tokenization. */}
      <div
        aria-hidden="true"
        className="absolute top-[calc(var(--timeline-marker-size,0.75rem)/2)] bottom-[calc(var(--timeline-marker-size,0.75rem)/2)] left-[calc(var(--timeline-marker-size,0.75rem)/2)] w-px bg-border"
      />
      {children}
    </Stack>
  );
}

/*
 * Individual milestone inside a Timeline container. Renders a dot aligned
 * to the vertical line, with children (date, title, description) offset to
 * the right
 */
interface TimelineItemProps extends React.ComponentProps<"div"> {}

function TimelineItem({ className, children, ...props }: TimelineItemProps) {
  return (
    <div data-slot="timeline-item" className={cn("relative pl-8", className)} {...props}>
      <div
        aria-hidden="true"
        className="absolute top-[calc(var(--timeline-marker-size,0.75rem)/2)] left-0 h-[var(--timeline-marker-size,0.75rem)] w-[var(--timeline-marker-size,0.75rem)] rounded-full bg-primary"
      />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export { Timeline, TimelineItem, type TimelineItemProps, type TimelineProps };
