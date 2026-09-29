import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, Oxanium, Sora } from "next/font/google";
// @ts-ignore CSS side-effect imports are handled by Next.js at build time.
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

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

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-oxanium",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XAVITECH — Tech Fest 2026 | Xavier University Patna",
  description:
    "Explore 15 flagship tech arenas, hackathons, coding duels, esports, and MUNs at XAVITECH 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07080B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${manrope.variable} ${oxanium.variable} ${sora.variable}`}
    >
      <body className="font-body antialiased bg-bg text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
