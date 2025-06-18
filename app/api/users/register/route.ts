import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Fill up the fields" },
        { status: 400 }
      );
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const customer = await razorpay.customers.create({
      name: username,
      email,
      fail_existing: 0,
    });

    await prisma.user.create({
      data: {
        email,
        password: hashedPass,
        name: username,
        razorpayCustomerId: customer.id,
      },
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register user"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
