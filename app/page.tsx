import Courses from "@/components/Courses";
import React from "react";
import { prisma } from "@/db/prisma";

const Page = async () => {
  
  const courses = await prisma.course.findMany();
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950">
      <div className="w-full ">
        <Courses courses={courses.slice(0, 3)} />
      </div>
    </main>
  );
};

export default Page;
