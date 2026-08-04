import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { createElement } from "react";
import { cn, cva, type VariantProps } from "@/lib/utils";

const accordionVariants = cva("flex w-full flex-col", {
  variants: {
    variant: {
      /** Inter-item dividers only; the default look */
      separated: "[&>[data-slot=accordion-item]:not(:last-child)]:border-b",
      /** Rounded outer border + inter-item dividers; card-style surface */
      bordered:
        "rounded-lg border [&>[data-slot=accordion-item]]:px-4 [&>[data-slot=accordion-item]:not(:last-child)]:border-b",
      /** No separators, no outer border; clean whitespace-only stack */
      borderless: "",
    },
  },
  defaultVariants: {
    variant: "separated",
  },
});

function Accordion({
  className,
  variant = "separated",
  ...props
}: AccordionPrimitive.Root.Props & VariantProps<typeof accordionVariants>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={cn(className)} {...props} />
  );
}

function AccordionTrigger({
  className,
  children,
  headingLevel,
  ...props
}: AccordionPrimitive.Trigger.Props & {
  // Base UI's Header renders an h3 by default; set this to keep a valid document
  // heading order when the accordion sits directly under an h1 or h2
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <AccordionPrimitive.Header
      className="flex"
      render={headingLevel ? createElement(`h${headingLevel}`) : undefined}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-md border border-transparent py-4 text-left text-sm font-medium transition-[color,background-color,border-color,box-shadow,opacity] outline-none hover:underline focus-visible:border-ring in-data-[state=focus]:border-ring focus-visible:ring-3 in-data-[state=focus]:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:ring-ring/50 focus-visible:after:border-ring in-data-[state=focus]:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}>
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
      {...props}>
      <div
        className={cn(
          "pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, accordionVariants };
