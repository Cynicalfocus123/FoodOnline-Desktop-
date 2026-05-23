const PROMO_DISMISSED_KEY = "foodonline-promo-dismissed-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getIsPromoDismissed() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(PROMO_DISMISSED_KEY) === "true";
}

export function setPromoDismissed(value: boolean) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROMO_DISMISSED_KEY, value ? "true" : "false");
}
