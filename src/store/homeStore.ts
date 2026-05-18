import { create } from "zustand";

type SignupStatus = "idle" | "saved";

type HomeState = {
  email: string;
  signupStatus: SignupStatus;
  setEmail: (email: string) => void;
  submitSignup: () => void;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  email: "",
  signupStatus: "idle",
  setEmail: (email) => set({ email, signupStatus: "idle" }),
  submitSignup: () => {
    const email = get().email.trim();
    if (!email) {
      return;
    }

    set({ email, signupStatus: "saved" });
  },
}));
