"use client";

import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Course } from "@prisma/client";

type Props = {
  courses: Course[];
};

import { useRouter } from "next/navigation";
import Link from "next/link";
const Courses = ({ courses }: Props) => {
  const router = useRouter();

  function handleEnroll() {
    router.push("/billing");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-25 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 tracking-wider text-white drop-shadow-lg">
        Explore Our Courses
      </h1>
      <h3 className="text-xl font-medium text-center mb-14 tracking-wider text-white drop-shadow-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni mollitia
        ratione ipsa et sit cumque illo dolores officiis, placeat un
      </h3>

      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              className="cursor-pointer group bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-fuchsia-500/40 transition-shadow duration-300 backdrop-blur-md"
            >
              <Link href={`/courses/${course.id}`} className="cursor-pointer">
                <div className="relative w-full h-40">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{
                      borderTopLeftRadius: "1rem",
                      borderTopRightRadius: "1rem",
                    }}
                  />
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="text-xl font-semibold text-white group-hover:text-fuchsia-400 transition-colors">
                    {course.title}
                  </h2>

                  <p className="text-gray-300 text-xs leading-tight line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-fuchsia-400 font-bold text-base">
                      ₹{course.price.toFixed(2)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEnroll();
                      }}
                      className="cursor-pointer px-4 py-1.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-md hover:bg-white/20 hover:shadow-fuchsia-500/30 transition-all duration-300"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button className="px-6 py-2.5 text-sm sm:text-base font-medium text-white bg-gray-900/80 hover:bg-gray-900 rounded-xl shadow-lg transition-all flex items-center gap-2">
            Explore Premium Plans <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </>
    </div>
  );
};

export default Courses;
