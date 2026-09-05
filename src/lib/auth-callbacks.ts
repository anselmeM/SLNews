/**
 * Strict Owner / Admin Whitelist
 * ONLY these email addresses and the process.env.ADMIN_EMAIL can ever hold the ADMIN role.
 * Any other user attempting to hold ADMIN privileges will be restricted.
 */
export const ADMIN_EMAILS = [
  "anselme.motcho@gmail.com",
  "anselmemotcho@gmail.com",
];

export function isOwnerOrAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  
  if (ADMIN_EMAILS.includes(cleanEmail)) return true;
  
  // Handle Gmail dot-insensitivity on local-part
  const [localPart, domain] = cleanEmail.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const cleanLocal = localPart ? localPart.replace(/\./g, "") : "";
    const dotLess = `${cleanLocal}@gmail.com`;
    const normalizedAdmins = ADMIN_EMAILS.map((e) => {
      const [lp] = e.toLowerCase().split("@");
      const cleanLp = lp ? lp.replace(/\./g, "") : "";
      return `${cleanLp}@gmail.com`;
    });
    if (normalizedAdmins.includes(dotLess)) {
      return true;
    }
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === cleanEmail) {
    return true;
  }
  return false;
}
