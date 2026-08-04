import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authCallbacks } from "@/lib/auth-callbacks"
import { db as prisma } from "@/lib/db"
import { checkDbRateLimit, getClientIp, loginRateKey, resetRateLimit } from "@/lib/rate-limiter"

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
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const ip = request ? getClientIp(request) : "unknown";
        const rateKey = loginRateKey(email, ip);

        const rate = await checkDbRateLimit(rateKey, {
          maxRequests: 5,
          windowMs: 15 * 60 * 1000,
        });
        if (!rate.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email }
        });
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (isValid) {
          await resetRateLimit(rateKey);
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }
        return null;
      }
    })
  ],
  ...authCallbacks,
})
