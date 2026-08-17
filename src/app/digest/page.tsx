import type { Metadata } from "next";
import DigestClient from "./_components/DigestClient";
import { getPersonalizedDigest } from "@/app/actions/digest-actions";

export const metadata: Metadata = {
  title: "Daily News Digest | SLNews",
  description: "Personalized daily news briefing and morning digest for Sierra Leone.",
};

export const dynamic = "force-dynamic";

export default async function DigestPage() {
  const digest = await getPersonalizedDigest();

  return (
    <div className="w-full min-h-screen pb-16">
      <DigestClient digest={digest} />
    </div>
  );
}
