"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useLayoutEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  applyTheme,
  DEFAULT_THEME,
  saveTheme,
  storedTheme,
} from "@/lib/theme";

/**
 * Switches between light and dark mode. An icon button with a tooltip in the
 * header, or a full-width labelled row (`withLabel`) in the mobile menu.
 *
 * The icon and label are chosen by CSS from the `dark` class on <html>, so
 * the server and the browser render the same markup and nothing flickers.
 */
export function ThemeToggle({
  withLabel = false,
  className,
}: {
  withLabel?: boolean;
  className?: string;
}) {
  useLayoutEffect(() => {
    // In development, React's Strict Mode remount resets <html> to the
    // server-rendered default, so put a saved choice back. A no-op in
    // production.
    applyTheme(storedTheme() ?? DEFAULT_THEME);
  }, []);

  function toggle() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    saveTheme(next);
    applyTheme(next);
  }

  const icons = (
    <>
      <MoonIcon className="dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden dark:block" aria-hidden="true" />
    </>
  );
  // Names what a click switches to.
  const nextTheme = (
    <>
      <span className="dark:hidden">Dark mode</span>
      <span className="hidden dark:inline">Light mode</span>
    </>
  );

  if (withLabel) {
    return (
      <Button variant="ghost" size="lg" onClick={toggle} className={className}>
        {icons}
        {nextTheme}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className={className}
          />
        }
      >
        {icons}
      </TooltipTrigger>
      <TooltipContent>{nextTheme}</TooltipContent>
    </Tooltip>
  );
}
