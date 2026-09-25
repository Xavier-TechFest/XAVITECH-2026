import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XAVIKSHA — Tech Fest 2026",
  description:
    "The one-day technology festival. Events, live results, and everything happening on the ground — before, during, and after the day.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // let the page draw under notches / rounded corners; components add
  // env(safe-area-inset-*) padding where content would otherwise be clipped
  viewportFit: "cover",
  themeColor: "#07080B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
