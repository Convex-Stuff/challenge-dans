/**
 * Single source of truth for the site's name and navigation.
 *
 * Adding a page means adding an entry to `mainNav` and creating the route -
 * the header renders whatever this exports, so nothing else needs touching.
 */

export const siteConfig = {
  name: "Challenge Dans",
  description: "Challenge Dans",
  url: "https://dans.convex.coffee",
};

export type NavItem = {
  label: string;
  href: string;
  /** Renders as an anchor that opens in a new tab, with an external-link icon. */
  external?: boolean;
  /** Set to false to leave the item out of the header. */
  enabled?: boolean;
};

export const mainNav: NavItem[] = [];

/** The entries currently shown, in both the desktop nav and the mobile menu. */
export const visibleNav = mainNav.filter((item) => item.enabled !== false);
