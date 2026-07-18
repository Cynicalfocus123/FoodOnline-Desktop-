import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { formatPrice, useCatalogProducts, type ProductItem } from "../services/catalog";
import { apiRequest } from "../lib/apiClient";
import { checkoutApi, type CheckoutQuote, type CommerceOrder, type PaymentMethodAvailability } from "../services/commerceApi";
import { isBackendOrderableProduct } from "../services/catalog/catalogCompatibility";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";
import { toUserFacingErrorMessage } from "../lib/userFacingError";

const FREE_SHIPPING_THRESHOLD = 49;

const paymentIconAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const cardBrandLogos = [
  { label: "Visa", src: paymentIconAsset("assets/payment-icons/visa.png"), widthClass: "w-[46px]" },
  { label: "Mastercard", src: paymentIconAsset("assets/payment-icons/mastercard.png"), widthClass: "w-[30px]" },
  { label: "American Express", src: paymentIconAsset("assets/payment-icons/american-express.png"), widthClass: "w-[58px]" },
  { label: "Discover", src: paymentIconAsset("assets/payment-icons/discover.png"), widthClass: "w-[48px]" },
  { label: "JCB", src: paymentIconAsset("assets/payment-icons/jcb.png"), widthClass: "w-[28px]" },
  { label: "UnionPay", src: paymentIconAsset("assets/payment-icons/unionpay.png"), widthClass: "w-[40px]" },
] as const;

type CheckoutLineItem = {
  product: ProductItem;
  quantity: number;
  lineId: string;
};

type CountryKey =
  | "thailand"
  | "japan"
  | "singapore"
  | "taiwan"
  | "china"
  | "philippines"
  | "malaysia"
  | "indonesia"
  | "hongKong";

type AddressFieldType = "text" | "tel" | "postal" | "textarea";

type AddressField = {
  key: string;
  label: string;
  required?: boolean;
  requiredMessage?: string;
  type?: AddressFieldType;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  fullWidth?: boolean;
};

type AddressConfig = {
  label: string;
  deliveryHint: string;
  fields: AddressField[];
};

type AddressValues = Record<string, string>;
type FieldErrors = Record<string, string>;
type TouchedFields = Record<string, boolean>;

type SavedAddress = {
  id: string;
  country: CountryKey;
  values: AddressValues;
  summary: string;
};

type PaymentMethod = "card" | "cod" | "bankTransfer" | "promptPay" | "paypal" | "googlePay" | "alipay" | "cashApp";

const paymentMethodCodes: Record<PaymentMethod, PaymentMethodAvailability["code"]> = {
  card: "card", cod: "cod", bankTransfer: "bank_transfer", promptPay: "promptpay", paypal: "paypal",
  googlePay: "google_pay", alipay: "alipay", cashApp: "cash_app",
};

type CardFormValues = {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingSameAsShipping: boolean;
};

type CouponState = {
  code: string;
  discount: number;
} | null;

const countryOrder: CountryKey[] = [
  "thailand",
  "japan",
  "singapore",
  "taiwan",
  "china",
  "philippines",
  "malaysia",
  "indonesia",
  "hongKong",
];

const addressConfigs: Record<CountryKey, AddressConfig> = {
  thailand: {
    label: "Thailand",
    deliveryHint: "Province, district, subdistrict, and postal code are used for local delivery routing.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseBuilding", label: "House / Building / Condo No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "unitFloorRoom", label: "Unit / Floor / Room", autoComplete: "shipping address-line2", required: false },
      { key: "villageSoiRoad", label: "Moo / Village / Soi / Road", autoComplete: "shipping address-line3", required: false },
      { key: "province", label: "Province", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "district", label: "District / Amphoe", autoComplete: "shipping address-level2", required: false },
      { key: "subdistrict", label: "Subdistrict / Tambon", autoComplete: "shipping address-level3", required: true, requiredMessage: "Subdistrict is required." },
      { key: "postalCode", label: "Postal code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  japan: {
    label: "Japan",
    deliveryHint: "Postal code comes first, followed by prefecture and city-level address fields.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "prefecture", label: "Prefecture", autoComplete: "shipping address-level1", required: true, requiredMessage: "Prefecture is required." },
      { key: "cityWardTown", label: "City / Ward / Town", autoComplete: "shipping address-level2", required: true, requiredMessage: "City, ward, or town is required." },
      { key: "chomeBlockBuildingNo", label: "Chome / Block / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "buildingName", label: "Building Name", autoComplete: "shipping address-line2", required: false },
      { key: "roomNumber", label: "Room Number", autoComplete: "shipping address-line3", required: false },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  singapore: {
    label: "Singapore",
    deliveryHint: "Postal code and unit number keep high-rise deliveries readable on small screens.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "blockHouseNo", label: "Block / House No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "streetName", label: "Street Name", autoComplete: "shipping address-line2", required: true, requiredMessage: "Street name is required." },
      { key: "buildingName", label: "Building Name", autoComplete: "shipping address-line3", required: false },
      { key: "unitNo", label: "Unit No. (#12-34)", autoComplete: "shipping address-line3", required: false },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  taiwan: {
    label: "Taiwan",
    deliveryHint: "City, district, road, section, lane, alley, and number stay separated for precise routing.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "cityCounty", label: "City / County", autoComplete: "shipping address-level1", required: true, requiredMessage: "City or county is required." },
      { key: "districtTownship", label: "District / Township", autoComplete: "shipping address-level2", required: true, requiredMessage: "District or township is required." },
      { key: "roadStreet", label: "Road / Street", autoComplete: "shipping address-line1", required: false },
      { key: "section", label: "Section", autoComplete: "shipping address-line2", required: false },
      { key: "lane", label: "Lane", autoComplete: "shipping address-line2", required: false },
      { key: "alley", label: "Alley", autoComplete: "shipping address-line2", required: false },
      { key: "streetNumber", label: "No. / Building No.", autoComplete: "shipping address-line3", required: true, requiredMessage: "House or building number is required." },
      { key: "floorRoom", label: "Floor / Room", autoComplete: "shipping address-line3", required: false },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  china: {
    label: "China",
    deliveryHint: "Province, city, district, and compound details are collected as separate fields.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "provinceMunicipality", label: "Province / Municipality", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "city", label: "City", autoComplete: "shipping address-level2", required: false },
      { key: "districtCounty", label: "District / County", autoComplete: "shipping address-level3", required: true, requiredMessage: "District or county is required." },
      { key: "streetRoad", label: "Street / Road", autoComplete: "shipping address-line1", required: false },
      { key: "communityCompound", label: "Community / Compound", autoComplete: "shipping address-line2", required: false },
      { key: "buildingHouseNo", label: "Building / House No.", autoComplete: "shipping address-line3", required: true, requiredMessage: "House or building number is required." },
      { key: "floorRoom", label: "Floor / Room", autoComplete: "shipping address-line3", required: false },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  philippines: {
    label: "Philippines",
    deliveryHint: "Barangay, municipality, and province fields are required for regional fulfillment.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseBuildingNo", label: "House No. / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "streetSubdivision", label: "Street / Subdivision", autoComplete: "shipping address-line2", required: false },
      { key: "barangay", label: "Barangay", autoComplete: "shipping address-level3", required: true, requiredMessage: "Barangay is required." },
      { key: "cityMunicipality", label: "City / Municipality", autoComplete: "shipping address-level2", required: false },
      { key: "province", label: "Province", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  malaysia: {
    label: "Malaysia",
    deliveryHint: "Postcode, city, and state are kept distinct for courier handoff.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseLotBuilding", label: "House / Lot / Building", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "streetName", label: "Street Name", autoComplete: "shipping address-line2", required: false },
      { key: "areaTamanSeksyen", label: "Area / Taman / Seksyen", autoComplete: "shipping address-line3", required: false },
      { key: "postalCode", label: "Postcode", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "city", label: "City / Locality", autoComplete: "shipping address-level2", required: true, requiredMessage: "City or locality is required." },
      { key: "state", label: "State", autoComplete: "shipping address-level1", required: true, requiredMessage: "State is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  indonesia: {
    label: "Indonesia",
    deliveryHint: "RT/RW, kelurahan, kecamatan, city, and province fields support local delivery labels.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseBuildingStreetNo", label: "Street / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "Street or building number is required." },
      { key: "rtRw", label: "RT / RW", autoComplete: "shipping address-line2", required: false },
      { key: "kelurahanDesa", label: "Kelurahan / Desa", autoComplete: "shipping address-level4", required: true, requiredMessage: "Village is required." },
      { key: "kecamatan", label: "District / Kecamatan", autoComplete: "shipping address-level3", required: false },
      { key: "cityRegency", label: "City / Regency", autoComplete: "shipping address-level2", required: false },
      { key: "province", label: "Province", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "postalCode", label: "Postal Code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  hongKong: {
    label: "Hong Kong",
    deliveryHint: "Flat, floor, building, district, and region are enough for most Hong Kong deliveries.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "flatRoom", label: "Flat / Room", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "floor", label: "Floor", autoComplete: "shipping address-line2", required: false },
      { key: "blockTower", label: "Block / Tower", autoComplete: "shipping address-line2", required: false },
      { key: "buildingEstateName", label: "Building / Estate Name", autoComplete: "shipping address-line3", required: false },
      { key: "streetNoName", label: "Street No. and Street Name", autoComplete: "shipping street-address", required: false },
      { key: "district", label: "District", autoComplete: "shipping address-level2", required: true, requiredMessage: "District is required." },
      { key: "region", label: "Region", autoComplete: "shipping address-level1", required: true, requiredMessage: "Region is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
};

const paymentMethods: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
  icon: ReactNode;
  logos?: typeof cardBrandLogos;
  logoSrc?: string;
}> = [
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, Mastercard, American Express, JCB, UnionPay, and Discover.",
    icon: <CardIcon />,
    logos: cardBrandLogos,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay with cash when local courier delivery is available.",
    icon: <CashIcon />,
  },
  {
    id: "bankTransfer",
    title: "Bank Transfer",
    description: "Transfer instructions are prepared after order creation.",
    icon: <BankIcon />,
  },
  {
    id: "promptPay",
    title: "PromptPay / Thai QR Payment",
    description: "Thai QR payment details are prepared by the payment service.",
    icon: <QrIcon />,
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Wallet checkout is ready for provider connection.",
    icon: <WalletIcon />,
    logoSrc: paymentIconAsset("assets/payment-icons/paypal.png"),
  },
  {
    id: "googlePay",
    title: "Google Pay",
    description: "Existing wallet logo support is ready for provider connection.",
    icon: <WalletIcon />,
    logoSrc: paymentIconAsset("assets/payment-icons/google-pay.png"),
  },
  {
    id: "alipay",
    title: "Alipay",
    description: "Existing wallet logo support is ready for provider connection.",
    icon: <WalletIcon />,
    logoSrc: paymentIconAsset("assets/payment-icons/alipay.png"),
  },
  {
    id: "cashApp",
    title: "Cash App",
    description: "Existing wallet logo support is ready for provider connection.",
    icon: <WalletIcon />,
    logoSrc: paymentIconAsset("assets/payment-icons/cash-app.png"),
  },
];

function CardIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <rect className="fill-neutral-900" height="15" rx="3" width="20" x="2" y="5" />
      <path className="fill-white/70" d="M4 9h16v3H4z" />
      <path className="stroke-white" d="M6 16h4" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="13" rx="2.5" width="19" x="2.5" y="5.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.2v5.6" />
      <path d="M18 9.2v5.6" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m3 9 9-5 9 5" />
      <path d="M5 10h14" />
      <path d="M6 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M18 10v8" />
      <path d="M4 19h16" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h2v2h-2z" />
      <path d="M18 14h2v6h-4v-2h2z" />
      <path d="M14 18h2v2h-2z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4.5 7.5h13.8a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V7.2A2.2 2.2 0 0 1 5.7 5h10.1" />
      <path d="M16 12h4.5v4H16a2 2 0 0 1 0-4Z" />
      <path d="M16.6 14h.1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.1" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M12 3 5.5 5.5v6.1c0 4.1 2.7 7.8 6.5 9.4 3.8-1.6 6.5-5.3 6.5-9.4V5.5Z" />
      <path d="m9.5 12.2 1.8 1.8 3.6-4" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M4 11.2V5.5A1.5 1.5 0 0 1 5.5 4h5.7a2 2 0 0 1 1.4.6l6.8 6.8a2 2 0 0 1 0 2.8l-5.2 5.2a2 2 0 0 1-2.8 0l-6.8-6.8A2 2 0 0 1 4 11.2Z" />
      <circle cx="8" cy="8" r="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="m5 12 4.2 4.2L19 6.8" />
    </svg>
  );
}

function getAddressError(field: AddressField, value: string) {
  const trimmedValue = value.trim();

  if (field.required && !trimmedValue) {
    return field.requiredMessage ?? `${field.label} is required.`;
  }

  if (field.key === "phoneNumber" && trimmedValue) {
    const digitCount = trimmedValue.replace(/\D/g, "").length;
    if (digitCount < 7) {
      return "Enter a valid phone number.";
    }
  }

  if (field.type === "postal" && trimmedValue && trimmedValue.length < 3) {
    return "Enter a valid postal code.";
  }

  return "";
}

function validateAddress(values: AddressValues, config: AddressConfig) {
  return config.fields.reduce<FieldErrors>((errors, field) => {
    const error = getAddressError(field, values[field.key] ?? "");
    if (error) {
      errors[field.key] = error;
    }
    return errors;
  }, {});
}

function preserveAddressValuesForCountry(values: AddressValues, country: CountryKey) {
  const nextFieldKeys = new Set(addressConfigs[country].fields.map((field) => field.key));

  return Object.entries(values).reduce<AddressValues>((nextValues, [key, value]) => {
    if (nextFieldKeys.has(key)) {
      nextValues[key] = value;
    }
    return nextValues;
  }, {});
}

function getBlankAddressValues(country: CountryKey) {
  return addressConfigs[country].fields.reduce<AddressValues>((values, field) => {
    values[field.key] = "";
    return values;
  }, {});
}

function getScopedAutocomplete(field: AddressField, scope: "shipping" | "billing") {
  return field.autoComplete?.replace(/^shipping\b/, scope) ?? field.autoComplete;
}

function createAddressSummary(country: CountryKey, values: AddressValues) {
  const config = addressConfigs[country];
  const addressParts = config.fields
    .filter((field) => !["fullName", "phoneNumber", "deliveryNote"].includes(field.key))
    .map((field) => values[field.key]?.trim())
    .filter(Boolean)
    .slice(0, 5);

  return `${config.label} - ${addressParts.join(", ") || "Address details"}`;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiryDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateCardForm(values: CardFormValues) {
  const errors: FieldErrors = {};
  const cardDigits = values.cardNumber.replace(/\D/g, "");
  const expiryDigits = values.expiryDate.replace(/\D/g, "");
  const month = Number(expiryDigits.slice(0, 2));
  const year = Number(expiryDigits.slice(2, 4));
  const expiryLimit = expiryDigits.length === 4 ? new Date(2000 + year, month, 1) : null;

  if (!values.cardholderName.trim()) {
    errors.cardholderName = "Enter the cardholder name.";
  }

  if (cardDigits.length < 12 || cardDigits.length > 19) {
    errors.cardNumber = "Enter a valid card number.";
  }

  if (expiryDigits.length !== 4 || month < 1 || month > 12 || !expiryLimit || expiryLimit <= new Date()) {
    errors.expiryDate = "Enter a valid expiry date.";
  }

  if (!/^\d{3,4}$/.test(values.cvv)) {
    errors.cvv = "Enter a valid CVV.";
  }

  return errors;
}

function CheckoutInput({
  autoComplete,
  error,
  id,
  inputMode,
  label,
  maxLength,
  multiline,
  onBlur,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  autoComplete?: string;
  error?: string;
  id: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const errorId = `${id}-error`;
  const controlClass = `min-h-[52px] w-full rounded-2xl border px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15 disabled:cursor-not-allowed disabled:bg-neutral-100 ${
    error ? "border-red-400 bg-red-50/40" : "border-neutral-200 bg-white"
  }`;

  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="flex items-center gap-1 text-sm font-bold text-neutral-800">
        {label}
        {required ? <span className="text-red-500" aria-label="required">*</span> : null}
      </span>
      {multiline ? (
        <textarea
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`${controlClass} min-h-[96px] resize-y py-3 leading-6`}
          id={id}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={controlClass}
          id={id}
          inputMode={inputMode}
          maxLength={maxLength}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      )}
      {error ? (
        <span className="text-sm font-semibold text-red-600" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SectionCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
      <div className="mb-5 grid gap-1">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-citrus-500">{eyebrow}</p> : null}
        <h2 className="text-2xl font-black tracking-[-0.02em] text-neutral-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PaymentRadioRow({
  checked,
  description,
  icon,
  logoSrc,
  logos,
  onSelect,
  title,
  disabled = false,
  unavailableReason,
}: {
  checked: boolean;
  description: string;
  icon: ReactNode;
  logoSrc?: string;
  logos?: typeof cardBrandLogos;
  onSelect: () => void;
  title: string;
  disabled?: boolean;
  unavailableReason?: string | null;
}) {
  return (
    <label
      className={`grid grid-cols-[28px_52px_minmax(0,1fr)] items-start gap-3 py-3 text-neutral-900 transition sm:grid-cols-[28px_58px_minmax(0,1fr)] ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:text-leaf-700"}`}
    >
      <input checked={checked} className="sr-only" disabled={disabled} name="payment-method" onChange={onSelect} type="radio" />
      <span
        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="flex h-10 w-12 items-center justify-center rounded-md border border-neutral-200 bg-white sm:h-11 sm:w-14">
        {logoSrc ? <img alt="" className="max-h-6 max-w-[42px] object-contain sm:max-w-[46px]" src={logoSrc} /> : <span className="text-neutral-700">{icon}</span>}
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-base font-semibold text-neutral-950">{title}</span>
          {logos ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {logos.map((logo) => (
                <img alt={logo.label} className={`${logo.widthClass} h-auto object-contain`} key={logo.label} src={logo.src} />
              ))}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm leading-6 text-neutral-500">{description}</span>
        {unavailableReason ? <span className="mt-1 block text-xs font-bold text-amber-700">Unavailable: {unavailableReason}</span> : null}
      </span>
    </label>
  );
}

function SummaryRow({
  label,
  muted,
  value,
  valueClassName = "text-neutral-950",
}: {
  label: string;
  muted?: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <div className="grid gap-0.5">
        <span className="font-semibold text-neutral-800">{label}</span>
        {muted ? <span className="text-xs font-medium text-neutral-500">{muted}</span> : null}
      </div>
      <span className={`shrink-0 font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}

function EmptyCheckoutState({ onCart, onShop }: { onCart: () => void; onShop: () => void }) {
  return (
    <section className="bg-[#fcfcfd] px-4 pb-16 pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
      <div className="mx-auto grid max-w-5xl gap-6 rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-50 text-leaf-700">
          <CardIcon />
        </div>
        <div className="grid gap-2">
          <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950">Checkout</h1>
          <p className="text-sm leading-7 text-neutral-500">Select cart items before continuing to checkout.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-sm font-black text-white transition hover:bg-leaf-700"
            onClick={onCart}
            type="button"
          >
            Return to Cart
          </button>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-6 text-sm font-black text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            onClick={onShop}
            type="button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  );
}

export function CheckoutPage() {
  const cartQuantities = useHomeStore((state) => state.cartQuantities);
  const cartLineProductIds = useHomeStore((state) => state.cartLineProductIds);
  const selectedCartIds = useHomeStore((state) => state.selectedCartIds);
  const cartItemIds = useHomeStore((state) => state.cartItemIds);
  const hydrateCommerceCart = useHomeStore((state) => state.hydrateCommerceCart);
  const openCart = useHomeStore((state) => state.openCart);
  const backToHome = useHomeStore((state) => state.backToHome);
  const selectedZipCode = useHomeStore((state) => state.selectedZipCode);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const token = usePublicAuthStore((state) => state.token);
  const hasBackendSession = Boolean(currentUser && token);
  const catalogIds = useMemo(() => Object.values(cartLineProductIds), [cartLineProductIds]);
  const { products: catalogProducts, isLoading: isCatalogLoading, error: catalogError } = useCatalogProducts(catalogIds);

  const [addressCountry, setAddressCountry] = useState<CountryKey>("thailand");
  const [addressValues, setAddressValues] = useState<AddressValues>({});
  const [addressErrors, setAddressErrors] = useState<FieldErrors>({});
  const [addressTouched, setAddressTouched] = useState<TouchedFields>({});
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(true);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(Boolean(currentUser));
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState<SavedAddress | null>(null);
  const [addressFormRestoreAddress, setAddressFormRestoreAddress] = useState<SavedAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paymentAvailability, setPaymentAvailability] = useState<PaymentMethodAvailability[]>([]);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<CommerceOrder | null>(null);
  const [guestEmail, setGuestEmail] = useState(currentUser?.email ?? "");
  const [cardValues, setCardValues] = useState<CardFormValues>({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingSameAsShipping: true,
  });
  const [cardErrors, setCardErrors] = useState<FieldErrors>({});
  const [cardTouched, setCardTouched] = useState<TouchedFields>({});
  const [billingCountry, setBillingCountry] = useState<CountryKey>("thailand");
  const [billingAddressValues, setBillingAddressValues] = useState<AddressValues>({});
  const [billingAddressErrors, setBillingAddressErrors] = useState<FieldErrors>({});
  const [billingAddressTouched, setBillingAddressTouched] = useState<TouchedFields>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const deliverySectionReference = useRef<HTMLDivElement | null>(null);

  const selectedItems = useMemo<CheckoutLineItem[]>(
    () =>
      Object.entries(cartQuantities)
        .filter(([lineId]) => selectedCartIds.includes(lineId))
        .map(([lineId, quantity]) => {
          const baseProduct = catalogProducts.get(cartLineProductIds[lineId] ?? lineId);
          if (!baseProduct || !isBackendOrderableProduct(baseProduct) || !cartItemIds[lineId]) return null;
          const variant = baseProduct.variants.find((item) => item.id === lineId) ?? baseProduct.variants[0];
          return {
          lineId,
          product: variant ? { ...baseProduct, price: variant.price, oldPrice: variant.oldPrice, size: variant.packSize, quantity: variant.packSize, unitPrice: variant.unitPrice, inStock: variant.inStock } : baseProduct,
          quantity,
          };
        }).filter((item): item is CheckoutLineItem => Boolean(item)),
    [cartItemIds, cartLineProductIds, cartQuantities, catalogProducts, selectedCartIds],
  );

  const activeAddressConfig = addressConfigs[addressCountry];
  const activeBillingAddressConfig = addressConfigs[billingCountry];
  const selectedSavedAddress = savedAddresses.find((address) => address.id === selectedAddressId) ?? null;
  const selectedAddress = selectedSavedAddress ?? checkoutAddress ?? savedAddresses[0] ?? null;
  const otherSavedAddresses = savedAddresses.filter((address) => address.id !== selectedAddress?.id);
  const addressValidation = validateAddress(addressValues, activeAddressConfig);
  const isAddressReady = selectedAddress ? true : Object.keys(addressValidation).length === 0;
  const cardValidation = validateCardForm(cardValues);
  const billingAddressValidation = cardValues.billingSameAsShipping ? {} : validateAddress(billingAddressValues, activeBillingAddressConfig);
  const selectedPaymentAvailability = paymentAvailability.find((method) => method.code === paymentMethodCodes[paymentMethod]);
  const isPaymentReady = Boolean(selectedPaymentAvailability?.enabled);
  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const displayedRetailSubtotal = selectedItems.reduce((sum, item) => sum + (item.product.oldPrice ?? item.product.price) * item.quantity, 0);
  const displayedSubtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const retailSubtotal = quote ? Number(quote.retail_subtotal.amount) : displayedRetailSubtotal;
  const subtotal = quote ? Number(quote.subtotal.amount) : displayedSubtotal;
  const itemDiscount = Math.max(0, retailSubtotal - subtotal);
  const shipping = quote ? Number(quote.shipping.amount) : 0;
  const couponDiscount = quote ? Number(quote.promo_discount.amount) : 0;
  const estimatedTax = quote ? Number(quote.tax.amount) : 0;
  const estimatedTotal = quote ? Number(quote.total.amount) : Math.max(0, subtotal);
  const canPlaceOrder = selectedItems.length > 0 && isAddressReady && isPaymentReady && Boolean(quote?.can_place_order) && !isQuoteLoading && new Date(quote?.expires_at ?? 0).getTime() > Date.now();
  const checkoutButtonLabel = isPlacingOrder ? "Placing order..." : "Place Order";

  useEffect(() => {
    if (!currentUser || !token) {
      return;
    }

    let isMounted = true;

    void apiRequest<{
      addresses: Array<{
        id: number;
        country_key: CountryKey;
        address_values: AddressValues;
        summary: string;
        is_default: boolean;
      }>;
    }>("/account/addresses", { token })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const mappedAddresses = (response.addresses ?? []).map((item) => ({
          id: String(item.id),
          country: item.country_key,
          values: item.address_values ?? {},
          summary: item.summary,
        }));
        setSavedAddresses(mappedAddresses);

        const defaultAddress = (response.addresses ?? []).find((item) => item.is_default);
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
          setCheckoutAddress({
            id: String(defaultAddress.id),
            country: defaultAddress.country_key,
            values: defaultAddress.address_values ?? {},
            summary: defaultAddress.summary,
          });
          setAddressCountry(defaultAddress.country_key);
          setAddressValues(defaultAddress.address_values ?? {});
          setIsAddressFormOpen(false);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [currentUser, token]);

  useEffect(() => {
    let active = true;
    void checkoutApi.paymentMethods(token).then((response) => {
      if (!active) return;
      setPaymentAvailability(response.payment_methods);
      const selected = response.payment_methods.find((method) => method.code === paymentMethodCodes[paymentMethod]);
      if (!selected?.enabled) {
        const firstEnabled = response.payment_methods.find((method) => method.enabled);
        if (firstEnabled) {
          const uiMethod = (Object.entries(paymentMethodCodes).find(([, code]) => code === firstEnabled.code)?.[0] ?? "cod") as PaymentMethod;
          setPaymentMethod(uiMethod);
        }
      }
    }).catch((error) => setCheckoutNotice(toUserFacingErrorMessage(error, "Payment methods are unavailable.")));
    return () => { active = false; };
  }, [paymentMethod, token]);

  useEffect(() => {
    if (paymentMethod !== "card") {
      setCardValues({ cardholderName: "", cardNumber: "", expiryDate: "", cvv: "", billingSameAsShipping: true });
      setCardErrors({});
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (!selectedAddress || !selectedItems.length || !isPaymentReady || (!hasBackendSession && !guestEmail.trim())) {
      setQuote(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setIsQuoteLoading(true);
      setCheckoutNotice(null);
      const addressPayload = {
        full_name: selectedAddress.values.fullName,
        phone_number: selectedAddress.values.phoneNumber,
        country_key: selectedAddress.country,
        address_values: selectedAddress.values,
        summary: selectedAddress.summary,
        delivery_note: selectedAddress.values.deliveryNote || null,
      };
      void checkoutApi.quote({
        cart_item_ids: selectedCartIds.map((id) => cartItemIds[id]).filter(Boolean),
        guest_email: hasBackendSession ? null : guestEmail.trim(),
        shipping_address: addressPayload,
        billing_same_as_shipping: true,
        promo_code: coupon?.code ?? null,
        payment_method_code: paymentMethodCodes[paymentMethod],
      }, token).then((response) => {
        if (!active) return;
        setQuote(response.quote);
        if (response.quote.promo_code) {
          setCoupon({ code: response.quote.promo_code, discount: Number(response.quote.promo_discount.amount) });
          setCouponMessage(`${response.quote.promo_code} applied.`);
          setCouponError(null);
        }
      }).catch((error) => {
        if (!active) return;
        setQuote(null);
        const message = toUserFacingErrorMessage(error, "Unable to calculate checkout totals.");
        if (coupon?.code) { setCoupon(null); setCouponError(message); } else { setCheckoutNotice(message); }
      }).finally(() => { if (active) setIsQuoteLoading(false); });
    }, 300);

    return () => { active = false; window.clearTimeout(timer); };
  }, [cartItemIds, coupon?.code, currentUser, guestEmail, hasBackendSession, isPaymentReady, paymentMethod, selectedAddress, selectedCartIds, selectedItems, token]);

  function updateAddressValue(field: AddressField, value: string) {
    setAddressValues((current) => ({
      ...current,
      [field.key]: value,
    }));

    if (addressTouched[field.key] || addressErrors[field.key]) {
      const nextError = getAddressError(field, value);
      setAddressErrors((current) => {
        const nextErrors = { ...current };
        if (nextError) {
          nextErrors[field.key] = nextError;
        } else {
          delete nextErrors[field.key];
        }
        return nextErrors;
      });
    }

    if (selectedAddress) {
      setSelectedAddressId(null);
      setCheckoutAddress(null);
    }
  }

  function markAddressTouched(field: AddressField) {
    const nextError = getAddressError(field, addressValues[field.key] ?? "");
    setAddressTouched((current) => ({ ...current, [field.key]: true }));
    setAddressErrors((current) => {
      const nextErrors = { ...current };
      if (nextError) {
        nextErrors[field.key] = nextError;
      } else {
        delete nextErrors[field.key];
      }
      return nextErrors;
    });
  }

  function handleCountryChange(nextCountry: CountryKey) {
    setAddressCountry(nextCountry);
    setAddressValues((current) => preserveAddressValuesForCountry(current, nextCountry));
    setAddressErrors({});
    setAddressTouched({});
    setSelectedAddressId(null);
    setCheckoutAddress(null);
    setIsAddressFormOpen(true);
  }

  function restoreAddressCard(address: SavedAddress | null) {
    if (address) {
      setSelectedAddressId(address.id);
      setCheckoutAddress(address);
      setAddressCountry(address.country);
      setAddressValues({ ...address.values });
    } else {
      setSelectedAddressId(null);
      setCheckoutAddress(null);
      setAddressValues(getBlankAddressValues(addressCountry));
    }

    setAddressErrors({});
    setAddressTouched({});
    setIsAddressFormOpen(false);
    setAddressFormRestoreAddress(null);
  }

  function openBlankAddressForm() {
    setAddressFormRestoreAddress(selectedAddress ?? checkoutAddress ?? savedAddresses[0] ?? null);
    setAddressValues(getBlankAddressValues(addressCountry));
    setAddressErrors({});
    setAddressTouched({});
    setSelectedAddressId(null);
    setCheckoutAddress(null);
    setIsAddressFormOpen(true);
  }

  function cancelAddressForm() {
    restoreAddressCard(addressFormRestoreAddress ?? selectedAddress ?? checkoutAddress ?? savedAddresses[0] ?? null);
  }

  function editSelectedAddress() {
    if (!selectedAddress) {
      openBlankAddressForm();
      return;
    }

    setAddressFormRestoreAddress(selectedAddress);
    setAddressCountry(selectedAddress.country);
    setAddressValues({ ...selectedAddress.values });
    setAddressErrors({});
    setAddressTouched({});
    setIsAddressFormOpen(true);
  }

  function updateBillingAddressValue(field: AddressField, value: string) {
    setBillingAddressValues((current) => ({
      ...current,
      [field.key]: value,
    }));

    if (billingAddressTouched[field.key] || billingAddressErrors[field.key]) {
      const nextError = getAddressError(field, value);
      setBillingAddressErrors((current) => {
        const nextErrors = { ...current };
        if (nextError) {
          nextErrors[field.key] = nextError;
        } else {
          delete nextErrors[field.key];
        }
        return nextErrors;
      });
    }
  }

  function markBillingAddressTouched(field: AddressField) {
    const nextError = getAddressError(field, billingAddressValues[field.key] ?? "");
    setBillingAddressTouched((current) => ({ ...current, [field.key]: true }));
    setBillingAddressErrors((current) => {
      const nextErrors = { ...current };
      if (nextError) {
        nextErrors[field.key] = nextError;
      } else {
        delete nextErrors[field.key];
      }
      return nextErrors;
    });
  }

  function handleBillingCountryChange(nextCountry: CountryKey) {
    setBillingCountry(nextCountry);
    setBillingAddressValues((current) => preserveAddressValuesForCountry(current, nextCountry));
    setBillingAddressErrors({});
    setBillingAddressTouched({});
  }

  function handleUseCurrentZip() {
    if (!activeAddressConfig.fields.some((field) => field.key === "postalCode")) {
      return;
    }

    setAddressValues((current) => ({
      ...current,
      postalCode: selectedZipCode || current.postalCode || "",
    }));
  }

  function handleUseAddress() {
    const nextErrors = validateAddress(addressValues, activeAddressConfig);
    const touchedFields = activeAddressConfig.fields.reduce<TouchedFields>((fields, field) => {
      fields[field.key] = true;
      return fields;
    }, {});

    setAddressTouched(touchedFields);
    setAddressErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return false;
    }

    const nextAddress: SavedAddress = {
      id: `checkout-address-${Date.now()}`,
      country: addressCountry,
      values: { ...addressValues },
      summary: createAddressSummary(addressCountry, addressValues),
    };

    setCheckoutAddress(nextAddress);
    setSelectedAddressId(nextAddress.id);
    setIsAddressFormOpen(false);
    setAddressFormRestoreAddress(null);
    window.setTimeout(() => {
      deliverySectionReference.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 0);

    if (currentUser && saveAddressForFuture) {
      setSavedAddresses((current) => [nextAddress, ...current.filter((address) => address.summary !== nextAddress.summary)].slice(0, 4));

      if (token) {
        void apiRequest("/account/addresses", {
          method: "POST",
          token,
          body: {
            country_key: nextAddress.country,
            address_values: nextAddress.values,
            summary: nextAddress.summary,
            is_default: savedAddresses.length === 0,
          },
        }).then(() =>
          apiRequest<{
            addresses: Array<{
              id: number;
              country_key: CountryKey;
              address_values: AddressValues;
              summary: string;
              is_default: boolean;
            }>;
          }>("/account/addresses", { token }).then((response) => {
            const nextSavedAddresses = (response.addresses ?? []).map((item) => ({
              id: String(item.id),
              country: item.country_key,
              values: item.address_values ?? {},
              summary: item.summary,
            }));
            setSavedAddresses(nextSavedAddresses);
          }),
        ).catch(() => undefined);
      }
    }

    return true;
  }

  function selectSavedAddress(address: SavedAddress) {
    setSelectedAddressId(address.id);
    setAddressCountry(address.country);
    setAddressValues({ ...address.values });
    setAddressErrors({});
    setAddressTouched({});
    setCheckoutAddress(address);
    setIsAddressFormOpen(false);
    setAddressFormRestoreAddress(null);
  }

  function updateCardValue(field: keyof CardFormValues, value: string | boolean) {
    const nextValue =
      field === "cardNumber"
        ? formatCardNumber(String(value))
        : field === "expiryDate"
          ? formatExpiryDate(String(value))
          : field === "cvv"
            ? String(value).replace(/\D/g, "").slice(0, 4)
            : value;
    const nextValues = {
      ...cardValues,
      [field]: nextValue,
    } as CardFormValues;

    setCardValues(nextValues);

    if (cardTouched[field] || cardErrors[field]) {
      setCardErrors(validateCardForm(nextValues));
    }

    if (field === "billingSameAsShipping" && nextValue === true) {
      setBillingAddressErrors({});
      setBillingAddressTouched({});
    }
  }

  function markCardTouched(field: keyof CardFormValues) {
    setCardTouched((current) => ({ ...current, [field]: true }));
    setCardErrors(validateCardForm(cardValues));
  }

  async function handleApplyCoupon() {
    const normalizedCode = couponInput.trim().toUpperCase();
    setCouponMessage(null);
    setCouponError(null);

    if (!normalizedCode) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setCoupon({ code: normalizedCode, discount: 0 });
    setCouponMessage("Validating promo with the store...");
    window.setTimeout(() => setIsApplyingCoupon(false), 350);
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
    setCouponError(null);
  }

  async function handlePlaceOrder() {
    setCheckoutNotice(null);

    if (!selectedAddress && !handleUseAddress()) {
      return;
    }

    if (!quote || !canPlaceOrder) { setCheckoutNotice("Wait for current totals before placing the order."); return; }

    setIsPlacingOrder(true);
    try {
      const response = await checkoutApi.placeOrder(quote.uuid, crypto.randomUUID(), token, selectedAddress?.values.deliveryNote);
      setPlacedOrder(response.order);
      if (response.guest_access_token) sessionStorage.setItem(`foodonline-order-${response.order.uuid}`, response.guest_access_token);
      await hydrateCommerceCart();
    } catch (error) {
      setCheckoutNotice(toUserFacingErrorMessage(error, "Unable to place the order."));
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (placedOrder) {
    return (
      <section className="bg-[#fcfcfd] px-4 pb-20 pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
        <div className="mx-auto grid max-w-4xl gap-6 rounded-[30px] border border-emerald-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="grid gap-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-leaf-600">Order confirmed</p><h1 className="text-4xl font-black text-neutral-950">Thank you for your order</h1><p className="text-neutral-600">Order <strong>{placedOrder.order_number}</strong> was created successfully.</p></div>
          <div className="grid gap-3 rounded-2xl bg-neutral-50 p-5 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-neutral-500">Total</p><p className="mt-1 text-lg font-black">{placedOrder.total.currency_code} {placedOrder.total.amount}</p></div><div><p className="text-xs font-bold uppercase text-neutral-500">Payment</p><p className="mt-1 font-black">Cash on Delivery · {placedOrder.payment_status}</p></div><div><p className="text-xs font-bold uppercase text-neutral-500">Fulfillment</p><p className="mt-1 font-black capitalize">{placedOrder.fulfillment_status}</p></div></div>
          <div className="grid gap-3">{placedOrder.items.map((item) => <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3" key={item.uuid}><div><p className="font-black text-neutral-950">{item.product_name}</p><p className="text-sm text-neutral-500">{item.variant_title} · SKU {item.sku} · Qty {item.quantity}</p></div><p className="font-black">{placedOrder.total.currency_code} {item.line_total}</p></div>)}</div>
          <div className="flex flex-wrap gap-3"><button className="min-h-12 rounded-2xl bg-leaf-600 px-6 font-black text-white" onClick={() => hasBackendSession ? useHomeStore.getState().openAccount("orders") : backToHome()} type="button">{hasBackendSession ? "View My Orders" : "Continue Shopping"}</button><button className="min-h-12 rounded-2xl border border-neutral-200 px-6 font-black" onClick={backToHome} type="button">Back to Store</button></div>
        </div>
      </section>
    );
  }

  if (!selectedItems.length) {
    return <EmptyCheckoutState onCart={openCart} onShop={backToHome} />;
  }

  return (
    <>
      <section className="bg-[#fcfcfd] px-4 pb-[calc(190px+env(safe-area-inset-bottom))] pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="grid gap-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-citrus-500">Secure grocery checkout</p>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-neutral-950">Checkout</h1>
              <p className="max-w-3xl text-sm leading-6 text-neutral-500">
                {hasBackendSession ? `Signed in as ${currentUser?.email ?? "your account"}.` : "Guest checkout is available for this order."}
              </p>
              {!hasBackendSession ? <label className="mt-2 grid max-w-md gap-1 text-sm font-bold text-neutral-700" htmlFor="checkout-guest-email"><span>Order email</span><input className="min-h-12 rounded-2xl border border-neutral-300 px-4 font-semibold outline-none focus:border-leaf-500" id="checkout-guest-email" onChange={(event) => setGuestEmail(event.target.value)} placeholder="name@example.com" type="email" value={guestEmail} /><span className="text-xs font-semibold text-neutral-500">Enter an email address to continue with secure guest checkout.</span></label> : null}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-black text-leaf-700 shadow-[0_8px_24px_rgba(34,197,94,0.08)]">
              <ShieldIcon />
              FoodOnlines Purchase Protection
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="grid gap-6">
              <div ref={deliverySectionReference} className="scroll-mt-[150px] lg:scroll-mt-[170px]">
                <SectionCard eyebrow="1. Shipping info" title="Delivery address">
                  <div className="grid gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
                        onClick={handleUseCurrentZip}
                        type="button"
                      >
                        <LocationIcon />
                        Use ZIP {selectedZipCode || "91789"}
                      </button>
                      <button
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 text-sm font-black text-white transition hover:bg-neutral-800 sm:flex-none"
                        onClick={openBlankAddressForm}
                        type="button"
                      >
                        <PlusIcon />
                        Add new address
                      </button>
                    </div>

                  {selectedAddress ? (
                    <div className="grid gap-3 rounded-[22px] border border-leaf-200 bg-emerald-50/80 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <label className="flex min-w-0 cursor-pointer items-start gap-3">
                        <input checked className="mt-1 h-5 w-5 accent-leaf-600" readOnly type="radio" />
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-neutral-950">{selectedAddress.values.fullName}</span>
                          <span className="mt-1 block text-sm leading-6 text-neutral-600">{selectedAddress.summary}</span>
                          <span className="mt-1 block text-xs font-semibold text-neutral-500">{selectedAddress.values.phoneNumber}</span>
                        </span>
                      </label>
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-leaf-500 bg-white px-4 text-sm font-black text-leaf-700 transition hover:bg-emerald-50"
                        onClick={editSelectedAddress}
                        type="button"
                      >
                        Edit
                      </button>
                    </div>
                  ) : null}

                  {otherSavedAddresses.length ? (
                    <div className="grid gap-3">
                      <p className="text-sm font-black text-neutral-950">Saved addresses</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {otherSavedAddresses.map((address) => {
                          const isSelected = selectedAddressId === address.id;
                          return (
                            <button
                              className={`rounded-[20px] border p-4 text-left transition ${
                                isSelected ? "border-leaf-500 bg-emerald-50" : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                              }`}
                              key={address.id}
                              onClick={() => selectSavedAddress(address)}
                              type="button"
                            >
                              <span className="block text-sm font-black text-neutral-950">{address.values.fullName}</span>
                              <span className="mt-1 block text-sm leading-6 text-neutral-600">{address.summary}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {isAddressFormOpen ? (
                    <form
                      className="grid gap-5 rounded-[24px] border border-neutral-200 bg-neutral-50 p-4 sm:p-5"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleUseAddress();
                      }}
                    >
                      <label className="grid gap-2" htmlFor="checkout-country">
                        <span className="text-sm font-bold text-neutral-800">
                          Country <span className="text-red-500" aria-label="required">*</span>
                        </span>
                        <select
                          autoComplete="shipping country-name"
                          className="min-h-[52px] rounded-2xl border border-neutral-200 bg-white px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
                          id="checkout-country"
                          onChange={(event) => handleCountryChange(event.target.value as CountryKey)}
                          value={addressCountry}
                        >
                          {countryOrder.map((country) => (
                            <option key={country} value={country}>
                              {addressConfigs[country].label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <p className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold leading-6 text-neutral-600">
                        {activeAddressConfig.deliveryHint}
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        {activeAddressConfig.fields.map((field) => {
                          const error = addressTouched[field.key] || addressErrors[field.key] ? addressErrors[field.key] : "";
                          return (
                            <div className={field.fullWidth ? "md:col-span-2" : ""} key={field.key}>
                              <CheckoutInput
                                autoComplete={getScopedAutocomplete(field, "shipping")}
                                error={error}
                                id={`checkout-address-${field.key}`}
                                inputMode={field.type === "postal" ? "numeric" : field.inputMode}
                                label={field.label}
                                multiline={field.type === "textarea"}
                                onBlur={() => markAddressTouched(field)}
                                onChange={(value) => updateAddressValue(field, value)}
                                placeholder={field.placeholder}
                                required={field.required}
                                type={field.type === "tel" ? "tel" : "text"}
                                value={addressValues[field.key] ?? ""}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {currentUser ? (
                        <label className="flex items-start gap-3 text-sm font-semibold text-neutral-700">
                          <input
                            checked={saveAddressForFuture}
                            className="mt-0.5 h-5 w-5 rounded border-neutral-300 accent-leaf-600"
                            onChange={(event) => setSaveAddressForFuture(event.target.checked)}
                            type="checkbox"
                          />
                          <span>Save this address for future orders</span>
                        </label>
                      ) : null}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold leading-5 text-neutral-500">Spaces and international phone formats are accepted while typing.</p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-100 px-5 text-sm font-black text-neutral-700 transition hover:bg-slate-200"
                            onClick={cancelAddressForm}
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf-600 px-5 text-sm font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                            type="submit"
                          >
                            Use this address
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : null}
                </div>
                </SectionCard>
              </div>

              <SectionCard eyebrow="2. Order details" title="Cart item details">
                {isCatalogLoading ? <p className="mb-3 text-sm font-semibold text-neutral-500">Refreshing catalog prices...</p> : null}
                {catalogError ? <p className="mb-3 text-sm font-semibold text-rose-700">{catalogError}</p> : null}
                <div className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white">
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                    <p className="text-sm font-black text-neutral-950">Order 1/1: Fulfilled by FoodOnlines</p>
                    <p className="text-sm font-bold text-neutral-600">{itemCount} items</p>
                  </div>
                  <div className="grid divide-y divide-neutral-100">
                    {selectedItems.map(({ lineId, product, quantity }) => (
                      <div className="grid gap-4 p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center" key={lineId}>
                        <img
                          alt={product.name}
                          className="h-[88px] w-[88px] rounded-[18px] bg-neutral-50 object-contain"
                          loading="lazy"
                          src={product.image}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black leading-6 text-neutral-950 line-clamp-2">{product.name}</h3>
                            {product.discountPercent ? (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-600">
                                {product.discountPercent}% OFF
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-neutral-500">{product.size || product.quantity}</p>
                          <p className="mt-1 text-sm text-neutral-500">
                            Qty {quantity} x {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="grid justify-start gap-1 sm:justify-end sm:text-right">
                          {product.oldPrice ? (
                            <span className="text-sm font-semibold text-neutral-400 line-through">{formatPrice(product.oldPrice * quantity)}</span>
                          ) : null}
                          <span className="text-xl font-black text-neutral-950">{formatPrice(product.price * quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard eyebrow="3. Payment" title="Payment method">
                <div className="grid gap-5">
                  <div className="grid divide-y divide-neutral-200 border-b border-neutral-200">
                    {paymentMethods.map((method) => (
                      <div key={method.id}>
                        {(() => { const availability = paymentAvailability.find((item) => item.code === paymentMethodCodes[method.id]); return (
                        <PaymentRadioRow
                          checked={paymentMethod === method.id}
                          description={method.description}
                          disabled={!availability?.enabled}
                          icon={method.icon}
                          logoSrc={method.logoSrc}
                          logos={method.logos}
                          onSelect={() => setPaymentMethod(method.id)}
                          title={method.title}
                          unavailableReason={availability?.unavailable_reason ?? (paymentAvailability.length ? "Payment method is unavailable." : "Checking availability...")}
                        />
                        ); })()}

                        {method.id === "card" && false ? (
                          <div className="grid gap-5 pb-6 sm:ml-[86px]">
                            <div className="grid gap-1">
                              <h3 className="text-lg font-semibold text-neutral-950">Add a New Card</h3>
                              <p className="text-sm font-medium text-neutral-500">Card details stay in page state only.</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <CheckoutInput
                                autoComplete="cc-name"
                                error={cardTouched.cardholderName || cardErrors.cardholderName ? cardErrors.cardholderName : ""}
                                id="checkout-cardholder-name"
                                label="Cardholder name"
                                onBlur={() => markCardTouched("cardholderName")}
                                onChange={(value) => updateCardValue("cardholderName", value)}
                                required
                                value={cardValues.cardholderName}
                              />
                              <CheckoutInput
                                autoComplete="cc-number"
                                error={cardTouched.cardNumber || cardErrors.cardNumber ? cardErrors.cardNumber : ""}
                                id="checkout-card-number"
                                inputMode="numeric"
                                label="Card number"
                                maxLength={23}
                                onBlur={() => markCardTouched("cardNumber")}
                                onChange={(value) => updateCardValue("cardNumber", value)}
                                placeholder="4242 4242 4242 4242"
                                required
                                value={cardValues.cardNumber}
                              />
                              <CheckoutInput
                                autoComplete="cc-exp"
                                error={cardTouched.expiryDate || cardErrors.expiryDate ? cardErrors.expiryDate : ""}
                                id="checkout-card-expiry"
                                inputMode="numeric"
                                label="Expiry date"
                                maxLength={5}
                                onBlur={() => markCardTouched("expiryDate")}
                                onChange={(value) => updateCardValue("expiryDate", value)}
                                placeholder="MM/YY"
                                required
                                value={cardValues.expiryDate}
                              />
                              <CheckoutInput
                                autoComplete="cc-csc"
                                error={cardTouched.cvv || cardErrors.cvv ? cardErrors.cvv : ""}
                                id="checkout-card-cvv"
                                inputMode="numeric"
                                label="CVV"
                                maxLength={4}
                                onBlur={() => markCardTouched("cvv")}
                                onChange={(value) => updateCardValue("cvv", value)}
                                required
                                type="password"
                                value={cardValues.cvv}
                              />
                            </div>

                            <div className="grid gap-4">
                              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                                <span className="text-base font-semibold text-neutral-950">Billing address</span>
                                <span className="flex items-center gap-3">
                                  <input
                                    checked={cardValues.billingSameAsShipping}
                                    className="h-5 w-5 rounded border-neutral-300 accent-neutral-950"
                                    onChange={(event) => updateCardValue("billingSameAsShipping", event.target.checked)}
                                    type="checkbox"
                                  />
                                  <span>Same as shipping address</span>
                                </span>
                              </label>

                              {!cardValues.billingSameAsShipping ? (
                                <div className="grid gap-5 rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
                                  <label className="grid gap-2" htmlFor="checkout-billing-country">
                                    <span className="text-sm font-bold text-neutral-800">
                                      Country <span className="text-red-500" aria-label="required">*</span>
                                    </span>
                                    <select
                                      autoComplete="billing country-name"
                                      className="min-h-[52px] rounded-2xl border border-neutral-200 bg-white px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
                                      id="checkout-billing-country"
                                      onChange={(event) => handleBillingCountryChange(event.target.value as CountryKey)}
                                      value={billingCountry}
                                    >
                                      {countryOrder.map((country) => (
                                        <option key={country} value={country}>
                                          {addressConfigs[country].label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <p className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold leading-6 text-neutral-600">
                                    {activeBillingAddressConfig.deliveryHint}
                                  </p>

                                  <div className="grid gap-4 md:grid-cols-2">
                                    {activeBillingAddressConfig.fields.map((field) => {
                                      const error =
                                        billingAddressTouched[field.key] || billingAddressErrors[field.key] ? billingAddressErrors[field.key] : "";
                                      return (
                                        <div className={field.fullWidth ? "md:col-span-2" : ""} key={field.key}>
                                          <CheckoutInput
                                            autoComplete={getScopedAutocomplete(field, "billing")}
                                            error={error}
                                            id={`checkout-billing-address-${field.key}`}
                                            inputMode={field.type === "postal" ? "numeric" : field.inputMode}
                                            label={field.label}
                                            multiline={field.type === "textarea"}
                                            onBlur={() => markBillingAddressTouched(field)}
                                            onChange={(value) => updateBillingAddressValue(field, value)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            type={field.type === "tel" ? "tel" : "text"}
                                            value={billingAddressValues[field.key] ?? ""}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <aside className="grid gap-5 xl:sticky xl:top-[176px] xl:self-start">
              <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-citrus-600">
                    <TagIcon />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.02em] text-neutral-950">Coupon</h2>
                    <p className="text-sm font-medium text-neutral-500">Apply before placing the order.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex gap-2">
                    <input
                      aria-label="Coupon code"
                      autoCapitalize="characters"
                      autoComplete="off"
                      className="min-h-12 min-w-0 flex-1 rounded-2xl border border-neutral-200 px-4 text-sm font-black uppercase tracking-[0.08em] text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15"
                      disabled={Boolean(coupon)}
                      onChange={(event) => {
                        setCouponInput(event.target.value);
                        setCouponError(null);
                        setCouponMessage(null);
                      }}
                      placeholder="Coupon code"
                      value={coupon?.code ?? couponInput}
                    />
                    {coupon ? (
                      <button
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 px-4 text-sm font-black text-neutral-900 transition hover:bg-neutral-50"
                        onClick={handleRemoveCoupon}
                        type="button"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 px-4 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        disabled={isApplyingCoupon}
                        onClick={handleApplyCoupon}
                        type="button"
                      >
                        {isApplyingCoupon ? "Applying" : "Apply"}
                      </button>
                    )}
                  </div>
                  <div className="min-h-[24px]" aria-live="polite">
                    {couponMessage ? <p className="text-sm font-semibold text-leaf-700">{couponMessage}</p> : null}
                    {couponError ? <p className="text-sm font-semibold text-red-600">{couponError}</p> : null}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                <h2 className="text-2xl font-black tracking-[-0.02em] text-neutral-950">Pricing summary</h2>
                <div className="mt-5 grid gap-3">
                  <SummaryRow label="Items retail" muted={`${itemCount} items selected`} value={formatPrice(retailSubtotal)} />
                  {itemDiscount > 0 ? <SummaryRow label="Discount" value={`-${formatPrice(itemDiscount)}`} valueClassName="text-leaf-700" /> : null}
                  <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                  <SummaryRow label="Coupon discount" value={couponDiscount > 0 ? `-${formatPrice(couponDiscount)}` : formatPrice(0)} valueClassName={couponDiscount > 0 ? "text-leaf-700" : "text-neutral-950"} />
                  <SummaryRow label="Delivery fee" muted={shipping <= 0 ? "Free shipping threshold reached" : `Free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`} value={shipping <= 0 ? "FREE" : formatPrice(shipping)} />
                  <SummaryRow label="Taxes / VAT" muted="Calculated by the store" value={formatPrice(estimatedTax)} />
                </div>

                <div className="mt-5 border-t border-neutral-900 pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-sm font-black text-neutral-800">Total price</span>
                    <span className="text-[2.35rem] font-black leading-none tracking-[-0.05em] text-neutral-950">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>

                <p className="mt-3 min-h-[22px] text-sm font-semibold leading-6 text-neutral-500">
                  {isQuoteLoading ? "Refreshing secure totals..." : canPlaceOrder ? `Current totals valid until ${new Date(quote!.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : "Complete delivery details and wait for current totals."}
                </p>
                {checkoutNotice ? (
                  <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
                    {checkoutNotice}
                  </p>
                ) : null}
              </section>
            </aside>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[1100] border-t border-neutral-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-12px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1480px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Order total</p>
            <p className="truncate text-xl font-black text-neutral-950">{formatPrice(estimatedTotal)}</p>
          </div>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-leaf-600 px-5 text-sm font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={!canPlaceOrder || isPlacingOrder || isQuoteLoading}
            onClick={handlePlaceOrder}
            type="button"
          >
            {checkoutButtonLabel}
          </button>
        </div>
      </div>
    </>
  );
}
