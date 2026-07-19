import { LoaderCircleIcon, LoaderIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { cn, cva, type VariantProps } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-3",
      default: "size-4",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type SpinnerIcon = "circle" | "bars" | ComponentType<SVGProps<SVGSVGElement>>;

interface SpinnerProps extends React.ComponentProps<"svg">, VariantProps<typeof spinnerVariants> {
  icon?: SpinnerIcon;
}

function Spinner({ className, icon = "circle", size = "default", ...props }: SpinnerProps) {
  const IconComponent =
    typeof icon === "function" ? icon : icon === "bars" ? LoaderIcon : LoaderCircleIcon;
  const iconAttr = typeof icon === "function" ? "custom" : icon;
  return (
    <IconComponent
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      data-icon={iconAttr}
      data-size={size}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

export { Spinner, type SpinnerProps, spinnerVariants };
