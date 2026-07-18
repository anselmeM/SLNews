"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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
