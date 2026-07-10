import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import { appName, siteDescription, siteUrl } from "@/lib/shared";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: "%s – Ryo-auth",
  },
  description: siteDescription,
  openGraph: {
    title: appName,
    description: siteDescription,
    url: siteUrl,
    images: "/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: siteDescription,
    images: "/og-image.png",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
