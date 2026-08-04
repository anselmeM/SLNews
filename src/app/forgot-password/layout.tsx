import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | SLNews",
  description: "Reset your SLNews account password with a secure email link.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
