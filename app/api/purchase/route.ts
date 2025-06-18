import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { Course } from "@prisma/client";
import { prisma } from "@/db/prisma";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { courseId } = await req.json();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const courseData: Course | null = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    const options = {
      amount: (courseData?.price as Course["price"]) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      customer_id: session?.user.razorpayCustomerId,
      notes: {
        userId: session.user.id,
        courseId: courseId,
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}
