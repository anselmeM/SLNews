import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile | SLNews",
  description: "Update your SLNews profile, preferences, and notification settings.",
};

export default function ProfileEditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
