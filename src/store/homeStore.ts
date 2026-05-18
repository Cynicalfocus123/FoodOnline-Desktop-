import { create } from "zustand";

export const signupRoleOptions = ["Customer", "Partners", "Suppliers"] as const;

export type SignupRole = (typeof signupRoleOptions)[number];
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

export type SignupFieldErrors = Partial<Record<keyof SignupFormValues | "selectedRole", string>>;

export const signupFieldLimits: Record<keyof SignupFormValues, number> = {
  emailAddress: 254,
  firstName: 60,
  lastName: 60,
  contactNumber: 20,
  lineId: 40,
  companyName: 120,
};

type HomeState = {
  signupView: SignupView;
  signupStep: SignupStep;
  selectedRole: SignupRole | null;
  formValues: SignupFormValues;
  fieldErrors: SignupFieldErrors;
  completedSubmission: SignupSubmission | null;
  openSignup: () => void;
  backToHome: () => void;
  selectRole: (role: string) => void;
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

const invisibleCharacterPattern = /[\u0000-\u001F\u007F]/g;
const htmlTagPattern = /<[^>]*>/g;
const dangerousSequencePattern =
  /(javascript:|vbscript:|data:text\/html|on[a-z]+\s*=|<script|<\/script|{{|}}|\$\{|<%|%>)/gi;
const repeatedWhitespacePattern = /\s+/g;
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const personNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;
const companyNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} '&.,()/\-]*$/u;
const lineIdPattern = /^[A-Za-z0-9][A-Za-z0-9._@-]{2,39}$/;
const contactNumberPattern = /^\+?[0-9()\- ]+$/;

function normalizeInput(value: string) {
  return value.normalize("NFKC").replace(invisibleCharacterPattern, "");
}

function sanitizeFreeText(value: string) {
  return normalizeInput(value)
    .replace(htmlTagPattern, " ")
    .replace(dangerousSequencePattern, " ")
    .replace(/[<>`]/g, "")
    .replace(repeatedWhitespacePattern, " ")
    .trim();
}

function sanitizeFieldValue<K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) {
  switch (field) {
    case "emailAddress":
      return sanitizeFreeText(value).replace(/\s+/g, "").toLowerCase().slice(0, signupFieldLimits[field]);
    case "contactNumber":
      return normalizeInput(value)
        .replace(htmlTagPattern, "")
        .replace(dangerousSequencePattern, "")
        .replace(/[^0-9+\-()\s]/g, "")
        .replace(repeatedWhitespacePattern, " ")
        .trim()
        .slice(0, signupFieldLimits[field]);
    case "lineId":
      return normalizeInput(value)
        .replace(htmlTagPattern, "")
        .replace(dangerousSequencePattern, "")
        .replace(/[^A-Za-z0-9._@-]/g, "")
        .slice(0, signupFieldLimits[field]);
    default:
      return sanitizeFreeText(value).slice(0, signupFieldLimits[field]);
  }
}

function isSignupRole(role: string): role is SignupRole {
  return signupRoleOptions.includes(role as SignupRole);
}

function validateField<K extends keyof SignupFormValues>(
  field: K,
  value: SignupFormValues[K],
  requireValue: boolean,
) {
  if (!value) {
    return requireValue ? "This field is required." : undefined;
  }

  if (value.length > signupFieldLimits[field]) {
    return `Use ${signupFieldLimits[field]} characters or fewer.`;
  }

  switch (field) {
    case "emailAddress":
      return emailPattern.test(value) ? undefined : "Enter a valid email address.";
    case "firstName":
    case "lastName":
      return personNamePattern.test(value)
        ? undefined
        : "Use letters, numbers, spaces, apostrophes, periods, or hyphens only.";
    case "contactNumber": {
      const digitCount = value.replace(/\D/g, "").length;
      if (!contactNumberPattern.test(value) || digitCount < 7 || digitCount > 15) {
        return "Enter a valid contact number with 7 to 15 digits.";
      }

      return undefined;
    }
    case "lineId":
      return lineIdPattern.test(value)
        ? undefined
        : "Use 3 to 40 letters, numbers, dots, underscores, hyphens, or @ only.";
    case "companyName":
      return companyNamePattern.test(value)
        ? undefined
        : "Use letters, numbers, spaces, and basic business punctuation only.";
    default:
      return undefined;
  }
}

function validateRole(selectedRole: SignupRole | null) {
  if (!selectedRole || !isSignupRole(selectedRole)) {
    return "Select Customer, Partners, or Suppliers.";
  }

  return undefined;
}

function sanitizeAndValidateFormValues(formValues: SignupFormValues, requireAllFields: boolean) {
  const cleanedValues: SignupFormValues = {
    emailAddress: sanitizeFieldValue("emailAddress", formValues.emailAddress),
    firstName: sanitizeFieldValue("firstName", formValues.firstName),
    lastName: sanitizeFieldValue("lastName", formValues.lastName),
    contactNumber: sanitizeFieldValue("contactNumber", formValues.contactNumber),
    lineId: sanitizeFieldValue("lineId", formValues.lineId),
    companyName: sanitizeFieldValue("companyName", formValues.companyName),
  };

  const fieldErrors: SignupFieldErrors = {};

  (Object.keys(cleanedValues) as Array<keyof SignupFormValues>).forEach((field) => {
    const requireValue = requireAllFields ? field !== "lineId" : false;
    const error = validateField(field, cleanedValues[field], requireValue);
    if (error) {
      fieldErrors[field] = error;
    }
  });

  return { cleanedValues, fieldErrors };
}

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
  fieldErrors: {},
  completedSubmission: null,
  openSignup: () =>
    set({
      signupView: "signup",
      signupStep: "role",
      selectedRole: null,
      formValues: initialFormValues,
      fieldErrors: {},
      completedSubmission: null,
    }),
  backToHome: () =>
    set({
      signupView: "home",
      signupStep: "role",
      selectedRole: null,
      formValues: initialFormValues,
      fieldErrors: {},
      completedSubmission: null,
    }),
  selectRole: (role) =>
    set((state) => ({
      selectedRole: isSignupRole(role) ? role : state.selectedRole,
      fieldErrors: {
        ...state.fieldErrors,
        selectedRole: isSignupRole(role) ? undefined : "Select Customer, Partners, or Suppliers.",
      },
    })),
  continueToForm: () => {
    const roleError = validateRole(get().selectedRole);
    if (roleError) {
      set((state) => ({
        fieldErrors: {
          ...state.fieldErrors,
          selectedRole: roleError,
        },
      }));

      return;
    }

    set((state) => ({
      signupStep: "form",
      fieldErrors: {
        ...state.fieldErrors,
        selectedRole: undefined,
      },
    }));
  },
  setFormValue: (field, value) =>
    set((state) => {
      const cleanedValue = sanitizeFieldValue(field, value);
      const nextFormValues = {
        ...state.formValues,
        [field]: cleanedValue,
      };
      const nextError = validateField(field, cleanedValue, false);

      return {
        formValues: nextFormValues,
        fieldErrors: {
          ...state.fieldErrors,
          [field]: nextError,
        },
      };
    }),
  finishSignup: () => {
    const { selectedRole, formValues } = get();
    const roleError = validateRole(selectedRole);
    const { cleanedValues, fieldErrors } = sanitizeAndValidateFormValues(formValues, true);

    if (roleError || !selectedRole || Object.values(fieldErrors).some(Boolean)) {
      set((state) => ({
        formValues: cleanedValues,
        fieldErrors: {
          ...state.fieldErrors,
          ...fieldErrors,
          selectedRole: roleError,
        },
      }));

      return;
    }

    const payload = buildSubmissionPayload(selectedRole, cleanedValues);
    submitSignupToBackend(payload);

    set({
      formValues: cleanedValues,
      fieldErrors: {},
      signupStep: "complete",
      completedSubmission: payload,
    });
  },
}));
