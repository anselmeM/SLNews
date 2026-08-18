import type { Metadata } from "next";
import NotificationsClient from "./_components/NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | SLNews",
  description: "Stay up to date with breaking Sierra Leone news, daily digests, and market price movements.",
};

export default function NotificationsPage() {
  return (
    <div className="py-6 sm:py-8">
      <NotificationsClient />
    </div>
  );
}
