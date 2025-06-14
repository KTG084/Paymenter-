import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/db/prisma";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { User } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.Plan = token.Plan as User["Plan"];
        session.user.razorpayCustomerId =
          token.razorpayCustomerId as User["razorpayCustomerId"];
      }
      return session;
    },
    async jwt({ token }: { token: JWT }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: {
          email: true,
          name: true,
          Plan: true,
          razorpayCustomerId: true,
        },
      });

      if (!existingUser) return token;

      return {
        ...token,
        ...existingUser,
      };
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
