import Link from "next/link";

const links = [
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/download", label: "Download" },
  { href: "/privacy", label: "Privacy" },
];

/** Marketing chrome: no news navigation, no app drawer. */
export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-black tracking-tight text-on-surface"
        >
          SLNews
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-on-surface-variant sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/download"
          className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
        >
          Get the app
        </Link>
      </div>
    </header>
  );
}
