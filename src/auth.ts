import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

// Full Auth.js config — used everywhere EXCEPT src/proxy.ts (see
// auth.config.ts for why). Credentials provider requires JWT sessions —
// role and ownership are embedded in the token/session server-side and are
// never trusted from client input (section 35 / 76).
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }],
          },
        });

        if (!user || user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
});
