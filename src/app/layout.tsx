import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blue Ship Sync - AI-Powered Logistics Platform",
  description: "Transform your logistics operations with AI-powered warehouse management, real-time tracking, and intelligent optimization.",
  keywords: ["logistics", "warehouse management", "AI", "supply chain", "shipping", "tracking"],
  authors: [{ name: "Blue Ship Sync" }],
  creator: "Blue Ship Sync",
  publisher: "Blue Ship Sync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://blueshipsync.com'),
  openGraph: {
    title: "Blue Ship Sync - AI-Powered Logistics Platform",
    description: "Transform your logistics operations with AI-powered warehouse management, real-time tracking, and intelligent optimization.",
    url: 'https://blueshipsync.com',
    siteName: 'Blue Ship Sync',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'Blue Ship Sync Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blue Ship Sync - AI-Powered Logistics Platform",
    description: "Transform your logistics operations with AI-powered warehouse management, real-time tracking, and intelligent optimization.",
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}