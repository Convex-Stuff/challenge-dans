import Link from "next/link";

import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig, visibleNav } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        {/* Truncates rather than pushing the buttons off very narrow screens. */}
        <Link href="/" className="min-w-0 truncate font-heading font-semibold">
          {siteConfig.name}
        </Link>

        {/* The full nav needs a laptop-width screen; below that, the menu
            button in MobileNav holds the same links. */}
        {visibleNav.length > 0 && (
          <div className="hidden lg:block">
            <MainNav />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Below lg the switch lives in the mobile menu instead, to keep
              the header on one line. */}
          <ThemeToggle className="hidden lg:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
