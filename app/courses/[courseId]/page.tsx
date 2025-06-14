import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import CourseIndi from "@/components/CourseIndi";
import { Course } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const session = await auth();

  const courseData: Course | null = await prisma.course.findUnique({
    where: {
      id: courseId || undefined,
    },
  });

  if (!session?.user.id || !courseId) {
    if (!session?.user?.id || !courseId) {
      return (
        <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
          🚫 Invalid session or course ID
        </div>
      );
    }
  }

  const userCourse = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  const userAccess = Boolean(userCourse);

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500 font-semibold">
        ⚠️ Course not found
      </div>
    );
  }

  return <CourseIndi userAccess={userAccess} courseData={courseData} />;
}
