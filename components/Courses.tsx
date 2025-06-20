"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Course } from "@prisma/client";

type Props = {
  courses: Course[];
};

import Link from "next/link";
import { useEnroll } from "@/hooks/useEnroll";
import { TextEffect } from "@/components/ui/text-effect";
import { showToast } from "@/lib/toaster";
const Courses = ({ courses }: Props) => {
  const { enroll } = useEnroll();
  const [loading, setloading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-25 px-4">
      <div className="flex justify-center mb-8">
        <TextEffect
          className="text-4xl font-bold text-center tracking-wider text-white drop-shadow-lg"
          preset="fade-in-blur"
          speedReveal={1.1}
          speedSegment={0.5}
        >
          Explore Our Courses
        </TextEffect>
      </div>

      <TextEffect
        className="text-xl font-medium text-center mb-14 tracking-wider text-white drop-shadow-lg"
        preset="fade-in-blur"
        speedReveal={1.1}
        speedSegment={2.5}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni mollitia
        ratione ipsa et sit cumque illo dolores officiis, placeat un
      </TextEffect>

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
                        try {
                          setloading(true);
                          enroll(course.id);
                        } catch (error) {
                          console.error("Enrollment failed:", error);
                          showToast.error("Enrollment failed");
                        } finally {
                          setloading(false);
                        }
                      }}
                      className="px-6 py-2 text-xm font-semibold text-white rounded-full 
  bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 
  border border-fuchsia-500/30 backdrop-blur-md 
  shadow-md hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] 
  hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                      {loading ? (
                        <Loader className="animate-spin w-5 h-5" />
                      ) : (
                        "Enroll"
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </>
    </div>
  );
};

export default Courses;
