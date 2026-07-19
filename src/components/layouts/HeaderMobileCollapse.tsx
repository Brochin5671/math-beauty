import { useEffect, useState } from "react";
import { Button } from "@/components/elements/Button";
import type { NavItem } from "@/components/layouts/HeaderMobile";
import { cn } from "@/lib/utils";

interface HeaderMobileCollapseProps {
  /** Trigger content (icon or text). Passed via the mobile-trigger slot */
  children?: React.ReactNode;
  currentPath: string;
  items: NavItem[];
  /** aria-label for the trigger button */
  mobileTriggerLabel?: string;
}

/*
 * Slide-down collapse mobile nav. Links expand vertically below the
 * header bar when the hamburger is clicked. Uses CSS Grid rows
 * transition (0fr -> 1fr) for smooth height animation. No overlay,
 * no portal, no focus trap. Simplest mobile nav pattern
 */
function HeaderMobileCollapse({
  items,
  currentPath,
  mobileTriggerLabel = "Open menu",
  children,
}: HeaderMobileCollapseProps) {
  const [open, setOpen] = useState(false);
  // Gate the trigger until React hydrates
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  /* Render nested items: parents as labels, children as indented links */
  const renderItems = (navItems: NavItem[], depth = 0) =>
    navItems.map((item) => {
      const isActive = currentPath === item.href;
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return (
          <div key={item.label}>
            <span
              className={cn(
                "block px-4 py-2 text-sm font-semibold opacity-70",
                depth > 0 && "pl-8",
              )}>
              {item.label}
            </span>
            {item.children ? renderItems(item.children, depth + 1) : null}
          </div>
        );
      }

      return (
        <a
          key={item.href ?? item.label}
          href={item.href}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className={cn(
            "block px-4 py-2 text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-foreground",
            isActive && "bg-accent text-foreground font-semibold",
            depth > 0 && "pl-8",
          )}>
          {item.label}
        </a>
      );
    });

  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        className="[&_svg]:size-8"
        aria-label={mobileTriggerLabel}
        aria-expanded={open}
        disabled={!hydrated}
        onClick={() => setOpen(!open)}>
        {children}
      </Button>

      {/* Grid rows transition: 0fr (collapsed) -> 1fr (expanded) for smooth height animation */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}>
        <div className="overflow-hidden">
          <nav
            className="flex flex-col border-b border-border bg-background py-2 shadow-md"
            aria-hidden={!open}>
            {renderItems(items)}
          </nav>
        </div>
      </div>
    </>
  );
}

export { HeaderMobileCollapse };
