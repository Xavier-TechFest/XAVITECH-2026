import { FooterBackdrop } from "@/components/sections/Backdrops";
import LaunchButton from "@/components/effects/LaunchButton";

export default function Footer() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden">
      <FooterBackdrop />

      {/* bottom padding leaves room for the skyline strip */}
      <div className="relative mx-auto max-w-6xl px-5 pb-[calc(8rem_+_env(safe-area-inset-bottom))] pt-14 sm:px-6 sm:pt-16">
        <div className="grid gap-8 sm:grid-cols-[1fr_1.4fr] sm:gap-16">
          <p className="font-display text-lg font-bold text-ink">XAVITECH</p>

          <div className="flex flex-wrap gap-x-10 gap-y-8 sm:gap-x-16">
            <div>
              <p className="text-sm text-muted">On the day</p>
              <p className="mt-2 text-ink">30 OCTOBER 2026</p>
              <p className="text-ink">Main Campus</p>
            </div>
            <div>
              <p className="text-sm text-muted">Contact</p>
              <a
                href="mailto:techfest@college.edu"
                className="mt-2 block break-all py-1 text-ink transition-colors hover:text-circuit sm:break-normal"
              >
                info@xup.ac.in
              </a>
            </div>
            <div>
              <p className="text-sm text-muted">Elsewhere</p>
              <div className="mt-2 flex gap-5">
                <a href="#" className="py-1 text-ink transition-colors hover:text-circuit">
                  Instagram
                </a>
                <a href="#" className="py-1 text-ink transition-colors hover:text-circuit">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 sm:mt-16">
          <p className="text-xs text-muted">© 2026 XAVITECH · Xavier University, Patna. All rights reserved.</p>
          <LaunchButton />
        </div>
      </div>
    </footer>
  );
}
