import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Articles | SLNews",
  description: "Your bookmarked and saved articles on SLNews.",
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
