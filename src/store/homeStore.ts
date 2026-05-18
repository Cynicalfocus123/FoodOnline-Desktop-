import { create } from "zustand";

export type SignupRole = "Customer" | "Partners" | "Suppliers";
export type SignupView = "home" | "signup";
export type SignupStep = "role" | "form" | "complete";

export type SignupFormValues = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  lineId: string;
  companyName: string;
};

export type SignupSubmission = SignupFormValues & {
  selectedRole: SignupRole;
  createdTimestamp: string;
};

type HomeState = {
  signupView: SignupView;
  signupStep: SignupStep;
  selectedRole: SignupRole | null;
  formValues: SignupFormValues;
  completedSubmission: SignupSubmission | null;
  openSignup: () => void;
  backToHome: () => void;
  selectRole: (role: SignupRole) => void;
  continueToForm: () => void;
  setFormValue: <K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) => void;
  finishSignup: () => void;
};

const initialFormValues: SignupFormValues = {
  emailAddress: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  lineId: "",
  companyName: "",
};

function buildSubmissionPayload(
  selectedRole: SignupRole,
  formValues: SignupFormValues,
): SignupSubmission {
  return {
    selectedRole,
    ...formValues,
    createdTimestamp: new Date().toISOString(),
  };
}

function submitSignupToBackend(payload: SignupSubmission) {
  // Placeholder for future admin/backend integration.
  return payload;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  signupView: "home",
  signupStep: "role",
  selectedRole: null,
  formValues: initialFormValues,
  completedSubmission: null,
  openSignup: () =>
    set({
      signupView: "signup",
      signupStep: "role",
      selectedRole: null,
      formValues: initialFormValues,
      completedSubmission: null,
    }),
  backToHome: () =>
    set({
      signupView: "home",
      signupStep: "role",
      selectedRole: null,
      formValues: initialFormValues,
      completedSubmission: null,
    }),
  selectRole: (role) => set({ selectedRole: role }),
  continueToForm: () => {
    if (!get().selectedRole) {
      return;
    }

    set({ signupStep: "form" });
  },
  setFormValue: (field, value) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        [field]: value,
      },
    })),
  finishSignup: () => {
    const { selectedRole, formValues } = get();
    if (!selectedRole) {
      return;
    }

    const payload = buildSubmissionPayload(selectedRole, formValues);
    submitSignupToBackend(payload);

    set({
      signupStep: "complete",
      completedSubmission: payload,
    });
  },
}));
