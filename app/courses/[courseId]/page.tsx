import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import CourseIndi from "@/components/CourseIndi";
import { User, Course } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;


  const session = await auth();
  const userData: User | null = await prisma.user.findUnique({
    where: { id: session?.user?.id || undefined },
  });

  const courseData: Course | null = await prisma.course.findUnique({
    where: {
       id: courseId|| undefined,
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
