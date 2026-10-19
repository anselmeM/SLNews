import Link from "next/link";

/** Footer shared by every marketing page. */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-outline-variant/20 py-8 text-xs text-on-surface-variant">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} SLNews. Sierra Leone.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-on-surface">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-on-surface">
            Terms of use
          </Link>
          <Link href="/delete-account" className="hover:text-on-surface">
            Delete account
          </Link>
          <Link href="/download" className="hover:text-on-surface">
            Download
          </Link>
          <a href="mailto:contact@slnews.sl" className="hover:text-on-surface">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
