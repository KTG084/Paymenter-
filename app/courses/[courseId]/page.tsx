export const dynamic = "force-dynamic";

import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import CourseIndi from "@/components/CourseIndi";
import { User } from "@prisma/client";
import { Course } from "@prisma/client";

export default async function Page({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await auth();
  const userData: User | null = await prisma.user.findUnique({
    where: { id: session?.user?.id || undefined },
  });
  const courseData: Course | null = await prisma.course.findUnique({
    where: {
      id: params.courseId || undefined,
    },
  });

if (!userData) {
  return (
    <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
      🚫 User not found
    </div>
  );
}

if (!courseData) {
  return (
    <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
      ⚠️ Course not found
    </div>
  );
}


  return <CourseIndi userData={userData} courseData={courseData} />;
}
