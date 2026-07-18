"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkDbRateLimit } from "@/lib/rate-limiter";

export async function requestReset(email: string) {
  const rateLimit = await checkDbRateLimit(`reset-request:${email.toLowerCase()}`, { maxRequests: 3, windowMs: 15 * 60_000 });
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many requests. Try again later." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { success: true };

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  return { success: true, token };
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return { success: false, error: "Invalid or expired reset token." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.$transaction([
    db.user.update({ where: { email: record.email }, data: { password: hashedPassword } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);

  return { success: true };
}
