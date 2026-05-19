export const signupRoles = [
  {
    key: "customer",
    signupLabel: "Customer",
    adminLabel: "Customers",
    description: "Retail buyers and household shoppers",
  },
  {
    key: "supplier",
    signupLabel: "Supplier",
    adminLabel: "Suppliers",
    description: "Wholesale food suppliers and inventory sources",
  },
  {
    key: "partner",
    signupLabel: "Partner",
    adminLabel: "Partners",
    description: "Logistics, payments, and ecosystem partners",
  },
] as const;

export type SignupRoleKey = (typeof signupRoles)[number]["key"];

export type SignupFormValues = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  lineId: string;
  companyName: string;
  password: string;
  confirmPassword: string;
};

export type SignupSubmission = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  lineId: string;
  companyName: string;
  selectedRole: SignupRoleKey;
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
  password: 72,
  confirmPassword: 72,
};

export const initialSignupFormValues: SignupFormValues = {
  emailAddress: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  lineId: "",
  companyName: "",
  password: "",
  confirmPassword: "",
};

export function getSignupRoleMeta(roleKey: SignupRoleKey) {
  return signupRoles.find((role) => role.key === roleKey) ?? signupRoles[0];
}

export function isSignupRoleKey(role: string): role is SignupRoleKey {
  return signupRoles.some((option) => option.key === role);
}
