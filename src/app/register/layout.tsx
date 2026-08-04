import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | SLNews",
  description: "Join SLNews to save articles, follow contributors, and get community news and market alerts.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
