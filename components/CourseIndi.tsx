"use client"

import React from 'react'

import { Course, User } from "@prisma/client";
type Props = {
  userData: User;
  courseData: Course;
};

const CourseIndi = ({userData, courseData}: Props) => {
  return (
    <div className="flex items-center mt-50 gap-4">
  <span className="font-medium text-lg">{userData.name}</span>
  {courseData.title}
</div>

  )
}

export default CourseIndi
