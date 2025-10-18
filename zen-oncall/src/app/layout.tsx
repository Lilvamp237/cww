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
  title: "CareSync - AI-Powered Healthcare Wellness Platform",
  description: "Prevent burnout, optimize schedules, and track wellness for healthcare professionals. AI-powered platform built for medical teams.",
  keywords: ["healthcare", "wellness", "burnout prevention", "shift scheduler", "medical professionals", "nurse wellness", "doctor wellness"],
  authors: [{ name: "CareSync Team" }],
  openGraph: {
    title: "CareSync - Healthcare Wellness Platform",
    description: "AI-powered wellness and scheduling for healthcare professionals",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
