"use client";

import React, { useState } from "react";
import { Course } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Loader,
  Download,
  FileText,
  FileTextIcon,
  PlayCircle,
} from "lucide-react";
import { useEnroll } from "@/hooks/useEnroll";


type Props = {
  userAccess: boolean;
  courseData: Course;
};

const CourseIndi = ({ userAccess, courseData }: Props) => {
  const { enroll } = useEnroll();
  const [loading, setloading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 py-20 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full group">
        <Card className="cursor-pointer bg-gray-900/80 border border-gray-800 rounded-3xl backdrop-blur-md text-white overflow-hidden transition-all duration-500 ease-in-out hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] hover:border-fuchsia-500">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-4xl font-extrabold tracking-wide text-white group-hover:text-fuchsia-400 transition duration-300 ease-in-out">
              {courseData.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-4 px-6">
            <Image
              src={courseData.imageUrl}
              alt={courseData.title}
              width={600}
              height={300}
              className="rounded-xl mx-auto object-cover max-h-64 transition-transform duration-500 ease-in-out group-hover:scale-101 group-hover:shadow-[0_0_30px_rgba(255,0,255,0.1)]"
            />

            <CardDescription className="text-gray-300 text-[17px] leading-relaxed">
              {courseData.description}
            </CardDescription>
          </CardContent>

          {userAccess ? (
            <>
              <CardContent className="pt-0 px-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button className="w-full sm:w-auto gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors">
                    <PlayCircle className="w-5 h-5" />
                    Start Course
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-fuchsia-600 text-fuchsia-300 hover:bg-fuchsia-800/30 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Materials
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-fuchsia-300 mb-4 text-center sm:text-left">
                    📚 Course Modules
                  </h3>
                  <ul className="space-y-3 text-gray-200 text-[16px] font-medium">
                    <li className="flex items-center gap-2">
                      <FileTextIcon className="text-fuchsia-400 w-5 h-5" />
                      Introduction to Advanced Patterns
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="text-fuchsia-400 w-5 h-5" />
                      Hooks and Custom Hooks
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="text-fuchsia-400 w-5 h-5" />
                      3rd Level of One-Liners: 20 Gold Coins
                    </li>
                  </ul>
                </div>
              </CardContent>
            </>
          ) : (
            <CardFooter className="flex flex-col items-center gap-3 pt-4 pb-6">
              <p className="text-fuchsia-400 font-semibold text-2xl text-center">
                ₹{courseData.price.toFixed(2)}/- Only
              </p>

              <button
                onClick={() => {
                  try {
                    setloading(true);
                    enroll(courseData.id);
                  } finally {
                    setloading(false);
                  }
                }}
                disabled={loading}
                className="cursor-pointer px-7 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 
        hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 
        transition-transform duration-300 rounded-full text-white font-semibold text-lg tracking-wide"
              >
                {loading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  "Enroll Now"
                )}
              </button>

              <p className="text-sm text-gray-400 italic">
                Start learning today!
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CourseIndi;
