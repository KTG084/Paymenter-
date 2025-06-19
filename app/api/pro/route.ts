import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { PRO_PLANS } from "@/constants";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_API_KEY,
});

const PLAN_IDS = {
  month: PRO_PLANS.find((plan) => plan.id === "month")?.razorpayPlanId,
  year: PRO_PLANS.find((plan) => plan.id === "year")?.razorpayPlanId,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = (await req.json()) as { planId: "month" | "year" };
  const totalCount = planId === "month" ? 12 : 1;

  try {
    const plan_id = PLAN_IDS[planId];
    if (!plan_id) {
      return NextResponse.json(
        { ok: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }
    const subscription = await razorpay.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: totalCount,
    });
    return NextResponse.json(
      { subscriptionId: subscription.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Razorpay Subscription:", error);
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error).message || "Failed to create Subscription",
      },
      { status: 500 }
    );
  }
}
