import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Course } from "@prisma/client";

type Store = {
  courseid: Course["id"] | null;
  setCourseid: (courseid: Course["id"]) => void;
  loading: boolean;
  setLoading: (state: boolean) => void;
  clearCourseid: () => void;
};

export const useCourseStore = create<Store>()(
  persist(
    (set) => ({
      courseid: null,
      loading: false,
      setCourseid: (courseid) => set({ courseid }),
      setLoading: (state) => set({ loading: state }),
      clearCourseid: () => set({ courseid: null }),
    }),
    {
      name: "course-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
// useCourseStore.getState().clearCourse();
