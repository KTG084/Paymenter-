import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";

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

    await prisma.user.create({
      data: {
        email,
        password: hashedPass,
        name: username,
      },
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
