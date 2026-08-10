// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: "PetArk",
  description: "PetArk for Clinics",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#22c55e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/google-sans"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}