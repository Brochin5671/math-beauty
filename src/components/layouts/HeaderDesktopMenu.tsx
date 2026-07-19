import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/elements/NavigationMenu";
import { hasActiveChild, type NavItem } from "@/components/layouts/HeaderMobile";
import { cn } from "@/lib/utils";

export type NavItemsGap = "sm" | "default" | "lg";

/*
 * Gap between desktop nav items, applied as a class on NavigationMenuList
 * whose base is gap-0. twMerge lets the chosen value win over that base.
 */
const ITEMS_GAP: Record<NavItemsGap, string> = {
  sm: "gap-4",
  default: "gap-6",
  lg: "gap-8",
};

interface HeaderDesktopMenuProps {
  currentPath: string;
  items: NavItem[];
  /** Spacing between the nav items. Default "default" */
  itemsGap?: NavItemsGap;
}

/*
 * Desktop nav rendered via the shadcn NavigationMenu primitive (hover-intent
 * dropdowns, shared viewport positioning, roving-focus keyboard a11y).
 * Flat items render as NavigationMenuLink. Items with children render as
 * NavigationMenuTrigger + NavigationMenuContent. Active state is computed
 * from currentPath against href / child.href
 */
function HeaderDesktopMenu({ items, currentPath, itemsGap = "default" }: HeaderDesktopMenuProps) {
  return (
    // Render as <div> so the outer Header's <nav data-slot="header"> stays the only
    // navigation landmark (axe landmark-unique). Base UI auto-uses <div> only when
    // nested inside another NavigationMenu primitive, not under arbitrary <nav>
    <NavigationMenu render={<div />}>
      <NavigationMenuList className={ITEMS_GAP[itemsGap]}>
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            const parentActive = hasActiveChild(item, currentPath);
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  variant="ghost"
                  className={cn("text-base", parentActive ? "font-semibold opacity-100" : null)}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-56 gap-1">
                    {item.children.map((child) => {
                      const isActive = currentPath === child.href;
                      return (
                        <li key={child.href}>
                          <NavigationMenuLink
                            render={
                              // content is forwarded via NavigationMenuLink children, merged into this <a> by Base UI's useRender
                              <a
                                href={child.href}
                                data-active={isActive || undefined}
                                className="text-sm text-muted-foreground hover:text-foreground data-[active=true]:font-semibold data-[active=true]:text-foreground"
                              />
                            }>
                            {child.label}
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          const isActive = currentPath === item.href;
          return (
            <NavigationMenuItem key={item.href ?? item.label}>
              <NavigationMenuLink
                variant="ghost"
                className="px-4 py-2 text-base font-medium"
                render={
                  // content is forwarded via NavigationMenuLink children, merged into this <a> by Base UI's useRender
                  <a href={item.href} data-active={isActive || undefined} />
                }>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export { HeaderDesktopMenu };
