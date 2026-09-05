import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomeBriefingHero from "../HomeBriefingHero";
import type { PersonalizedDigest } from "@/lib/digest-generator";

vi.mock("@/components/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/ListenButton", () => ({
  default: () => <button data-testid="listen-button">Listen</button>,
}));

vi.mock("@/store/useAudioPlayerStore", () => ({
  useAudioPlayerStore: vi.fn((selector) =>
    selector({
      isPlaying: false,
      playQueue: vi.fn(),
    })
  ),
}));

const mockDigest: PersonalizedDigest = {
  dateFormatted: "Saturday, September 5, 2026",
  greeting: "Good Afternoon",
  totalReadTimeMinutes: 4,
  preferredRegion: "Western Area",
  preferredTopics: ["Politics", "Economy"],
  leadStory: {
    id: "lead-1",
    title: "Major Infrastructure Project Announced",
    summary: "Government unveils new solar grid project.",
    content: "Full details about the solar project.",
    category: "Development",
    imageUrl: "/images/lead.jpg",
    publishedAt: new Date().toISOString(),
    source: "SierraLoaded",
    readTimeMinutes: 3,
    matchReasons: ["Top national story"],
  },
  regionalStories: [],
  topicStories: [],
  quickBriefs: [],
  fallbackToNational: false,
};

describe("HomeBriefingHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header greeting and starts collapsed by default", () => {
    render(<HomeBriefingHero digest={mockDigest} />);

    // Greeting is visible
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Good Afternoon");

    // Collapsed state: toggle button shows "Open Briefing"
    const toggleButton = screen.getByRole("button", { name: /Open Daily Briefing/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent("Open Briefing");

    // Digest body contents should not be visible when collapsed
    expect(screen.queryByText("Tailored for:")).not.toBeInTheDocument();
    expect(screen.queryByText("Major Infrastructure Project Announced")).not.toBeInTheDocument();
  });

  it("expands to reveal briefing details when toggle button is clicked", () => {
    render(<HomeBriefingHero digest={mockDigest} />);

    const toggleButton = screen.getByRole("button", { name: /Open Daily Briefing/i });
    fireEvent.click(toggleButton);

    // Now expanded: toggle button shows "Close"
    expect(screen.getByRole("button", { name: /Close Daily Briefing/i })).toBeInTheDocument();
    expect(screen.getByText("Tailored for:")).toBeInTheDocument();
    expect(screen.getByText("Major Infrastructure Project Announced")).toBeInTheDocument();

    // Clicking again collapses it
    const closeButton = screen.getByRole("button", { name: /Close Daily Briefing/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText("Tailored for:")).not.toBeInTheDocument();
    expect(screen.queryByText("Major Infrastructure Project Announced")).not.toBeInTheDocument();
  });

  it("expands and collapses when clicking the greeting header area", () => {
    render(<HomeBriefingHero digest={mockDigest} />);

    const headerToggle = screen.getByRole("button", { name: /Reveal Daily Briefing/i });
    fireEvent.click(headerToggle);

    expect(screen.getByText("Tailored for:")).toBeInTheDocument();

    const collapseHeader = screen.getByRole("button", { name: /Collapse Daily Briefing/i });
    fireEvent.click(collapseHeader);

    expect(screen.queryByText("Tailored for:")).not.toBeInTheDocument();
  });
});
