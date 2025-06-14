"use client"

import React from 'react'

import { Course, User } from "@prisma/client";
type Props = {
  userData: User;
  courseData: Course;
};

const CourseIndi = ({userData, courseData}: Props) => {
  return (
    <div className='flex items-center'>
      {userData.name}
      {courseData.imageUrl}
    </div>
  )
}

export default CourseIndi
