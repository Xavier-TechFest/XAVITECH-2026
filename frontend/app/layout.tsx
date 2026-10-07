import type { Metadata, Viewport } from "next";
import { Rajdhani, Space_Grotesk, Orbitron } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import LoadingScreen from "@/components/effects/LoadingScreen";
import SoundToggle from "@/components/effects/SoundToggle";
import "./globals.css";

// Headings — angular, technical, still fully readable at any size.
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body / UI — clean and futuristic without sacrificing legibility.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Reserved for a handful of special elements — countdown digits, HUD
// readouts, section numbering. Not used for running text: it's a display
// face and gets harder to read below ~14px.
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-accent",
  display: "swap",
});

const SITE_URL = "https://xavitech.in";
const TITLE = "XAVITECH 2026 — Xavier Tech Fest";
const DESCRIPTION =
  "XAVITECH 2026 — a one-day technology festival at Xavier University, Patna, on 31 October 2026. Five tracks, a full events lineup, live schedule and results.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · XAVITECH 2026" },
  description: DESCRIPTION,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "XAVITECH 2026",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "XAVITECH 2026" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
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
    <html lang="en" className={`${rajdhani.variable} ${spaceGrotesk.variable} ${orbitron.variable}`}>
      <body className="font-body antialiased bg-bg text-ink">
        <AuthProvider>
          <LoadingScreen />
          {children}
          <SoundToggle />
        </AuthProvider>
      </body>
    </html>
  );
}
