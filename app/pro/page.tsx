import ProPlans from "@/components/ProPlans";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { Subscription } from "@prisma/client";

export default async function ProPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
        🚫 Invalid session
      </div>
    );
  }

  const userSubscription: Subscription | null =
    await prisma.subscription.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

  return <ProPlans userSubscription={userSubscription} />;
}
