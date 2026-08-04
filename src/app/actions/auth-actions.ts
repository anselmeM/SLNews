"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getRateLimitStatus, loginRateKey } from "@/lib/rate-limiter";

export async function getLoginRateLimitStatus(email: string): Promise<{
  blocked: boolean;
  retryAfter: number;
}> {
  if (!email) return { blocked: false, retryAfter: 0 };
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "127.0.0.1";
  return getRateLimitStatus(loginRateKey(email, ip));
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return { success: false, error: "All fields are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: { name, email, password: hashedPassword, role: "USER" },
  });

  return { success: true };
}
