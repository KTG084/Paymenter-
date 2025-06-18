import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
      userId,
      amount,
    } = await req.json();

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !courseId ||
      !userId ||
      !amount
    ) {
      return NextResponse.json(
        { error: "Missing fields in request" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_SECRET_API_KEY!;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    //saving the purchase;
    await prisma.purchase.create({
      data: {
        userId,
        courseId,
        amount,
        razorpayPurchaseId: razorpay_payment_id,
        purchaseDate: Math.floor(Date.now() / 1000),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in verify API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
