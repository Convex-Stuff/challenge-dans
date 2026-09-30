import { ExternalLinkIcon, MenuIcon } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig, visibleNav } from "@/config/site";
import { signInWithOsu } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/data/session";
import { cn } from "@/lib/utils";

// Every row in the menu: a full-width ghost button, left-aligned.
const itemLayout = "h-10 w-full justify-start text-sm";
const itemClass = cn(buttonVariants({ variant: "ghost", size: "lg" }), itemLayout);

/**
 * The header's menu on screens too narrow for the full nav (below `lg`): the
 * nav links, the theme switch, and Sign in for signed-out visitors, in a
 * sheet that slides in from the right.
 */
export async function MobileNav() {
  const viewer = await getCurrentUser();

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger
          aria-label="Open menu"
          render={
            <SheetTrigger
              render={<Button variant="ghost" size="icon-lg" className="lg:hidden" />}
            />
          }
        >
          <MenuIcon />
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>

        {visibleNav.length > 0 && (
          <>
            <nav aria-label="Main" className="flex flex-col gap-1 px-4">
              {visibleNav.map((item) =>
                item.external ? (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="lg"
                    nativeButton={false}
                    render={
                      <a href={item.href} target="_blank" rel="noopener noreferrer" />
                    }
                    className={itemLayout}
                  >
                    {item.label}
                    <ExternalLinkIcon className="ml-auto" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Button>
                ) : (
                  // The sheet lives in the layout, which stays mounted between
                  // pages, so each link closes it as it navigates.
                  <SheetClose
                    key={item.label}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    className={itemClass}
                  >
                    {item.label}
                  </SheetClose>
                ),
              )}
            </nav>
            <Separator />
          </>
        )}

        <div className="px-4 pt-2">
          <ThemeToggle withLabel className={itemClass} />
        </div>

        {/* Signed-in players sign out from their avatar menu in the header,
            which works at every screen size. */}
        {!viewer && (
          <SheetFooter className="border-t">
            <form action={signInWithOsu}>
              <Button type="submit" className="h-10 w-full">
                Sign in with osu!
              </Button>
            </form>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
