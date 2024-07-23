import "./globals.css";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { ThemeProvider } from "@/ui/ThemeProvider";
import { Toaster } from "@/ui/components/toaster";

export const metadata: Metadata = {
  title: "Auth example",
  description: "Kick start your project with a working secure and cheap Auth.",
};

interface RootLayouttProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayouttProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
