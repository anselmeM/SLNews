import type { Metadata } from "next";
import ReelsFeed from "./ReelsFeed";
import { fetchReelsFeed } from "@/app/actions/reel-actions";
import SubmitReelModal from "@/components/reels/SubmitReelModal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shorts & Video News Reels | SLNews",
  description: "Watch short video news, eyewitness clips, Facebook and Instagram stories from across Sierra Leone.",
};

export default async function ReelsPage() {
  const initialReels = await fetchReelsFeed(0, 10);

  return (
    <main className="relative w-full h-[100dvh] bg-black overflow-hidden">
      <ReelsFeed initialReels={initialReels} />
      <SubmitReelModal />
    </main>
  );
}
