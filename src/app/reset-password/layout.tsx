import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | SLNews",
  description: "Choose a new password for your SLNews account.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
