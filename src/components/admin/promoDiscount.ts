export type PromoDiscountType = "percentage" | "fixed";

export const percentageValidationMessage = "Enter a percentage from 0.01% to 100%.";

function isTwoDecimalNumber(value: string) {
  return /^\d*(?:\.\d{0,2})?$/.test(value);
}

export function percentageToBasisPoints(value: string) {
  const trimmed = value.trim();
  if (!trimmed || !isTwoDecimalNumber(trimmed)) return null;
  const percentage = Number(trimmed);
  if (!Number.isFinite(percentage) || percentage < 0.01 || percentage > 100) return null;
  return Math.round(percentage * 100);
}

export function basisPointsToPercentage(value: number) {
  return Number.isFinite(value) ? String(value / 100) : "";
}

export function validatePercentage(value: string) {
  return percentageToBasisPoints(value) === null ? percentageValidationMessage : "";
}

export function moneyToMinor(value: string) {
  const trimmed = value.trim();
  if (!trimmed || !isTwoDecimalNumber(trimmed)) return null;
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

export function minorToMoney(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value) ? "" : (value / 100).toFixed(2);
}
