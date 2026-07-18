"use client";

import { useToast } from "./Toast";

export default function ComingSoonButton({
  children,
  className,
  message,
}: {
  children: React.ReactNode;
  className?: string;
  message?: string;
}) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      className={className}
      onClick={() => toast(message || "Coming soon!", "info")}
    >
      {children}
    </button>
  );
}