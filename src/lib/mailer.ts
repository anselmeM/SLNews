// Minimal email delivery for transactional mail (password reset) via Resend.
// Plain `fetch` — no extra dependency. Configure with:
//   RESEND_API_KEY   (https://resend.com)
//   RESEND_FROM_EMAIL  (must be a verified sender, e.g. "SLNews <noreply@yourdomain.com>";
//                       defaults to Resend's test sender "onboarding@resend.dev")

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[mailer] RESEND_API_KEY is not set — password reset email not sent to",
      to
    );
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "SLNews <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your SLNews password",
      text:
        `Reset your SLNews password by opening this link:\n${resetUrl}\n\n` +
        `If you didn't request this, you can safely ignore this email. The link expires in 1 hour.`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Reset your SLNews password</h2>
        <p>We received a request to reset the password for your SLNews account.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#1b1f3b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
            Reset password
          </a>
        </p>
        <p style="color:#666;font-size:13px">Or copy this link: ${resetUrl}</p>
        <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
      </div>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body.slice(0, 200)}`);
  }
}
