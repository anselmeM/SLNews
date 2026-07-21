"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReturningVisitorCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const visited = localStorage.getItem("slnews_visited");
    if (visited) {
      router.replace("/home");
    } else {
      localStorage.setItem("slnews_visited", "true");
    }
  }, [router]);

  return <>{children}</>;
}
