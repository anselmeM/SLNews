import { describe, it, expect } from "vitest";
import {
  normalizePhoneNumber,
  getWhatsAppUrl,
  getTelUrl,
  extractContactPhone,
} from "@/lib/contact-utils";

describe("contact-utils", () => {
  describe("normalizePhoneNumber", () => {
    it("handles null or empty inputs", () => {
      expect(normalizePhoneNumber(null)).toBeNull();
      expect(normalizePhoneNumber("")).toBeNull();
      expect(normalizePhoneNumber("   ")).toBeNull();
    });

    it("normalizes Sierra Leone numbers starting with 0", () => {
      expect(normalizePhoneNumber("076 123 456")).toBe("+23276123456");
      expect(normalizePhoneNumber("078-987-654")).toBe("+23278987654");
    });

    it("preserves international numbers with + prefix", () => {
      expect(normalizePhoneNumber("+232 76 123456")).toBe("+23276123456");
      expect(normalizePhoneNumber("+1 (555) 123-4567")).toBe("+15551234567");
    });

    it("handles 00 international prefixes", () => {
      expect(normalizePhoneNumber("0023276123456")).toBe("+23276123456");
    });
  });

  describe("getWhatsAppUrl", () => {
    it("generates wa.me link without special characters", () => {
      expect(getWhatsAppUrl("076 123 456")).toBe("https://wa.me/23276123456");
    });

    it("includes pre-filled message when provided", () => {
      expect(getWhatsAppUrl("076123456", "Hello regarding your notice on SLNews")).toBe(
        "https://wa.me/23276123456?text=Hello%20regarding%20your%20notice%20on%20SLNews"
      );
    });

    it("returns null for invalid numbers", () => {
      expect(getWhatsAppUrl(null)).toBeNull();
      expect(getWhatsAppUrl("")).toBeNull();
    });
  });

  describe("getTelUrl", () => {
    it("generates tel: URL", () => {
      expect(getTelUrl("076 123 456")).toBe("tel:+23276123456");
    });

    it("returns null for invalid inputs", () => {
      expect(getTelUrl(null)).toBeNull();
    });
  });

  describe("extractContactPhone", () => {
    it("extracts phone number from notice body with Contact prefix", () => {
      const body = "Hiring experienced driver in Freetown.\n\nContact / WhatsApp: 076 123 456";
      expect(extractContactPhone(body)).toBe("+23276123456");
    });

    it("extracts direct Sierra Leone phone numbers from text", () => {
      const body = "House for rent at Hill Station. Call +232 78 987654 for inspection.";
      expect(extractContactPhone(body)).toBe("+23278987654");
    });

    it("returns null if no phone number exists", () => {
      expect(extractContactPhone("General public advisory about weather.")).toBeNull();
    });
  });
});
