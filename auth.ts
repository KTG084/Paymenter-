import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/db/prisma";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { User } from "@prisma/client";
import Razorpay from "razorpay";
import { PrismaAdapter } from "@auth/prisma-adapter";


const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_API_KEY!,
});


export const { auth, handlers, signIn, signOut } = NextAuth({
 events: {
    async signIn({ user }) {
      if (!user.email) return;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (dbUser && !dbUser.razorpayCustomerId) {
        const customer = await razorpay.customers.create({
          name: dbUser.name ?? "GitHub User",
          email: dbUser.email,
          fail_existing: 0,
        });

        await prisma.user.update({
          where: { email: dbUser.email },
          data: {
            razorpayCustomerId: customer.id,
          },
        });
      }
    },
  },

  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.Plan = token.Plan as User["Plan"];
        session.user.razorpayCustomerId =
        token.razorpayCustomerId as User["razorpayCustomerId"];
        session.user.currentSubscriptionId = token.currentSubscriptionId as User['currentSubscriptionId']
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
          currentSubscriptionId: true,
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
