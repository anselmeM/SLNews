/**
 * Utility functions for parsing, normalizing, and generating contact links
 * for Sierra Leone phone and WhatsApp numbers.
 */

export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== "string") return null;

  // Remove spaces, dashes, parentheses, dots
  const cleaned = phone.trim().replace(/[\s\-().]/g, "");

  if (!cleaned) return null;

  // If already starts with +
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If starts with 00 (international format like 00232)
  if (cleaned.startsWith("00")) {
    return "+" + cleaned.slice(2);
  }

  // If starts with Sierra Leone national prefix 0 (e.g. 076123456 -> +23276123456)
  if (cleaned.startsWith("0") && cleaned.length >= 9) {
    return "+232" + cleaned.slice(1);
  }

  // If starts with 232 directly without +
  if (cleaned.startsWith("232") && cleaned.length >= 11) {
    return "+" + cleaned;
  }

  // If 8 digits (local mobile without leading 0)
  if (cleaned.length === 8 && /^\d+$/.test(cleaned)) {
    return "+232" + cleaned;
  }

  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export function getWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return null;

  // wa.me requires digits only, without leading +
  const digits = normalized.replace(/\D/g, "");
  if (!digits) return null;

  const base = `https://wa.me/${digits}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export function getTelUrl(phone: string | null | undefined): string | null {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return null;
  return `tel:${normalized}`;
}

export function extractContactPhone(body: string | null | undefined): string | null {
  if (!body || typeof body !== "string") return null;

  // Match explicit "Contact: ...", "WhatsApp: ...", "Call: ..."
  const contactMatch = body.match(/(?:contact|whatsapp|phone|tel|call|reach us at|inquiries)[\s/:]+([+0-9\s\-()]{8,20})/i);
  if (contactMatch && contactMatch[1]) {
    const norm = normalizePhoneNumber(contactMatch[1]);
    if (norm) return norm;
  }

  // Match direct Sierra Leone phone formats (+232 76 123456 or 076 123456)
  const directMatch = body.match(/(?:\+232[\s\-]?\d{2}[\s\-]?\d{6}|0[3789]\d[\s\-]?\d{6})/);
  if (directMatch && directMatch[0]) {
    return normalizePhoneNumber(directMatch[0]);
  }

  return null;
}
