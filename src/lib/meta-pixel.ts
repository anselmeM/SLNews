/**
 * Meta (Facebook) Pixel utility for tracking ad attribution, conversions,
 * and high-intent actions (reading, PWA installs, WhatsApp shares).
 */

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "Share";

export function getMetaPixelId(): string | undefined {
  return process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
}

/**
 * Fires a standard Meta event if the Pixel is loaded on the client.
 */
export function trackMetaEvent(
  eventName: MetaStandardEvent,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  } catch {
    // Silently suppress analytics dispatch errors
  }
}

/**
 * Fires a custom Meta event (e.g. AppInstallPrompt, OfflineStoryRead)
 * if the Pixel is loaded on the client.
 */
export function trackCustomMetaEvent(
  customEventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    if (params) {
      window.fbq("trackCustom", customEventName, params);
    } else {
      window.fbq("trackCustom", customEventName);
    }
  } catch {
    // Silently suppress analytics dispatch errors
  }
}
