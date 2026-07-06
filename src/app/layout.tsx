import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ParkInBoulder - Downtown Boulder Parking | Just $5/day Weekdays",
    template: "%s | ParkInBoulder",
  },
  description:
    "The cheapest parking in downtown Boulder, Colorado. 12 spaces, just $5/day weekdays, $15/day weekends. Pay online — no app needed. Scan the QR code and go.",
  keywords: [
    "Boulder parking",
    "downtown Boulder parking",
    "where to park in Boulder",
    "Boulder Colorado parking",
    "cheap parking Boulder",
    "daily parking Boulder",
    "parking near Pearl Street",
    "Boulder parking lot",
    "pay to park Boulder",
    "Boulder CO parking",
  ],
  authors: [{ name: "ParkInBoulder" }],
  openGraph: {
    title: "ParkInBoulder - Downtown Boulder Parking",
    description:
      "The cheapest parking in downtown Boulder, CO. 12 spaces, just $5/day weekdays, $15/day weekends. Pay online — no app needed.",
    url: "https://parkinboulder.com",
    siteName: "ParkInBoulder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ParkInBoulder - Downtown Boulder Parking",
    description:
      "The cheapest parking in downtown Boulder, CO. Just $5/day weekdays, $15/day weekends. Scan & pay — no app needed.",
  },
  alternates: {
    canonical: "https://parkinboulder.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
