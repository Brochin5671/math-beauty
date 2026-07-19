import type { NavItem } from "../HeaderMobile";

export const flatItems: NavItem[] = [
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const nestedItems: NavItem[] = [
  { label: "About", href: "/about/" },
  {
    label: "Resources",
    children: [
      { label: "Section A", href: "/resources/#section-a" },
      { label: "Section B", href: "/resources/#section-b" },
    ],
  },
  { label: "Contact", href: "/contact/" },
];
