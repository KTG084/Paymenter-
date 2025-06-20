"use client";

declare global {
  interface Window {
    Razorpay: new (options: RazorpaySubscriptionOptions) => any;
  }
}
import { PRO_PLANS } from "@/constants";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Script from "next/script";
import { Check, Loader, Loader2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import { Subscription } from "@prisma/client";
import { Button } from "./ui/button";
import { showToast } from "@/lib/toaster";
import { TextShimmer } from "./ui/text-shimmer";
type Props = {
  userSubscription: Subscription | null;
};

// Prefill customer details
interface RazorpayPrefill {
  name: string;
  email: string;
}

// Optional metadata
interface RazorpayNotes {
  userId: string;
  Plan?: string; // Optional in case it's a plan, not a course
}

// Razorpay's response after successful subscription checkout
interface RazorpaySubscriptionResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

// Razorpay options used for subscriptions (not orders!)
interface RazorpaySubscriptionOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpaySubscriptionResponse) => void;
  prefill?: RazorpayPrefill;
  notes?: RazorpayNotes;
  theme?: {
    color: string;
  };
}

const ProPlans = ({ userSubscription }: Props) => {
  const [loading, setloading] = useState("");
  const [loader, setloader] = useState(false);
  const { data: session, status } = useSession();
  const isYearlySubsActive =
    userSubscription?.status === "active" &&
    userSubscription.planType === "year";

  const handlePlanSelection = async (planId: "month" | "year") => {
    setloading(planId);
    try {
      const res = await fetch("/api/pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json().catch(() => null);

      if (!data?.subscriptionId) {
        showToast.error("Something went wrong. Try again.");
        return;
      }
      console.log("Razorpay Subscription ID:", data.subscriptionId);
      const selectedPlan = PRO_PLANS.find((plan) => plan.id === planId);
      if (!selectedPlan) {
        showToast.warning("Invalid plan selected.");
        setloading("");
        return;
      }

      const options: RazorpaySubscriptionOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
        subscription_id: data.subscriptionId,
        name: "Subscription",
        description: `${selectedPlan?.title} - ${selectedPlan?.price} / ${selectedPlan?.period}`,
        prefill: {
          name: session?.user.name || "John Doe",
          email: session?.user.email || "johndoe@example.com",
        },
        notes: {
          userId: session?.user.id ?? "unknown",
          Plan: selectedPlan?.id,
        },
        theme: {
          color: "#a21caf",
        },
        handler: async (response) => {
          showToast.success("Payment Successfull");
          console.log(response);
          setloader(true);
          try {
            const verifyRes = await fetch("/api/pro/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => null);
              const message =
                errData?.error || "Verification failed due to server error.";
              showToast.error(message);
              return;
            }

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              showToast.success("Payment verified! Subscription granted.");
            } else {
              showToast.error(
                verifyData.error || "Payment verification failed."
              );
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            showToast.error(
              "An unexpected error occurred during verification."
            );
          } finally {
            setloader(false);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast.error("Subscription Payment failed. Please try again.");
      throw new Error(`Payment failed: ${(error as Error).message}`);
    } finally {
      setloading("");
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {loader && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <span className="flex items-center gap-2">
              <Loader className="animate-spin w-4 h-4 text-white" />
              <TextShimmer
                className="text-white text-lg font-medium"
                duration={1}
              >
                Verifying your payment...
              </TextShimmer>
            </span>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-6 tracking-wider text-white drop-shadow-lg">
          Choose Your Pro Journey
        </h1>
        <h3 className="text-xl font-medium text-center mb-12 tracking-wider text-white drop-shadow-lg">
          Unlock premium features and accelerate your learning
        </h3>

        {status === "authenticated" &&
          userSubscription?.status === "active" && (
            <div className="bg-purple-950/80 border-l-4 border-fuchsia-500 p-4 mb-8 rounded-md shadow-md backdrop-blur-md">
              <p className="text-fuchsia-200">
                You have an active{" "}
                <span className="font-semibold text-fuchsia-300">
                  {userSubscription.planType}
                </span>{" "}
                subscription.
              </p>
            </div>
          )}

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
          {PRO_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer group
            bg-purple-950/80 border rounded-2xl overflow-hidden 
            backdrop-blur-md shadow-xl transition duration-300 
            ${
              plan.highlighted
                ? "border-fuchsia-400 shadow-fuchsia-500/30 hover:shadow-fuchsia-400/50"
                : "border-fuchsia-800 hover:border-fuchsia-300 hover:shadow-fuchsia-300/30"
            }`}
            >
              <CardHeader>
                <CardTitle
                  className={`text-2xl font-semibold ${
                    plan.highlighted ? "text-fuchsia-400" : "text-white"
                  }`}
                >
                  {plan.title}
                </CardTitle>
                <CardDescription className="mt-2 text-fuchsia-200">
                  <span className="text-lg font-medium">{plan.price}</span>{" "}
                  <span className="text-sm">/ {plan.period}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mt-4">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start text-white">
                      <Check
                        className={`h-5 w-5 mt-1 ${
                          plan.highlighted
                            ? "text-fuchsia-400"
                            : "text-green-400"
                        } mr-2 flex-shrink-0`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button
                  className={`w-full py-5 text-base font-medium rounded-xl ${
                    plan.highlighted
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-white text-purple-700 border-2 border-purple-600 hover:bg-purple-100"
                  } transition duration-300`}
                  onClick={() => {
                    if (plan.id === "month" || plan.id === "year") {
                      handlePlanSelection(plan.id);
                    } else {
                      showToast.warning("Invalid plan id");
                    }
                  }}
                  disabled={
                    loading === plan.id ||
                    (userSubscription?.status === "active" &&
                      (userSubscription.planType === plan.id ||
                        isYearlySubsActive))
                  }
                >
                  {loading === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader className="animate-spin w-4 h-4 text-white" />
                      <TextShimmer className="font-mono text-sm" duration={1}>
                        Processing...
                      </TextShimmer>
                    </span>
                  ) : status === "authenticated" &&
                    userSubscription?.status === "active" &&
                    userSubscription.planType === plan.id ? (
                    "Current Plan"
                  ) : status === "authenticated" &&
                    plan.id === "month" &&
                    isYearlySubsActive ? (
                    "Yearly Plan Active"
                  ) : (
                    plan.ctaText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProPlans;
