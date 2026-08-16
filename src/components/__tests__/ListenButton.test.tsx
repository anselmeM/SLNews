import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ListenButton from "@/components/ListenButton";

class MockSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe("ListenButton", () => {
  const mockSpeak = vi.fn();
  const mockCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
      },
    });

    global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
  });

  it("renders when speechSynthesis is available", () => {
    render(<ListenButton title="Test Title" content="Test Content" />);
    expect(screen.getByRole("button", { name: /listen to article audio/i })).toBeInTheDocument();
  });

  it("triggers speak when clicked", () => {
    render(<ListenButton title="Test Title" content="Test Content" />);
    const button = screen.getByRole("button", { name: /listen to article audio/i });
    fireEvent.click(button);
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /stop listening/i })).toBeInTheDocument();
  });

  it("cancels playback when clicked while active", () => {
    render(<ListenButton title="Test Title" content="Test Content" />);
    const button = screen.getByRole("button", { name: /listen to article audio/i });
    fireEvent.click(button);
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /stop listening/i }));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
