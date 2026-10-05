import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ReadingStats from "../ReadingStats";
import { useAppStore } from "@/store/useAppStore";

const DEFAULTS = {
  storiesReadCount: 0,
  savedArticles: [],
  preferredTopics: [] as string[],
};

describe("ReadingStats", () => {
  beforeEach(() => {
    useAppStore.setState(DEFAULTS);
  });

  it("renders nothing before the reader has opened a story", () => {
    const { container } = render(<ReadingStats />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the accumulated counts once something has been read", () => {
    useAppStore.setState({
      storiesReadCount: 12,
      savedArticles: [
        { id: "a" },
        { id: "b" },
      ] as never,
      preferredTopics: ["Tech"],
    });

    render(<ReadingStats />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("stories read")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("stories saved")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("topic followed")).toBeInTheDocument();
  });

  it("hides the stats that are still zero instead of showing a row of zeros", () => {
    useAppStore.setState({ storiesReadCount: 1 });

    render(<ReadingStats />);

    expect(screen.getByText("story read")).toBeInTheDocument();
    expect(screen.queryByText(/stories saved/)).not.toBeInTheDocument();
    expect(screen.queryByText(/topics followed/)).not.toBeInTheDocument();
  });

  it("states that the count stays on the device", () => {
    useAppStore.setState({ storiesReadCount: 3 });

    render(<ReadingStats />);

    expect(
      screen.getByText(/your reading stays yours/i)
    ).toBeInTheDocument();
  });
});
