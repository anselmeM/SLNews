import type { Role } from "@prisma/client";

export type UserRole = Role;

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

