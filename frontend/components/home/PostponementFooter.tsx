import { Globe2, Mail } from "lucide-react";

function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const links = [
  {
    label: "xavitech@xup.ac.in",
    href: "mailto:xavitech@xup.ac.in",
    icon: Mail,
  },
  {
    label: "@xavitech26",
    href: "https://www.instagram.com/xavitech26/",
    icon: InstagramIcon,
  },
  {
    label: "xavitech.in",
    href: "https://xavitech.in",
    icon: Globe2,
  },
];

export default function PostponementFooter() {
  return (
    <footer id="contact" className="relative z-10 border-t border-white/10 bg-[#05060a]/75 px-5 py-3 backdrop-blur-sm sm:px-8 sm:py-3.5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2.5 sm:flex-row sm:gap-4">
        <p className="font-oxanium text-[9px] uppercase tracking-[0.14em] text-slate-400 sm:text-[10px] sm:tracking-[0.18em]">
          Xavier Tech Fest · Xavier University, Patna
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:gap-x-5">
          {links.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              target={index === 1 ? "_blank" : undefined}
              rel={index === 1 ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-300 transition-colors hover:text-marigold focus-visible:text-marigold sm:text-[11px]"
            >
              <Icon size={13} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
