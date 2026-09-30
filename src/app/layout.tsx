import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "challenge-dans",
  description: "dans.convex.coffee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
