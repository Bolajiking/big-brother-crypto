"use cleint"

// import type { Metadata } from "next";
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

// export const metadata: Metadata = {
//   title: "BigBrotherCrypto - Live Streaming Platform",
//   description: "Watch live streams from multiple camera feeds with real-time chat",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <title>Big brother</title>
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
