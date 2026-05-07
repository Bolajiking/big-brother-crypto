"use client"

import "./globals.css";
import { PrivyProviderWrapper } from "@/lib/privy";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Star Factor · Watch. Predict. Earn.</title>
        <meta name="description" content="Live reality TV with skin in the game. Watch the house. Predict the drama. Earn from your takes. Lagos · Q4 2026." />

        {/* Inter Display Font */}
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://starfactor.tv/" />
        <meta property="og:title" content="Star Factor · Watch. Predict. Earn." />
        <meta property="og:description" content="Live reality TV with skin in the game. Watch the house. Predict the drama. Earn from your takes. Lagos · Q4 2026." />
        <meta property="og:image" content="https://starfactor.tv/starfactor.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:site_name" content="Star Factor" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://starfactor.tv/" />
        <meta name="twitter:title" content="Star Factor · Watch. Predict. Earn." />
        <meta name="twitter:description" content="Live reality TV with skin in the game. Watch the house. Predict the drama. Earn from your takes. Lagos · Q4 2026." />
        <meta name="twitter:image" content="https://starfactor.tv/starfactor.png" />
        <meta name="twitter:site" content="@starfactortv" />
        <meta name="twitter:creator" content="@starfactortv" />

        {/* Additional Meta */}
        <meta name="theme-color" content="#08153C" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/starfactor.png" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Inter', 'Inter Display', system-ui, -apple-system, sans-serif" }}
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
