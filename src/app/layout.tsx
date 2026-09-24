import type { Metadata } from "next";
import { fontClassNames } from "@/design/fonts";
import { brandCssVariables } from "@/design/tokens";
import { Chatbot } from "@/components/ui/Chatbot";
import { Providers } from "@/components/shop/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joyce Wadawasina — Automation & AI consultant",
  description:
    "Joyce and her team help businesses work more efficiently: finding where time and labour are lost, reducing repetitive workload, bringing AI into the way you work safely, training your people and building the systems that keep it all running.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
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
      <body className="antialiased">
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
