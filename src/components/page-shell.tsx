import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared page frame: consistent width, padding and heading treatment so
 * individual routes only supply their content. `wide` suits content that
 * needs more room than the header, such as the bracket.
 */
export function PageShell({
  title,
  description,
  wide = false,
  children,
}: {
  title: string;
  description?: string;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full flex-1 px-4 py-10",
        wide ? "max-w-[90rem]" : "max-w-6xl",
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="mt-8">{children}</div>}
    </main>
  );
}
