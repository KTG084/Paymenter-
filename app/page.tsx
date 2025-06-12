import Courses from "@/components/Courses";
import React from "react";

const Page = () => {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950">
      <div className="w-full ">
        <Courses />
      </div>
    </main>
  );
};

export default Page;
