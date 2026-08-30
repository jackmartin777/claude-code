import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site } from "@/data/site";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hercules.app"),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Hercules",
    "AI app builder",
    "AI app builder for business",
    "custom software",
    "build internal tools",
    "AI website builder",
    "build apps with AI",
    "build websites with AI",
    "no code",
    "low code",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Hercules | The AI App Builder Built for Business",
    description: site.ogDescription,
    url: "https://hercules.app",
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hercules | The AI App Builder Built for Business",
    description: site.ogDescription,
    site: site.twitter,
    creator: site.twitter,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
