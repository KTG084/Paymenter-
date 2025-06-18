"use client";

import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toaster";
import { Course } from "@prisma/client";

export const useEnroll = () => {
  const router = useRouter();

  const enroll = async (courseid: Course["id"]) => {
    try {
      const purchaseId = courseid;
      await router.push(`/purchase/${purchaseId}`);
    } catch (error) {
      const err =
        (error as Error)?.message || "There was an error while enrolling";
      showToast.error(err);
    }
  };

  return { enroll };
};
