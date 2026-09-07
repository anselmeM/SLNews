import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReelVideo } from "@/app/actions/reel-actions";
import ReelCard from "@/components/reels/ReelCard";

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ isSignedIn: true }),
}));

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockReel: ReelVideo = {
  id: "reel-1",
  title: "Freetown Tech Innovation Hub",
  summary: "Young developers creating mobile solutions.",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnailUrl: "/reel-thumb.jpg",
  source: "AYV News",
  category: "Tech",
  publishedAt: new Date().toISOString(),
  authorId: "author-1",
};

describe("ReelCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reel title and category", () => {
    render(<ReelCard reel={mockReel} isActive={true} />);
    expect(screen.getByText("Freetown Tech Innovation Hub")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  it("increments like count when like button is clicked", () => {
    render(<ReelCard reel={mockReel} isActive={true} />);
    const likeBtn = screen.getByLabelText(/Like video/i);
    expect(screen.getByText("18")).toBeInTheDocument();

    fireEvent.click(likeBtn);
    expect(screen.getByText("19")).toBeInTheDocument();
  });
});
