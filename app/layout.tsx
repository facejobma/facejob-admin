import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import "@uploadthing/react/styles.css";
import "./globals.css";
import React from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = "tmpSession";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans overflow-x-hidden">
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
