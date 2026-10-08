import { FooterBackdrop } from "@/components/sections/Backdrops";
import Link from "next/link";
import LaunchButton from "@/components/effects/LaunchButton";

const INSTAGRAM_LINK = "https://www.instagram.com/xavitech26?stkn=MXF5ZGVneHhxOHh6bg==";
const MAP_LINK = "https://maps.app.goo.gl/cGfdXB7suchBRdd29";
// Xavier University, Patna (25.6416597, 85.0866313)
const MAP_EMBED = "https://www.google.com/maps?q=25.6416597,85.0866313&z=16&output=embed";

export default function Footer() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden">
      <FooterBackdrop />

      {/* bottom padding leaves room for the skyline strip */}
      <div className="relative mx-auto max-w-6xl px-5 pb-[calc(8rem_+_env(safe-area-inset-bottom))] pt-14 sm:px-6 sm:pt-16">
        <div className="grid items-start gap-10 sm:grid-cols-[minmax(0,17rem)_1fr] sm:gap-14 lg:gap-20">
          {/* brand column: logo, university wordmark, map — one shared width so every edge lines up */}
          <div className="mx-auto flex w-full max-w-[17rem] flex-col items-start sm:mx-0">
            <img
              src="/xavitech-logo-nav.webp"
              alt="XAVITECH"
              width={520}
              height={178}
              className="h-8 w-auto"
            />
            <img
              src="/xavier-university-wordmark.webp"
              alt="Xavier University, Patna"
              width={1230}
              height={264}
              loading="lazy"
              className="mt-4 h-auto w-full max-w-[15rem] opacity-95"
            />

            {/* Campus map: square tile with a warm golden light circling its edge; tap to open Google Maps */}
            <div className="map-glow mt-5 w-full">
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Xavier University, Patna in Google Maps"
                className="map-glow-inner group relative block aspect-square w-full overflow-hidden bg-surface"
              >
                {/* faint grid shows while the map tile loads (or offline) */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(53,224,201,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(53,224,201,0.35) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <iframe
                  title="Xavier University, Patna — map"
                  src={MAP_EMBED}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-90 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)_contrast(0.95)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                  <span>Xavier University · Patna</span>
                  <span className="text-marigold transition-transform duration-300 group-hover:translate-x-0.5">Open ↗</span>
                </span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 content-start gap-x-6 gap-y-9 sm:pt-1">
            <div>
              <p className="text-sm text-muted">On the day</p>
              <p className="mt-2 text-ink">31 OCTOBER 2026</p>
              <p className="text-ink">Main Campus</p>
            </div>
            <div>
              <p className="text-sm text-muted">Contact</p>
              <a
                href="mailto:xavitech@xup.ac.in"
                className="mt-2 block break-all py-1 text-ink transition-colors hover:text-circuit sm:break-normal"
              >
                xavitech@xup.ac.in
              </a>
              <Link
                href="/contact"
                className="mt-2 block py-1 text-ink transition-colors hover:text-circuit"
              >
                Full committee →
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted">Elsewhere</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="XAVITECH on Instagram — @xavitech26"
                  className="group inline-flex items-center gap-2 py-1 text-ink transition-colors hover:text-circuit"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  @xavitech26
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted">More</p>
              <div className="mt-2 flex flex-col items-start gap-1">
                <Link href="/registration" className="py-1 text-ink transition-colors hover:text-circuit">
                  Registration
                </Link>
                <Link href="/announcements" className="py-1 text-ink transition-colors hover:text-circuit">
                  Announcements
                </Link>
                <Link href="/gallery" className="py-1 text-ink transition-colors hover:text-circuit">
                  Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 sm:mt-16">
          <p className="text-xs text-muted">© 2026 XAVITECH. All rights reserved.</p>
          <LaunchButton />
        </div>
      </div>
    </footer>
  );
}
