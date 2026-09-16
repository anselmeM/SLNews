import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TermsOfServicePage, { metadata } from "../page";

describe("TermsOfServicePage Component", () => {
  it("exports valid metadata with terms title", () => {
    expect(metadata.title).toBe("Terms of Service | SLNews");
    expect(metadata.description).toContain("Terms of service");
  });

  it("renders terms headings and disclaimers", () => {
    render(<TermsOfServicePage />);

    expect(screen.getByRole("heading", { name: "Terms of Service", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/1\. Acceptance of Terms/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. News Aggregation & Content Attribution/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Financial & Market Information Disclaimer/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. User-Generated Notices & Community Conduct/i)).toBeInTheDocument();
    expect(screen.getByText(/contact@slnews\.sl/i)).toBeInTheDocument();
  });

  it("renders navigation links to Privacy and Home", () => {
    render(<TermsOfServicePage />);

    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /Home/i })).toHaveAttribute("href", "/");
  });
});
