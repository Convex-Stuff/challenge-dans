import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { visibleNav, type NavItem } from "@/config/site";

/**
 * One nav entry. External items render an anchor that opens in a new tab and
 * carry an icon marking them as leaving the site; internal ones render a
 * Next.js Link so navigation stays client-side.
 */
function NavItemLink({ item }: { item: NavItem }) {
  if (item.external) {
    return (
      <NavigationMenuLink
        className={navigationMenuTriggerStyle()}
        render={<a href={item.href} target="_blank" rel="noopener noreferrer" />}
      >
        {item.label}
        <ExternalLinkIcon className="ml-1.5 size-3.5" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </NavigationMenuLink>
    );
  }

  return (
    <NavigationMenuLink
      className={navigationMenuTriggerStyle()}
      render={<Link href={item.href} />}
    >
      {item.label}
    </NavigationMenuLink>
  );
}

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {visibleNav.map((item) => (
          <NavigationMenuItem key={item.label}>
            <NavItemLink item={item} />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
