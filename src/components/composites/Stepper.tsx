"use client";

import { CheckIcon, XIcon } from "lucide-react";
import {
  Children,
  type ComponentProps,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, cva, type VariantProps } from "@/lib/utils";

// Stepper. For static "how it works" marketing sections, use the Process block instead
const stepperVariants = cva("flex w-full", {
  variants: {
    orientation: {
      horizontal: "items-start",
      // gap-0: lets each item's flex-1 indicator-column line bridge to the next li's indicator
      vertical: "flex-col items-stretch",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
    tone: {
      default: "",
      success: "",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", size: "sm", className: "gap-1.5" },
    { orientation: "horizontal", size: "default", className: "gap-2" },
    { orientation: "horizontal", size: "lg", className: "gap-3" },
  ],
  defaultVariants: {
    orientation: "horizontal",
    size: "default",
    tone: "default",
  },
});

type StepperOrientation = "horizontal" | "vertical";
type StepperVerticalBelow = "sm" | "md";
type StepperSize = "sm" | "default" | "lg";

// Tailwind sm (640px) / md (768px) cutoffs as max-width queries (one hair below
// the breakpoint so the flip lines up with Tailwind's own min-width utilities).
// The non-matching sentinel keeps the hook call unconditional when the prop is
// unset (no responsive flip, no extra listener churn)
const VERTICAL_BELOW_QUERY: Record<StepperVerticalBelow, string> = {
  sm: "(max-width: 639.98px)",
  md: "(max-width: 767.98px)",
};
const NEVER_MATCHES = "(max-width: 0px)";
type StepperTone = "default" | "success";
type StepperState = "pending" | "active" | "complete" | "error";
type StepperConnector = "default" | "dotted" | "thick";

interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  size: StepperSize;
  tone: StepperTone;
  connected: boolean;
  linear: boolean;
  connector: StepperConnector;
  trail: boolean;
  separator?: ReactNode;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext() {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("Stepper parts must be used within a <Stepper> root");
  return ctx;
}

interface StepperItemContextValue {
  index: number;
  state: StepperState;
}

const StepperItemContext = createContext<StepperItemContextValue | null>(null);

function useStepperItemContext() {
  const ctx = useContext(StepperItemContext);
  if (!ctx) throw new Error("Stepper child parts must be used within a <StepperItem>");
  return ctx;
}

interface StepperProps
  extends Omit<ComponentProps<"ol">, "children">,
    VariantProps<typeof stepperVariants> {
  /** Index of the currently active step, zero-based. Steps before it are complete, the step at this index is active, steps after are pending */
  activeStep: number;
  /** When true, steps past activeStep suppress their onClick and carry aria-disabled, locking the user to forward progression. Defaults to false (consumer decides which steps are clickable) */
  linear?: boolean;
  /** Line style for the connector. `default` is solid, `dotted` is dashed, `thick` is a 4px solid line. Ignored when a custom `separator` slot is provided */
  connector?: StepperConnector;
  /** When true, segments before activeStep fill with the tone color (primary or success) instead of muted. Composes with any `connector` style */
  trail?: boolean;
  /** When true, the indicator gets a 16px ring-background halo so the connector line stops short of touching the indicator; defaults to false (line touches indicators directly) */
  connected?: boolean;
  /** Replaces the auto-rendered per-item line inside each StepperItem's indicator column. Pass an unkeyed element; the Stepper clones it per item. The slot is responsible for its own positioning */
  separator?: ReactNode;
  /** Flip a horizontal Stepper to vertical below this Tailwind breakpoint (four indicators plus titles cramp on phones). `sm` (640px) is the recommended cutoff; `md` (768px) for wider step labels. Omit to keep a fixed `orientation`. Resolved client-side via matchMedia, so a horizontal first paint may flip to vertical on narrow viewports */
  verticalBelow?: StepperVerticalBelow;
  children: ReactNode;
}

function Stepper({
  activeStep,
  orientation,
  size,
  tone,
  linear = false,
  connector = "default",
  trail = false,
  connected = false,
  separator,
  verticalBelow,
  className,
  children,
  ...props
}: StepperProps) {
  // When verticalBelow is set, flip to vertical below its breakpoint; otherwise
  // the sentinel query never matches and the explicit orientation stands
  const isBelowCutoff = useMediaQuery(
    verticalBelow ? VERTICAL_BELOW_QUERY[verticalBelow] : NEVER_MATCHES,
  );
  // VariantProps widens to include null, so ?? (not a default param) is needed for both null and undefined
  const o: StepperOrientation = isBelowCutoff ? "vertical" : (orientation ?? "horizontal");
  const s: StepperSize = size ?? "default";
  const t: StepperTone = tone ?? "default";
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    index?: number;
    isLast?: boolean;
  }>[];
  const contextValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      orientation: o,
      size: s,
      tone: t,
      connected,
      linear,
      connector,
      trail,
      separator,
    }),
    [activeStep, o, s, t, connected, linear, connector, trail, separator],
  );
  return (
    <StepperContext.Provider value={contextValue}>
      <ol
        data-slot="stepper"
        data-orientation={o}
        data-vertical-below={verticalBelow}
        data-size={s}
        data-tone={t}
        data-connected={connected || undefined}
        data-connector={connector}
        data-trail={trail || undefined}
        className={cn(stepperVariants({ orientation: o, size: s, tone: t }), className)}
        {...props}>
        {items.map((child, i) => (
          <Fragment key={child.key ?? `step-${i}`}>
            {cloneElement(child, { index: i, isLast: i === items.length - 1 })}
          </Fragment>
        ))}
      </ol>
    </StepperContext.Provider>
  );
}

interface StepperItemProps extends Omit<ComponentProps<"li">, "onClick"> {
  /** Injected by the Stepper root, do not set manually */
  index?: number;
  /** Injected by the Stepper root, do not set manually */
  isLast?: boolean;
  /** Explicit state override, defaults to derived from activeStep */
  state?: StepperState;
  /** When provided, the item renders as an internal <button> wrapping its content. Native Tab and Enter work. Suppressed for future steps when the root has linear={true} */
  onClick?: () => void;
  /** Marks the step as optional. true renders the default muted "Optional" caption; pass a ReactNode for custom content. Omitted or false renders nothing */
  optional?: boolean | ReactNode;
}

// Horizontal line is absolutely positioned at the indicator's vertical
// center, extending 100% + gap so it reaches the next item's indicator.
// Underscores in calc() are required: Tailwind 4 needs whitespace around `+`
const INDICATOR_TOP_CENTER: Record<StepperSize, string> = {
  sm: "top-3",
  default: "top-4",
  lg: "top-5",
};

// Default horizontal line geometry: line spans indicator-center to next-indicator-center
const HORIZONTAL_LINE_LEFT_DEFAULT = "left-1/2";
const HORIZONTAL_LINE_WIDTH_DEFAULT: Record<StepperSize, string> = {
  sm: "w-[calc(100%_+_0.375rem)]",
  default: "w-[calc(100%_+_0.5rem)]",
  lg: "w-[calc(100%_+_0.75rem)]",
};

// Connected horizontal line geometry: line starts past indicator's right edge + 16px
// breathing room, ends 16px before next indicator's left edge. Per size: r + 16 = offset
const HORIZONTAL_LINE_LEFT_CONNECTED: Record<StepperSize, string> = {
  sm: "left-[calc(50%_+_1.75rem)]", // r=12 + 16 = 28px = 1.75rem
  default: "left-[calc(50%_+_2rem)]", // r=16 + 16 = 32px = 2rem
  lg: "left-[calc(50%_+_2.25rem)]", // r=20 + 16 = 36px = 2.25rem
};
const HORIZONTAL_LINE_WIDTH_CONNECTED: Record<StepperSize, string> = {
  sm: "w-[calc(100%_+_0.375rem_-_3.5rem)]", // base width - 2*1.75rem
  default: "w-[calc(100%_+_0.5rem_-_4rem)]", // base width - 2*2rem
  lg: "w-[calc(100%_+_0.75rem_-_4.5rem)]", // base width - 2*2.25rem
};

// Vertical text column top padding: shifts the title down so its visual center
// aligns with the indicator's center (indicator-size/2 minus half text-sm line-height)
const VERTICAL_TEXT_OFFSET: Record<StepperSize, string> = {
  sm: "pt-0.5",
  default: "pt-1.5",
  lg: "pt-2.5",
};

function StepperItem({
  index = 0,
  isLast = false,
  state: stateOverride,
  onClick,
  optional,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { activeStep, orientation, size, linear, connected, separator } = useStepperContext();
  const derivedState: StepperState =
    index < activeStep ? "complete" : index === activeStep ? "active" : "pending";
  const state = stateOverride ?? derivedState;
  const linearDisabled = linear && index > activeStep;
  const effectiveOnClick = linearDisabled ? undefined : onClick;

  // Indicator extraction (must be a direct child) so the rest can stack in a sibling text column
  const childArray = Children.toArray(children);
  const indicator = childArray.find((c) => isValidElement(c) && c.type === StepperIndicator) as
    | ReactElement
    | undefined;
  const restChildren = indicator ? childArray.filter((c) => c !== indicator) : childArray;

  const optionalNode = optional === true ? "Optional" : optional ? optional : null;

  const textColumn = (
    <div className="flex flex-col">
      {restChildren}
      {optionalNode ? <StepperOptional>{optionalNode}</StepperOptional> : null}
    </div>
  );

  const lineState: "complete" | "pending" = index < activeStep ? "complete" : "pending";
  const lineNode = !isLast ? (
    separator && isValidElement(separator) ? (
      cloneElement(separator)
    ) : (
      <StepperItemLine state={lineState} />
    )
  ) : null;

  const contentLayout =
    orientation === "horizontal" ? (
      <div className="flex w-full flex-col items-center text-center">
        {indicator}
        {textColumn}
      </div>
    ) : (
      <div className="flex flex-1 flex-row items-stretch gap-3 text-left">
        <div className="flex flex-col items-center self-stretch">
          {indicator}
          {lineNode}
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col",
            VERTICAL_TEXT_OFFSET[size],
            // When connected, the line eats 32px of its own slot (my-4 top + bottom).
            // Pad the text column so each item is tall enough for that shrink to leave a visible line
            connected ? "pb-12" : "pb-4",
          )}>
          {textColumn}
        </div>
      </div>
    );

  const wrappedContent = effectiveOnClick ? (
    <button
      type="button"
      onClick={effectiveOnClick}
      className="w-full rounded-md outline-none transition-colors hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50">
      {contentLayout}
    </button>
  ) : (
    contentLayout
  );

  return (
    <StepperItemContext.Provider value={{ index, state }}>
      <li
        data-slot="stepper-item"
        data-state={state}
        data-disabled={linearDisabled ? "" : undefined}
        aria-current={state === "active" ? "step" : undefined}
        aria-invalid={state === "error" ? true : undefined}
        aria-disabled={linearDisabled || undefined}
        className={cn(
          orientation === "horizontal"
            ? "relative flex min-w-0 flex-1"
            : "flex w-full shrink-0 items-stretch",
          className,
        )}
        {...props}>
        {wrappedContent}
        {orientation === "horizontal" && lineNode ? lineNode : null}
      </li>
    </StepperItemContext.Provider>
  );
}

const INDICATOR_SIZE_CLASS: Record<StepperSize, string> = {
  sm: "size-6 text-xs [&_svg]:size-3",
  default: "size-8 text-sm [&_svg]:size-4",
  lg: "size-10 text-base [&_svg]:size-5",
};

/*
 * Indicator color treatment per (tone, state). Pending stays muted
 * and error stays destructive across tones, error is critical and
 * should always read the same regardless of theme
 */
const INDICATOR_STATE_CLASS: Record<StepperTone, Record<StepperState, string>> = {
  default: {
    pending: "border-border bg-background text-muted-foreground",
    active: "border-primary bg-primary text-primary-foreground",
    complete: "border-primary bg-primary text-primary-foreground",
    error: "border-destructive bg-destructive text-destructive-foreground",
  },
  success: {
    pending: "border-border bg-background text-muted-foreground",
    active: "border-success bg-success text-white",
    complete: "border-success bg-success text-white",
    error: "border-destructive bg-destructive text-destructive-foreground",
  },
};

function StepperIndicator({ children, className, ...props }: ComponentProps<"span">) {
  const { size, tone } = useStepperContext();
  const { index, state } = useStepperItemContext();
  const defaultContent =
    state === "complete" ? (
      <CheckIcon aria-hidden="true" />
    ) : state === "error" ? (
      <XIcon aria-hidden="true" />
    ) : (
      <span aria-hidden="true">{index + 1}</span>
    );
  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors",
        INDICATOR_SIZE_CLASS[size],
        INDICATOR_STATE_CLASS[tone][state],
        className,
      )}
      {...props}>
      {children ?? defaultContent}
      {state === "complete" ? <span className="sr-only">Completed step {index + 1}</span> : null}
    </span>
  );
}

function StepperTitle({ className, ...props }: ComponentProps<"span">) {
  const { orientation } = useStepperContext();
  const { state } = useStepperItemContext();
  return (
    <span
      data-slot="stepper-title"
      className={cn(
        "block text-sm font-medium",
        // mt-2 only in horizontal (title sits below the indicator); vertical aligns via text-column padding instead
        orientation === "horizontal" && "mt-2",
        state === "pending" && "text-muted-foreground",
        state === "error" && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function StepperOptional({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-optional"
      className={cn("block text-xs text-muted-foreground italic", className)}
      {...props}
    />
  );
}

function StepperDescription({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("block text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

// Gated on index === activeStep (not state === "active") so an error
// override on the active step still shows its body for the user to fix
function StepperContent({ children, className, ...props }: ComponentProps<"div">) {
  const { activeStep } = useStepperContext();
  const { index, state } = useStepperItemContext();
  if (index !== activeStep) return null;
  return (
    <div
      data-slot="stepper-content"
      data-state={state}
      className={cn("mt-2 text-sm", className)}
      {...props}>
      {children}
    </div>
  );
}

// Horizontal lines are absolute-positioned; vertical lines take flex-1
// inside a self-stretching indicator column. Style + fill come from context
interface StepperItemLineProps extends ComponentProps<"span"> {
  state?: "complete" | "pending";
}

function StepperItemLine({ state = "pending", className, ...props }: StepperItemLineProps) {
  const { orientation, size, tone, connected, connector, trail } = useStepperContext();
  const isH = orientation === "horizontal";
  const filled = trail && state === "complete";
  const toneToken = tone === "success" ? "success" : "primary";

  let appearance: string;
  switch (connector) {
    case "dotted":
      appearance = isH
        ? cn(
            "h-0 border-t-2 border-dashed bg-transparent",
            filled ? `border-${toneToken}` : "border-border",
          )
        : cn(
            "w-0 border-l-2 border-dashed bg-transparent",
            filled ? `border-${toneToken}` : "border-border",
          );
      break;
    case "thick":
      appearance = isH
        ? cn("h-1", filled ? `bg-${toneToken}` : "bg-border")
        : cn("w-1", filled ? `bg-${toneToken}` : "bg-border");
      break;
    default:
      appearance = isH
        ? cn("h-0.5", filled ? `bg-${toneToken}` : "bg-border")
        : cn("w-0.5", filled ? `bg-${toneToken}` : "bg-border");
  }

  // When connected, the line shrinks instead of the indicator getting a halo:
  // it starts past the indicator's right edge + 16px and ends 16px before the
  // next indicator's left edge. Vertical uses my-4 (16px) to add the same
  // breathing room above and below the line
  const layout = isH
    ? cn(
        "absolute z-0 -translate-y-1/2",
        INDICATOR_TOP_CENTER[size],
        connected ? HORIZONTAL_LINE_LEFT_CONNECTED[size] : HORIZONTAL_LINE_LEFT_DEFAULT,
        connected ? HORIZONTAL_LINE_WIDTH_CONNECTED[size] : HORIZONTAL_LINE_WIDTH_DEFAULT[size],
      )
    : cn("flex-1", connected && "my-4");

  return (
    <span
      data-slot="stepper-item-line"
      data-state={state}
      aria-hidden="true"
      className={cn("shrink-0", layout, appearance, className)}
      {...props}
    />
  );
}

// MobileStepper
const mobileStepperVariants = cva("inline-flex items-center", {
  variants: {
    indicator: {
      text: "",
      dots: "",
      progress: "w-full",
      radiant: "",
    },
    size: {
      sm: "gap-1",
      default: "gap-1.5",
      lg: "gap-2",
    },
    tone: {
      default: "",
      success: "",
    },
  },
  defaultVariants: {
    indicator: "text",
    size: "default",
    tone: "default",
  },
});

type MobileStepperIndicator = "text" | "dots" | "progress" | "radiant";

const DOT_SIZE_CLASS: Record<StepperSize, string> = {
  sm: "size-1.5",
  default: "size-2",
  lg: "size-2.5",
};

const TEXT_SIZE_CLASS: Record<StepperSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

const PROGRESS_HEIGHT_CLASS: Record<StepperSize, string> = {
  sm: "h-0.5",
  default: "h-1",
  lg: "h-1.5",
};

const RADIANT_SIZE_CLASS: Record<StepperSize, string> = {
  sm: "size-9",
  default: "size-11",
  lg: "size-14",
};

const RADIANT_TEXT_CLASS: Record<StepperSize, string> = {
  sm: "text-[10px]",
  default: "text-xs",
  lg: "text-sm",
};

// SVG ring geometry: viewBox 36x36, circle r=16 centered at (18,18). Stroke width 3.
// Circumference = 2*PI*r ≈ 100.531
const RADIANT_CIRCUMFERENCE = 2 * Math.PI * 16;

interface MobileStepperProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof mobileStepperVariants> {
  /** Zero-based index of the currently active step */
  activeStep: number;
  /** Total number of steps */
  steps: number;
  /** Required accessible label, e.g. "Checkout progress" */
  "aria-label": string;
}

function MobileStepper({
  activeStep,
  steps,
  indicator,
  size,
  tone,
  className,
  ...props
}: MobileStepperProps) {
  const i: MobileStepperIndicator = indicator ?? "text";
  const s: StepperSize = size ?? "default";
  const t: StepperTone = tone ?? "default";
  const toneToken = t === "success" ? "success" : "primary";
  const current = Math.max(0, Math.min(activeStep, steps - 1));
  const percent = steps > 0 ? ((current + 1) / steps) * 100 : 0;

  return (
    <div
      data-slot="mobile-stepper"
      data-indicator={i}
      data-size={s}
      data-tone={t}
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={steps}
      className={cn(mobileStepperVariants({ indicator: i, size: s, tone: t }), className)}
      {...props}>
      {i === "text" ? (
        <span
          data-slot="mobile-stepper-text"
          className={cn("tabular-nums text-muted-foreground", TEXT_SIZE_CLASS[s])}>
          {current + 1} / {steps}
        </span>
      ) : null}
      {i === "dots" ? (
        <span data-slot="mobile-stepper-dots" className="inline-flex items-center gap-1.5">
          {Array.from({ length: steps }, (_, idx) => (
            <span
              // index key is stable: dot positions are order-significant and never reorder
              key={idx}
              data-slot="mobile-stepper-dot"
              data-state={idx === current ? "active" : idx < current ? "complete" : "pending"}
              aria-hidden="true"
              className={cn(
                "rounded-full transition-colors",
                DOT_SIZE_CLASS[s],
                idx === current ? `bg-${toneToken}` : "bg-border",
              )}
            />
          ))}
        </span>
      ) : null}
      {i === "progress" ? (
        <span
          data-slot="mobile-stepper-progress"
          aria-hidden="true"
          className={cn("w-full overflow-hidden rounded-full bg-border", PROGRESS_HEIGHT_CLASS[s])}>
          <span
            data-slot="mobile-stepper-progress-bar"
            className={cn("block h-full transition-all", `bg-${toneToken}`)}
            style={{ width: `${percent}%` }}
          />
        </span>
      ) : null}
      {i === "radiant" ? (
        <span
          data-slot="mobile-stepper-radiant"
          className={cn("relative inline-flex items-center justify-center", RADIANT_SIZE_CLASS[s])}>
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" className="stroke-border" />
            <circle
              data-slot="mobile-stepper-radiant-progress"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className={cn("transition-[stroke-dashoffset]", `stroke-${toneToken}`)}
              strokeDasharray={RADIANT_CIRCUMFERENCE}
              strokeDashoffset={RADIANT_CIRCUMFERENCE * (1 - percent / 100)}
            />
          </svg>
          <span
            data-slot="mobile-stepper-radiant-text"
            className={cn(
              "absolute inset-0 flex items-center justify-center font-medium tabular-nums text-muted-foreground",
              RADIANT_TEXT_CLASS[s],
            )}>
            {current + 1}/{steps}
          </span>
        </span>
      ) : null}
    </div>
  );
}

export {
  MobileStepper,
  mobileStepperVariants,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperItemLine,
  StepperOptional,
  StepperTitle,
  stepperVariants,
};
