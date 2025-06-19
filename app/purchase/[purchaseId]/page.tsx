import React from "react";
import Purchaser from "@/components/Purchaser";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { Course } from "@prisma/client";
import Link from "next/link";


export default async function Page({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const session = await auth();
  const { purchaseId } = await params;

  if (!session?.user?.id || !purchaseId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
        🚫 Invalid session or course ID
      </div>
    );
  }

  const courseData: Course | null = await prisma.course.findUnique({
    where: { id: purchaseId },
  });

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
        ⚠️ Course not found
      </div>
    );
  }

  const userCourse = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: purchaseId,
      },
    },
  });

  const userAccess = Boolean(userCourse);

return (
  <div>
    {userAccess ? (
      <div className="text-center min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-20 flex items-center justify-center text-white px-4">
        <div className="inline-block bg-gray-900/70 border border-fuchsia-500 rounded-2xl px-8 py-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,0,255,0.2)]">
          <p className="text-2xl font-bold text-fuchsia-400 mb-3">
            ✅ You already have access to this course!
          </p>
          <Link href={`/courses/${courseData.id}`}>
            <span className="inline-block mt-2 text-lg font-medium text-blue-400 underline hover:text-blue-300 transition-colors">
              Get to the Course Page
            </span>
          </Link>
        </div>
      </div>
    ) : (
      <Purchaser courseData={courseData} />
    )}
  </div>
);

}
