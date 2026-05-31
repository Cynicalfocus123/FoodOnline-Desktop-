import {
  SignupFieldErrors,
  SignupFormValues,
  SignupRoleKey,
  initialSignupFormValues,
  isSignupRoleKey,
  signupFieldLimits,
} from "./registerSchema";

const invisibleCharacterPattern = /[\u0000-\u001F\u007F]/g;
const htmlTagPattern = /<[^>]*>/g;
const dangerousSequencePattern =
  /(javascript:|vbscript:|data:text\/html|on[a-z]+\s*=|<script|<\/script|{{|}}|\$\{|<%|%>)/gi;
const dangerousSequenceCheckPattern =
  /(javascript:|vbscript:|data:text\/html|on[a-z]+\s*=|<script|<\/script|{{|}}|\$\{|<%|%>)/i;
const repeatedWhitespacePattern = /\s+/g;
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const personNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;
const companyNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} '&.,()/\-]*$/u;
const lineIdPattern = /^[A-Za-z0-9][A-Za-z0-9._@-]{2,39}$/;
const contactNumberPattern = /^\+?[0-9()\- ]+$/;
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d).{10,72}$/;

export const genericAdminAuthError = "Unable to sign in with those credentials.";
export const genericAdminLockoutError =
  "Too many sign-in attempts. Wait for lockout window before trying again.";
export const genericUserAuthError = "Invalid email or password.";

export function normalizeInput(value: string) {
  return value.normalize("NFKC").replace(invisibleCharacterPattern, "");
}

export function sanitizeFreeText(value: string, shouldNormalizeSpacing = false) {
  const cleanedValue = normalizeInput(value)
    .replace(htmlTagPattern, " ")
    .replace(dangerousSequencePattern, " ")
    .replace(/[<>`]/g, "");

  if (!shouldNormalizeSpacing) {
    return cleanedValue;
  }

  return cleanedValue.replace(repeatedWhitespacePattern, " ").trim();
}

export function sanitizeSignupFieldValue<K extends keyof SignupFormValues>(
  field: K,
  value: SignupFormValues[K],
  shouldNormalizeSpacing = false,
) {
  switch (field) {
    case "emailAddress":
      return sanitizeFreeText(value, true).replace(/\s+/g, "").toLowerCase().slice(0, signupFieldLimits[field]);
    case "contactNumber": {
      const cleanedValue = normalizeInput(value)
        .replace(htmlTagPattern, "")
        .replace(dangerousSequencePattern, "")
        .replace(/[^0-9+\-()\s]/g, "")
        .slice(0, signupFieldLimits[field]);

      return shouldNormalizeSpacing
        ? cleanedValue.replace(repeatedWhitespacePattern, " ").trim()
        : cleanedValue;
    }
    case "lineId":
      return normalizeInput(value)
        .replace(htmlTagPattern, "")
        .replace(dangerousSequencePattern, "")
        .replace(/[^A-Za-z0-9._@-]/g, "")
        .slice(0, signupFieldLimits[field]);
    case "password":
    case "confirmPassword": {
      const cleanedValue = normalizeInput(value)
        .replace(invisibleCharacterPattern, "")
        .slice(0, signupFieldLimits[field]);

      return shouldNormalizeSpacing ? cleanedValue.trim() : cleanedValue;
    }
    default:
      return sanitizeFreeText(value, shouldNormalizeSpacing).slice(0, signupFieldLimits[field]);
  }
}

export function validateSignupField<K extends keyof SignupFormValues>(
  field: K,
  value: SignupFormValues[K],
  requireValue: boolean,
  formValues?: SignupFormValues,
) {
  if (!value) {
    if (!requireValue) {
      return undefined;
    }

    switch (field) {
      case "emailAddress":
        return "Email is required.";
      case "password":
      case "confirmPassword":
        return "Password is required.";
      default:
        return "This field is required.";
    }
  }

  if (value.length > signupFieldLimits[field]) {
    return `Use ${signupFieldLimits[field]} characters or fewer.`;
  }

  switch (field) {
    case "emailAddress":
      return emailPattern.test(value) ? undefined : "Invalid email address.";
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
    case "password":
      return strongPasswordPattern.test(value)
        ? undefined
        : "Use 10 to 72 characters with at least one letter and one number.";
    case "confirmPassword":
      return value === formValues?.password ? undefined : "Passwords do not match.";
    default:
      return undefined;
  }
}

export function validateSignupRole(selectedRole: SignupRoleKey | null) {
  if (!selectedRole || !isSignupRoleKey(selectedRole)) {
    return "Select Customer, Supplier, or Partner.";
  }

  return undefined;
}

export function sanitizeAndValidateSignupFormValues(
  formValues: SignupFormValues,
  requireAllFields: boolean,
) {
  const cleanedValues: SignupFormValues = {
    emailAddress: sanitizeSignupFieldValue("emailAddress", formValues.emailAddress, true),
    firstName: sanitizeSignupFieldValue("firstName", formValues.firstName, true),
    lastName: sanitizeSignupFieldValue("lastName", formValues.lastName, true),
    contactNumber: sanitizeSignupFieldValue("contactNumber", formValues.contactNumber, true),
    lineId: sanitizeSignupFieldValue("lineId", formValues.lineId, true),
    companyName: sanitizeSignupFieldValue("companyName", formValues.companyName, true),
    password: sanitizeSignupFieldValue("password", formValues.password, true),
    confirmPassword: sanitizeSignupFieldValue("confirmPassword", formValues.confirmPassword, true),
  };

  const fieldErrors: SignupFieldErrors = {};

  (Object.keys(cleanedValues) as Array<keyof SignupFormValues>).forEach((field) => {
    const requireValue = requireAllFields ? field !== "lineId" : false;
    const error = validateSignupField(field, cleanedValues[field], requireValue, cleanedValues);
    if (error) {
      fieldErrors[field] = error;
    }
  });

  return { cleanedValues, fieldErrors };
}

export function createSignupSubmission(roleKey: SignupRoleKey, formValues: SignupFormValues) {
  return {
    selectedRole: roleKey,
    emailAddress: formValues.emailAddress,
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    contactNumber: formValues.contactNumber,
    lineId: formValues.lineId,
    companyName: formValues.companyName,
    createdTimestamp: new Date().toISOString(),
  };
}

export function normalizeUserEmail(value: string) {
  return sanitizeFreeText(value, true).replace(/\s+/g, "").toLowerCase().slice(0, 254);
}

export function sanitizeUserPasswordInput(value: string, trimValue = false) {
  const cleanedValue = normalizeInput(value).replace(invisibleCharacterPattern, "").slice(0, 72);
  return trimValue ? cleanedValue.trim() : cleanedValue;
}

export function validateUserEmail(value: string) {
  return emailPattern.test(value);
}

export function validateUserLoginPassword(value: string) {
  return value.trim() !== "" && value.length <= 72;
}

export function normalizeAdminEmail(value: string) {
  return sanitizeFreeText(value, true).replace(/\s+/g, "").toLowerCase().slice(0, 254);
}

export function sanitizeAdminPasswordInput(value: string) {
  return normalizeInput(value).replace(invisibleCharacterPattern, "").slice(0, 128);
}

export function validateAdminEmail(value: string) {
  return emailPattern.test(value);
}

export function validateAdminPassword(value: string) {
  if (!value) {
    return false;
  }

  if (value.trim() !== value) {
    return false;
  }

  if (dangerousSequenceCheckPattern.test(value) || /<[^>]*>/.test(value)) {
    return false;
  }

  return strongPasswordPattern.test(value);
}

export async function hashSecret(secret: string, salt: string) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${salt}:${secret}`));
  return Array.from(new Uint8Array(digest))
    .map((chunk) => chunk.toString(16).padStart(2, "0"))
    .join("");
}

export function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((chunk) => chunk.toString(16).padStart(2, "0"))
    .join("");
}

export function createClientId(prefix: string) {
  if (typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getBlankSignupState() {
  return {
    formValues: initialSignupFormValues,
    fieldErrors: {},
  };
}
