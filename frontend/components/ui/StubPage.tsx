import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StaticSky from "@/components/effects/StaticSky";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * A few pages in the site map (Results, Registration, Announcements, Gallery)
 * don't have real content yet — no results until judging happens, no
 * registration flow decided, etc. Rather than leave their nav links pointing
 * nowhere (a broken link either way), each gets a real, on-brand page that's
 * honest about not being live yet, so the site's structure is complete now
 * and only the content inside these needs filling in later.
 */
export default function StubPage({
  eyebrowN,
  title,
  children,
}: {
  eyebrowN: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <StaticSky />
      <Navbar />
      <div className="relative z-10">
        <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-6 sm:pt-36 lg:pt-40">
          <Eyebrow n={eyebrowN}>{title}</Eyebrow>
          <div className="mt-6 space-y-4 text-muted sm:mt-8 sm:text-lg">{children}</div>
        </main>
        <Footer />
      </div>
    </>
  );
}
