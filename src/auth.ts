import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authCallbacks } from "@/lib/auth-callbacks"
import { db as prisma } from "@/lib/db"
import { checkDbRateLimit } from "@/lib/rate-limiter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;

        const rateLimit = await checkDbRateLimit(`auth:${email.toLowerCase()}`, { maxRequests: 5, windowMs: 60_000 });
        if (!rateLimit.allowed) {
          throw new Error("Too many login attempts. Try again shortly.");
        }

        const user = await prisma.user.findUnique({
          where: { email }
        });
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (isValid) {
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }
        return null;
      }
    })
  ],
  ...authCallbacks,
})
