import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import "@uploadthing/react/styles.css";
import "./globals.css";
import React from "react";
import localFont from "next/font/local";

<<<<<<< HEAD
const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

=======
>>>>>>> 940efd108bff19c9f23843b39d9139e1ef37a5bc
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = "tmpSession";
  return (
    <html lang="en" suppressHydrationWarning>
<<<<<<< HEAD
      <body className={`${inter.variable} font-sans overflow-hidden`}>
=======
      <body className="font-sans overflow-x-hidden">
>>>>>>> 940efd108bff19c9f23843b39d9139e1ef37a5bc
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
