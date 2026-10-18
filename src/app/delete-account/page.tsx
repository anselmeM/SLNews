import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your SLNews account | SLNews",
  description:
    "How to delete your SLNews account and the data we hold, with or without the app installed.",
};

export default function DeleteAccountPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[18px]">
            delete_forever
          </span>
          Account
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-2">
          Delete your SLNews account
        </h1>
        <p className="text-xs text-on-surface-variant">
          Free, and you do not need the app installed to ask.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              phone_android
            </span>
            In the app
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open SLNews and tap the ⋮ menu.</li>
            <li>
              Open <strong>Settings</strong> → <strong>SLNews account</strong>.
            </li>
            <li>
              Tap <strong>Delete account</strong> and confirm. You are signed
              out immediately and the synced data is removed.
            </li>
          </ol>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              mail
            </span>
            Without the app
          </h2>
          <p>
            Email{" "}
            <a
              href="mailto:privacy@slnews.sl?subject=Delete%20my%20SLNews%20account"
              className="text-primary font-semibold hover:underline"
            >
              privacy@slnews.sl
            </a>{" "}
            from the address you signed up with and ask us to delete your SLNews
            account. If you cannot email from that address, tell us the address
            and we will verify another way before deleting.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              checklist
            </span>
            What gets deleted
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Your account record: email, display name and account identifier.
            </li>
            <li>
              The saved stories, likes and follows we synced for that account.
            </li>
            <li>Any push-notification token stored for the account.</li>
          </ul>
          <p className="mt-3">
            <strong>Not affected:</strong> content cached on your phone — sign
            out and uninstall to clear it — and anything on third-party sites
            you visited from SLNews.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              schedule
            </span>
            How long it takes
          </h2>
          <p>
            Deletion is immediate for your account and synced data. Backups are
            purged on a rolling basis within <strong>90 days</strong>. You
            receive a confirmation email when the deletion is complete.
          </p>
          <p className="mt-3">
            <strong>Changed your mind?</strong> Deletion cannot be undone. You
            can create a new account later, but saved stories, likes and follows
            from the deleted account cannot be restored.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-3xl">
          <h2 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              help
            </span>
            Questions
          </h2>
          <p>
            Write to{" "}
            <a
              href="mailto:privacy@slnews.sl"
              className="text-primary font-semibold hover:underline"
            >
              privacy@slnews.sl
            </a>
            . See also the{" "}
            <Link
              href="/privacy"
              className="text-primary font-semibold hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and the{" "}
            <Link
              href="/terms"
              className="text-primary font-semibold hover:underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          href="/"
          className="text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          Back to Home
        </Link>
        <Link
          href="/privacy"
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Privacy Policy →
        </Link>
      </div>
    </div>
  );
}
