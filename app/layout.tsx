import type { Metadata } from "next";
import { Toaster } from "sonner"; // import Toaster
import "./globals.css";
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: "PetArk",
  description: "PetArk for Clinics",
  manifest: "/manifest.json",
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
        {/* Manrope Google Fonts link */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope&display=swap"
          rel="stylesheet"
        />
        
        {/* Google Sans */}
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