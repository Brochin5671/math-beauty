import type * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/elements/Accordion";
import { Container } from "@/components/layouts/Container";
import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

interface FAQItem {
  /** Stable key used both for React key and Accordion item value (defaults to the question text if omitted) */
  value?: string;
  /** Question text rendered in the AccordionTrigger */
  question: string;
  /** Answer rendered inside the AccordionContent */
  answer: React.ReactNode;
}

interface FAQProps extends Omit<React.ComponentProps<"div">, "children" | "defaultValue"> {
  /** Q&A pairs rendered as Accordion items */
  items: FAQItem[];
  /** Allow multiple items to be open at once (defaults to single-open) */
  multiple?: boolean;
  /** Initially open item value (single-mode) */
  defaultValue?: string;
  /** Optional headline + lead rendered above the accordion */
  children?: React.ReactNode;
}

function FAQ({ items, multiple = false, defaultValue, className, children, ...props }: FAQProps) {
  return (
    <Container data-slot="faq" size="narrow" className={cn(className)} {...props}>
      <Stack gap="lg">
        {children}
        <Accordion multiple={multiple} defaultValue={defaultValue ? [defaultValue] : undefined}>
          {items.map((item) => {
            const value = item.value ?? item.question;
            return (
              <AccordionItem key={value} value={value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Stack>
    </Container>
  );
}

export { FAQ, type FAQItem, type FAQProps };
