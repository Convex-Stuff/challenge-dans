import type { Metadata } from "next";
import { Geist_Mono, Saira } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { DEFAULT_THEME, themeScript } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Body text, tables, forms and buttons (`font-sans`), and for now headings too
// (`font-heading`, see globals.css).
const saira = Saira({ subsets: ["latin"], variable: "--font-saira" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Rendered in the default theme, so it's right even without JavaScript;
    // the theme script swaps in a saved choice before the first paint, so
    // React is told to keep the attributes it finds on <html> rather than warn.
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        saira.variable,
        DEFAULT_THEME === "dark" && "dark",
      )}
      style={{ colorScheme: DEFAULT_THEME }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Lets tooltips share one delay; it renders no element of its own. */}
        <TooltipProvider>
          <SiteHeader />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
