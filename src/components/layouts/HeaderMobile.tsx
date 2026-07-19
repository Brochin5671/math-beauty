import type * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/elements/Accordion";
import { Button } from "@/components/elements/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/elements/Sheet";
import { cn } from "@/lib/utils";

export interface NavItem {
  /** Nested sub-items. When set, this item becomes a dropdown on desktop and an accordion on mobile */
  children?: NavItem[];
  /** URL for flat items. Ignored if `children` is set */
  href?: string;
  label: string;
}

interface HeaderMobileProps {
  /** Trigger content (icon, text, or markup). Passed via the mobile-trigger slot on the parent Header */
  children?: React.ReactNode;
  currentPath: string;
  items: NavItem[];
  /** aria-label for the trigger button. Defaults to 'Open menu' */
  mobileTriggerLabel?: string;
}

export function hasActiveChild(item: NavItem, currentPath: string): boolean {
  return item.children?.some((child) => child.href === currentPath) ?? false;
}

function HeaderMobile({
  items,
  currentPath,
  mobileTriggerLabel = "Open menu",
  children,
}: HeaderMobileProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={mobileTriggerLabel}>
            {children}
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 px-4">
          {items.map((item) => {
            if (item.children && item.children.length > 0) {
              const parentActive = hasActiveChild(item, currentPath);
              return (
                <Accordion
                  key={item.label}
                  defaultValue={parentActive ? [item.label] : undefined}
                  className="[&_h3]:mb-0">
                  <AccordionItem value={item.label} className="border-none">
                    <AccordionTrigger
                      className={cn(
                        "py-0 text-base font-medium hover:no-underline [&>svg]:h-4 [&>svg]:w-4",
                        parentActive ? "text-foreground font-semibold" : "text-muted-foreground",
                      )}>
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-3">
                      <div className="flex flex-col gap-3 pl-4">
                        {item.children.map((child) => {
                          const isChildActive = currentPath === child.href;
                          return (
                            <a
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "text-sm transition-colors hover:text-foreground",
                                isChildActive
                                  ? "text-foreground font-semibold"
                                  : "text-muted-foreground",
                              )}>
                              {child.label}
                            </a>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href ?? item.label}
                href={item.href}
                className={cn(
                  "text-base font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground",
                )}>
                {item.label}
              </a>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export { HeaderMobile };
