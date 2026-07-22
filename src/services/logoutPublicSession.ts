import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

/** Clears customer-owned storefront state before revoking the active public session. */
export async function logoutPublicSession() {
  useHomeStore.getState().clearAuthenticatedData();
  await usePublicAuthStore.getState().logoutUser();
}
