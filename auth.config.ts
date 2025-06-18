import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { User } from "@prisma/client";
import * as z from "zod";

const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = (await prisma.user.findUnique({
            where: { email: email as string },
          })) as User;
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
    // Credentials({
    //   name: "Credentials",
    //   credentials: {
    //     email: { label: "Email", type: "text" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.email || !credentials.password) return null;

    //     const user = (await prisma.user.findUnique({
    //       where: { email: credentials.email as string },
    //     })) as User;

    //     if (!user || !user.password) return null;

    //     const passwordMatch = await bcrypt.compare(
    //       credentials.password as string,
    //       user.password
    //     );

    //     if (passwordMatch) {
    //       return user;
    //     } else {
    //       return null;
    //     }
    //   },
    // }),
  ],
} satisfies NextAuthConfig;
