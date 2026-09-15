import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PrivacyPolicyPage, { metadata } from "../page";

describe("PrivacyPolicyPage Component", () => {
  it("exports valid metadata with privacy title", () => {
    expect(metadata.title).toBe("Privacy Policy | SLNews");
    expect(metadata.description).toContain("Privacy policy");
  });

  it("renders main privacy headings and content sections", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/1\. Overview & Commitment/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Information We Collect/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Third-Party Services/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Data Retention and Your Rights/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Contact Us/i)).toBeInTheDocument();
    expect(screen.getAllByText(/privacy@slnews\.sl/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders navigation links to Home and Terms", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("link", { name: /Back to Home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Terms of Service/i })).toHaveAttribute("href", "/terms");
  });
});
