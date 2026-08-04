import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SLNews",
  description: "Sign in to your SLNews account to save articles, follow contributors, and manage your news feed.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
