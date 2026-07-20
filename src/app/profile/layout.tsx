import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | SLNews",
  description: "Manage your SLNews account, preferences, and settings.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
