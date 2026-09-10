import type { NextAuthConfig } from "next-auth";

// Middleware/Proxy-safe Auth.js config — deliberately has NO providers and
// NO imports that pull in Prisma's native query engine binary. Netlify's
// Next.js Middleware runtime cannot load native C++ addons, so anything
// used by src/proxy.ts must trace back to this file only, never to
// src/auth.ts (which adds the Credentials provider's Prisma-backed
// authorize() below). Session/role reading here is pure JWT
// decode/verification — no database access.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.uid = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};
