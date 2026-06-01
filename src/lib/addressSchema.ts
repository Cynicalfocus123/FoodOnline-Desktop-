import type { InputHTMLAttributes } from "react";

export type CountryKey =
  | "usa"
  | "uk"
  | "thailand"
  | "japan"
  | "singapore"
  | "taiwan"
  | "china"
  | "philippines"
  | "malaysia"
  | "indonesia"
  | "hongKong";

export type AddressFieldType = "text" | "tel" | "postal" | "textarea";

export type AddressField = {
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

export type AddressConfig = {
  label: string;
  deliveryHint: string;
  fields: AddressField[];
};

export type AddressValues = Record<string, string>;
export type FieldErrors = Record<string, string>;

export const countryOrder: CountryKey[] = [
  "usa",
  "uk",
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

export const addressConfigs: Record<CountryKey, AddressConfig> = {
  usa: {
    label: "United States",
    deliveryHint: "State, city, postal code, and street number are required for delivery routing.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "streetAddress", label: "Street / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "unitFloorRoom", label: "Apt / Suite / Floor / Room", autoComplete: "shipping address-line2", required: false },
      { key: "city", label: "City", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
      { key: "state", label: "State", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "postalCode", label: "ZIP code", type: "postal", autoComplete: "shipping postal-code", inputMode: "numeric", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  uk: {
    label: "United Kingdom",
    deliveryHint: "County/region, post code, and street number are required for local fulfillment.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseBuilding", label: "House / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "streetName", label: "Street Name", autoComplete: "shipping address-line2", required: true, requiredMessage: "Subdistrict is required." },
      { key: "locality", label: "Town / Locality", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
      { key: "countyRegion", label: "County / Region", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "postalCode", label: "Postcode", type: "postal", autoComplete: "shipping postal-code", required: true, requiredMessage: "Postal code is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
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
      { key: "prefecture", label: "Prefecture", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "cityWardTown", label: "City / Ward / Town", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "streetName", label: "Street Name", autoComplete: "shipping address-line2", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "cityCounty", label: "City / County", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "districtTownship", label: "District / Township", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "districtCounty", label: "District / County", autoComplete: "shipping address-level3", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "barangay", label: "Barangay", autoComplete: "shipping address-level3", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "city", label: "City / Locality", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
      { key: "state", label: "State", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
  indonesia: {
    label: "Indonesia",
    deliveryHint: "RT/RW, kelurahan, kecamatan, city, and province fields support local delivery labels.",
    fields: [
      { key: "fullName", label: "Full name", type: "text", autoComplete: "shipping name", required: true, requiredMessage: "Full name is required." },
      { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "shipping tel", inputMode: "tel", required: true, requiredMessage: "Phone number is required." },
      { key: "houseBuildingStreetNo", label: "Street / Building No.", autoComplete: "shipping address-line1", required: true, requiredMessage: "House or building number is required." },
      { key: "rtRw", label: "RT / RW", autoComplete: "shipping address-line2", required: false },
      { key: "kelurahanDesa", label: "Village / Kelurahan / Desa", autoComplete: "shipping address-level4", required: true, requiredMessage: "Subdistrict is required." },
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
      { key: "district", label: "District", autoComplete: "shipping address-level2", required: true, requiredMessage: "Subdistrict is required." },
      { key: "region", label: "Region", autoComplete: "shipping address-level1", required: true, requiredMessage: "Province is required." },
      { key: "deliveryNote", label: "Delivery note", type: "textarea", autoComplete: "off", required: false, fullWidth: true },
    ],
  },
};

export function getAddressError(field: AddressField, value: string) {
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

export function validateAddress(values: AddressValues, config: AddressConfig) {
  return config.fields.reduce<FieldErrors>((errors, field) => {
    const error = getAddressError(field, values[field.key] ?? "");
    if (error) {
      errors[field.key] = error;
    }
    return errors;
  }, {});
}

export function preserveAddressValuesForCountry(values: AddressValues, country: CountryKey) {
  const nextFieldKeys = new Set(addressConfigs[country].fields.map((field) => field.key));
  return Object.entries(values).reduce<AddressValues>((nextValues, [key, value]) => {
    if (nextFieldKeys.has(key)) {
      nextValues[key] = value;
    }
    return nextValues;
  }, {});
}

export function getBlankAddressValues(country: CountryKey) {
  return addressConfigs[country].fields.reduce<AddressValues>((values, field) => {
    values[field.key] = "";
    return values;
  }, {});
}

export function getScopedAutocomplete(field: AddressField, scope: "shipping" | "billing") {
  return field.autoComplete?.replace(/^shipping\b/, scope) ?? field.autoComplete;
}

export function createAddressSummary(country: CountryKey, values: AddressValues) {
  const config = addressConfigs[country];
  const addressParts = config.fields
    .filter((field) => !["fullName", "phoneNumber", "deliveryNote"].includes(field.key))
    .map((field) => values[field.key]?.trim())
    .filter(Boolean)
    .slice(0, 5);
  return `${config.label} - ${addressParts.join(", ") || "Address details"}`;
}
