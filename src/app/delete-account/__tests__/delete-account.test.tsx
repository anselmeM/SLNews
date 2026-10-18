import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DeleteAccountPage, { metadata } from "../page";

describe("DeleteAccountPage", () => {
  it("exports deletion metadata", () => {
    expect(metadata.title).toBe("Delete your SLNews account | SLNews");
    expect(metadata.description).toContain("delete your SLNews account");
  });

  it("explains both deletion paths and what is removed", () => {
    render(<DeleteAccountPage />);

    expect(
      screen.getByRole("heading", {
        name: "Delete your SLNews account",
        level: 1,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/In the app/i)).toBeInTheDocument();
    expect(screen.getByText(/Without the app/i)).toBeInTheDocument();
    expect(screen.getByText(/What gets deleted/i)).toBeInTheDocument();
    expect(screen.getByText(/How long it takes/i)).toBeInTheDocument();
  });

  it("offers a monitored deletion address and links the policies", () => {
    render(<DeleteAccountPage />);

    const mailto = screen
      .getAllByRole("link")
      .find((link) =>
        link.getAttribute("href")?.startsWith("mailto:privacy@slnews.sl")
      );
    expect(mailto).toBeDefined();

    // The page links both policies in the body and in its footer.
    const privacyLinks = screen.getAllByRole("link", {
      name: /Privacy Policy/i,
    });
    expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
    expect(privacyLinks[0]).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("link", { name: /Terms of Service/i })
    ).toHaveAttribute("href", "/terms");
  });
});
