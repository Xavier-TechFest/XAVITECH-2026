import { Camera, Globe2, Mail } from "lucide-react";

const links = [
  {
    label: "xavitech@xup.ac.in",
    href: "mailto:xavitech@xup.ac.in",
    icon: Mail,
  },
  {
    label: "@xavitech26",
    href: "https://www.instagram.com/xavitech26/",
    icon: Camera,
  },
  {
    label: "xavitech.xup.ac.in",
    href: "https://xavitech.xup.ac.in",
    icon: Globe2,
  },
];

export default function PostponementFooter() {
  return (
    <footer id="contact" className="relative z-10 border-t border-white/10 bg-[#05060a]/75 px-5 py-5 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-oxanium text-[10px] uppercase tracking-[0.18em] text-slate-400">
          Xavier Tech Fest · Xavier University, Patna
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {links.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              target={index === 1 ? "_blank" : undefined}
              rel={index === 1 ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-xs text-slate-300 transition-colors hover:text-marigold focus-visible:text-marigold"
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
