import type { Metadata } from "next";
import { fontClassNames } from "@/design/fonts";
import { brandCssVariables } from "@/design/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joyce Wadawasina — AI & automation, explained simply",
  description:
    "Your business is growing. Your workload doesn't have to grow with it. Joyce turns repetitive, manual processes into simpler systems that give you back time to run your business.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <style
          id="brand-tokens"
          dangerouslySetInnerHTML={{ __html: brandCssVariables }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
