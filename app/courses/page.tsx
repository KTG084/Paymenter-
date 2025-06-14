import { prisma } from "@/db/prisma";
import Courses from "@/components/Courses";

export default async function CoursesPage() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        purchases: true,
      },
    });

    return <Courses courses={courses} />;
  } catch (error) {
    console.error("Error fetching courses", error);

    return (
      <div className="text-red-500 text-center mt-20">
        Failed to load courses.
      </div>
    );
  }
}
