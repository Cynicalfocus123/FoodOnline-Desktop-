import { create } from "zustand";

type SignupStatus = "idle" | "saved";

type HomeState = {
  activeSlide: number;
  email: string;
  signupStatus: SignupStatus;
  setActiveSlide: (slide: number) => void;
  setEmail: (email: string) => void;
  submitSignup: () => void;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  activeSlide: 0,
  email: "",
  signupStatus: "idle",
  setActiveSlide: (slide) => set({ activeSlide: slide }),
  setEmail: (email) => set({ email, signupStatus: "idle" }),
  submitSignup: () => {
    const email = get().email.trim();
    if (!email) {
      return;
    }

    set({ email, signupStatus: "saved" });
  },
}));
