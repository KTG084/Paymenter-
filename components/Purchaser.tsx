"use client";
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => any;
  }
}
import Image from "next/image";
import React, { useState } from "react";
import { Course } from "@prisma/client";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { showToast } from "@/lib/toaster";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface RazorpayPrefill {
  name: string;
  email: string;
}
type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};
interface RazorpayNotes {
  userId: string;
  courseId: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: RazorpayPrefill;
  notes?: RazorpayNotes;
  theme?: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

type Props = {
  courseData: Course;
};
const Purchaser = ({ courseData }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [payloader, setpayloader] = useState(false);
  const [razorpayResponse, setRazorpayResponse] =
    useState<RazorpayResponse | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const handlePayemnt = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseData.id }),
      });

      const data: RazorpayOrderResponse = await res.json().catch(() => null);

      if (!data || typeof data !== "object") {
        showToast.error("Something went wrong. Try again.");
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY!,
        amount: data.amount,
        currency: data.currency,
        name: "Course Purchase",
        description: courseData.title,
        image: courseData.imageUrl,
        order_id: data.id,
        handler: async (response) => {
          showToast.success("Payment successful!");
          setpayloader(true);
          setRazorpayResponse(response);
          try {
            setpayloader(true);
            const verifyRes = await fetch("/api/purchase/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: session?.user.id,
                courseId: courseData.id,
                amount: data.amount,
              }),
            });

            // Handle network or server errors
            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => null);
              const message =
                errData?.error || "Verification failed due to server error.";
              showToast.error(message);
              return;
            }

            // Parse success response
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              showToast.success("Payment verified! Access granted.");
              setPaymentVerified(true);
              setTimeout(() => {
                router.push(`/courses/${courseData.id}`);
              }, 3000);
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
            setLoading(false);
          }
        },

        prefill: {
          name: session?.user.name || "John Doe",
          email: session?.user.email || "johndoe@example.com",
        },
        notes: {
          userId: session?.user.id ?? "unknown",
          courseId: courseData.id,
        },
        theme: {
          color: "#a21caf",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast.error("Payment failed. Please try again.");
      throw new Error(`Payment failed: ${(error as Error).message}`);
    } finally {
      setpayloader(false);
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-20 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full group">
          <div className="bg-gray-900/80 border border-gray-800 rounded-3xl backdrop-blur-md text-white p-8 shadow-md hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] hover:border-fuchsia-500 transition-all duration-500 ease-in-out">
            <h1 className="text-4xl font-extrabold text-center text-white group-hover:text-fuchsia-400 mb-4 transition duration-300 ease-in-out">
              Purchase Course
            </h1>

            <div className="space-y-4 text-center">
              <p className="text-lg text-gray-300">
                You are about to purchase:
                <br />
                <span className="text-xl text-fuchsia-300 font-semibold">
                  {courseData?.title}
                </span>
              </p>

              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <Image
                  src={courseData.imageUrl}
                  alt={courseData.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="text-2xl font-bold text-fuchsia-400">
                ₹{courseData?.price.toFixed(2)}
              </p>
              {payloader || paymentVerified ? (
                <div className="inline-block bg-gray-900/70 border border-fuchsia-500 rounded-2xl px-8 py-4 backdrop-blur-md shadow-[0_0_30px_rgba(255,0,255,0.2)]">
                  <p className="text-2xl font-bold text-fuchsia-400 mb-3">
                    ✅ Payment Successfull
                  </p>

                  {razorpayResponse && (
                    <div>
                      <span className="inline-block mt-1 text-lg font-medium text-green-400 hover:text-green-300 transition-colors">
                        Your Payment ID: {razorpayResponse.razorpay_payment_id}
                      </span>
                    </div>
                  )}

                  {paymentVerified && (
                    <div className="mt-3">
                      <Link
                        href={`/courses/${courseData.id}`}
                        className="cursor-pointer text-lg font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Click here to get to the Course
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handlePayemnt}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 
hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-102 
transition-transform duration-300 rounded-full text-white font-semibold text-lg tracking-wide
flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="animate-spin w-4 h-4 text-white" />
                      <TextShimmer className="font-mono text-sm" duration={1}>
                        Processing...
                      </TextShimmer>
                    </span>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              )}

              <p className="text-sm text-gray-400 italic flex items-center justify-center gap-1">
                Secure payment via
                <Image
                  src="https://rzp-1415-prod-dashboard-activation.s3.ap-south-1.amazonaws.com/org_100000razorpay/main_logo/phplgbGKN"
                  alt="Razorpay Logo"
                  height={16}
                  width={48}
                  className="h-4 w-auto ml-1"
                  unoptimized
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Purchaser;
