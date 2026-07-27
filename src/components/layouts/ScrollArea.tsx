import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Scrollbar visibility. `always` is the discoverable default (bar visible,
 * dimmed thumb); `hover` is a macOS-style overlay for panes where a constant
 * bar is noise
 *
 * The hover value reveals through three routes because the bar can sit in
 * two places: `peer-focus-visible/viewport` covers the built-in bar (a
 * sibling after the Viewport), `in-focus-visible` covers a consumer-supplied
 * bar nested inside the Viewport, and `in-data-[state=hover]` reveals it when an
 * ancestor carries data-state="hover", without a real pointer
 */
const scrollBarVariants = cva(
  "group/scrollbar flex touch-none p-px select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
  {
    variants: {
      visibility: {
        /** Bar always visible; the thumb dims when idle */
        always: "transition-colors",
        /** Bar hidden until pointer hover, keyboard focus, or scrolling */
        hover:
          "opacity-0 transition-opacity duration-150 data-hovering:opacity-100 data-scrolling:opacity-100 peer-focus-visible/viewport:opacity-100 in-focus-visible:opacity-100 in-data-[state=hover]:opacity-100",
      },
    },
    defaultVariants: {
      visibility: "always",
    },
  },
);

type ScrollBarVisibility = VariantProps<typeof scrollBarVariants>["visibility"];

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  /**
   * Visibility of the built-in vertical scrollbar. "always" (default) keeps
   * it visible with a dimmed thumb; "hover" hides it until pointer hover,
   * keyboard focus on the viewport, or scrolling. With "hover" an idle pane
   * gives no visual cue that it scrolls, so prefer it for panes where a
   * constant bar is visual noise (chat logs, code blocks)
   */
  scrollbar?: ScrollBarVisibility;
}

function ScrollArea({ className, children, scrollbar = "always", ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative flex flex-col", className)}
      {...props}>
      {/*
       * The Viewport is a flex child with `min-h-0 flex-1` so it derives a
       * concrete height from the Root's flex layout. `size-full` (the shipped
       * shadcn class) relies on `height: 100%` against the Root, which doesn't
       * resolve reliably when the Root sits inside a flex-grown parent
       * (TabsContent, .page-content): the Viewport collapses to content height,
       * no overflow is detected, the scrollbar stays hidden, and wheel scroll
       * never engages
       *
       * `peer/viewport` lets the sibling scrollbar react to the viewport's
       * keyboard focus (the `hover` visibility reveal)
       */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="peer/viewport min-h-0 w-full flex-1 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] in-data-[state=focus]:ring-[3px] focus-visible:ring-ring/50 in-data-[state=focus]:ring-ring/50 focus-visible:focus-outline in-data-[state=focus]:focus-outline">
        {/*
         * Content is the element Base UI watches for size changes. Without it,
         * overflow is only re-measured on scroll or viewport resize, so content
         * that grows after mount (a log viewer appending lines) leaves the
         * scrollbar stale until the user scrolls. The shipped shadcn port omits
         * it; a deliberate deviation
         */}
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar visibility={scrollbar} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

interface ScrollBarProps extends ScrollAreaPrimitive.Scrollbar.Props {
  /** See `ScrollArea`'s `scrollbar` prop. Default "always" */
  visibility?: ScrollBarVisibility;
}

function ScrollBar({
  className,
  orientation = "vertical",
  visibility = "always",
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(scrollBarVariants({ visibility }), className)}
      {...props}>
      {/*
       * in-data-[state=hover] applies the same brightening data-hovering does,
       * when an ancestor carries data-state="hover" rather than on real hover
       */}
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-foreground/30 opacity-60 transition-opacity group-data-hovering/scrollbar:opacity-100 group-data-scrolling/scrollbar:opacity-100 in-data-[state=hover]:opacity-100"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar, scrollBarVariants };
