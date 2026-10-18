import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TermsOfServicePage, { metadata } from "../page";

describe("TermsOfServicePage Component", () => {
  it("exports valid metadata with terms title", () => {
    expect(metadata.title).toBe("Terms of Service | SLNews");
    expect(metadata.description).toContain("Terms of service");
  });

  it("renders the app-first sections and the market disclaimer", () => {
    render(<TermsOfServicePage />);

    expect(
      screen.getByRole("heading", { name: "Terms of Service", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/1\. Acceptance of terms/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. What SLNews is — and is not/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3\. Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Acceptable use/i)).toBeInTheDocument();
    expect(
      screen.getByText(/5\. Content attribution and intellectual property/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6\. Financial and market information/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/7\. Community features on the website/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/12\. Governing law/i)).toBeInTheDocument();
  });

  it("carries the not-investment-advice disclaimer and contact address", () => {
    render(<TermsOfServicePage />);

    expect(
      screen.getByText(
        /SLNews does not provide financial, investment, legal or tax advice/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/contact@slnews\.sl/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("links deletion, privacy and home", () => {
    render(<TermsOfServicePage />);

    expect(
      screen.getByRole("link", { name: /Privacy Policy/i })
    ).toHaveAttribute("href", "/privacy");
    expect(
      screen.getAllByRole("link", {
        name: /account deletion page|Delete your account/i,
      }).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /Home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
