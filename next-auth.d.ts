import { User } from "@prisma/client";
import NextAuth,{type DefaultSession} from "next-auth";

export type ExtendedUsr = DefaultSession["user"] & {
  Plan: User["Plan"];
  razorpayCustomerId: User["razorpayCustomerId"];
};
declare module "next-auth"{
    interface Session {
        user: ExtendedUsr
    }
}