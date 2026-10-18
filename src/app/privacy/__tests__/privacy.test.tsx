import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PrivacyPolicyPage, { metadata } from "../page";

describe("PrivacyPolicyPage Component", () => {
  it("exports valid metadata with privacy title", () => {
    expect(metadata.title).toBe("Privacy Policy | SLNews");
    expect(metadata.description).toContain("Privacy policy");
  });

  it("describes the mobile apps first and scopes web tracking to the website", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByRole("heading", { name: "Privacy Policy", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/1\. Overview & commitment/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. What the SLNews apps collect/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3\. What the website collects \(web only\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/4\. Third-party services/i)).toBeInTheDocument();
    expect(
      screen.getByText(/5\. Advertising and sponsored content/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6\. Retention, deletion and your rights/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/10\. Contact us/i)).toBeInTheDocument();
  });

  it("states that the apps carry no analytics or advertising SDKs", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByText(/no analytics SDK and no\s+advertising SDK/i)
    ).toBeInTheDocument();
    // Both services appear twice: once in the web section, once in the provider list.
    expect(
      screen.getAllByText(/Meta \(Facebook\) Pixel/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Google AdSense/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("discloses Sentry crash diagnostics without account identifiers", () => {
    render(<PrivacyPolicyPage />);

    // The label and its paragraph both mention crash diagnostics.
    expect(
      screen.getAllByText(/Crash diagnostics/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sentry/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/configured without IP\s+storage/i)
    ).toBeInTheDocument();
  });

  it("links deletion and contact paths", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getAllByText(/privacy@slnews\.sl/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", {
        name: /account deletion page|Delete your account/i,
      }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders navigation links to Home, deletion and Terms", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole("link", { name: /Back to Home/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      screen.getByRole("link", { name: /Terms of Service/i })
    ).toHaveAttribute("href", "/terms");
    expect(
      screen.getAllByRole("link", { name: /Delete your account/i })[0]
    ).toHaveAttribute("href", "/delete-account");
  });
});
