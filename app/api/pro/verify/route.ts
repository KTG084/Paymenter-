import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "@/db/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_API_KEY!,
});
export async function POST(req: NextRequest) {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    userId,
    Plan,
  } = await req.json();

  if (
    !razorpay_payment_id ||
    !razorpay_subscription_id ||
    !razorpay_signature ||
    !userId ||
    !Plan
  ) {
    return NextResponse.json(
      { error: "Missing fields in request" },
      { status: 400 }
    );
  }

  const secret = process.env.RAZORPAY_SECRET_API_KEY!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_subscription_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  try {
    const subscription = await razorpay.subscriptions.fetch(
      razorpay_subscription_id
    );

    if (!Object.values(PlanType).includes(Plan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const status = subscription.status as SubscriptionStatus;
    if (!Object.values(SubscriptionStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid subscription status" },
        { status: 400 }
      );
    }

    await prisma.subscription.upsert({
      where: { razorpaySubscriptionId: razorpay_subscription_id },
      update: {
        status,
        razorpayPlanId: subscription.plan_id,
        currentPeriodStart: new Date(subscription.start_at * 1000),
        currentPeriodEnd: new Date(subscription.end_at * 1000),
        cancelAtPeriodEnd: false,
        planType: Plan,
      },
      create: {
        userId,
        planType: Plan,
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpayPlanId: subscription.plan_id,
        status,
        currentPeriodStart: new Date(subscription.start_at * 1000),
        currentPeriodEnd: new Date(subscription.end_at * 1000),
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
