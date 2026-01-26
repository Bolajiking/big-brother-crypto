"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrivyProviderWrapper } from "@/lib/privy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Star Factor - Africa&apos;s First Interactive Reality TV</title>
        <meta name="description" content="Africa's first Interactive Reality TV platform. Watch, Predict, Earn" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://starfactor.tv/" />
        <meta property="og:title" content="Star Factor - Africa's First Interactive Reality TV" />
        <meta property="og:description" content="Africa's first Interactive Reality TV platform. Watch, Predict, Earn" />
        <meta property="og:image" content="https://starfactor.tv/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:site_name" content="Star Factor" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://starfactor.tv/" />
        <meta name="twitter:title" content="Star Factor - Africa's First Interactive Reality TV" />
        <meta name="twitter:description" content="Africa's first Interactive Reality TV platform. Watch, Predict, Earn" />
        <meta name="twitter:image" content="https://starfactor.tv/og-image.png" />
        <meta name="twitter:site" content="@starfactortv" />
        <meta name="twitter:creator" content="@starfactortv" />

        {/* Additional Meta */}
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/og-image.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PrivyProviderWrapper>
          <div suppressHydrationWarning>
            {children}
          </div>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
