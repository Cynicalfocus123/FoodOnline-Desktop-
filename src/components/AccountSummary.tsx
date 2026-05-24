import { getProductById } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

export function AccountSummary() {
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const logoutUser = usePublicAuthStore((state) => state.logoutUser);
  const savedForLaterIds = useHomeStore((state) => state.savedForLaterIds);

  if (!currentUser) {
    return null;
  }

  const savedProducts = savedForLaterIds.map((productId) => getProductById(productId));

  return (
    <section className="bg-neutral-50 px-4 py-8 sm:px-6" id="account-summary">
      <div className="mx-auto grid max-w-7xl gap-4 rounded-[28px] border border-emerald-100 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">Account</p>
          <h2 className="mt-3 text-3xl font-black text-ink">You&apos;re signed in to FoodOnlines</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            Welcome back. Your live backend account is connected and ready for the public storefront.
          </p>
        </div>

        <div className="grid gap-3 rounded-[24px] border border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-700">
          <p>
            <span className="font-black text-ink">Name:</span> {currentUser.firstName} {currentUser.lastName}
          </p>
          <p>
            <span className="font-black text-ink">Email:</span> {currentUser.email}
          </p>
          <p>
            <span className="font-black text-ink">Account type:</span> {currentUser.accountType}
          </p>
          <p>
            <span className="font-black text-ink">Company:</span> {currentUser.companyName || "Not provided"}
          </p>
          <div className="grid gap-2 rounded-[18px] border border-neutral-200 bg-white p-4">
            <p className="font-black text-ink">Saved for later: {savedProducts.length}</p>
            {savedProducts.length ? (
              <ul className="grid gap-1 text-sm text-neutral-600">
                {savedProducts.slice(0, 3).map((product) => (
                  <li key={product.id}>{product.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Saved cart items appear here while your account is active.</p>
            )}
          </div>
          <div className="pt-2">
            <button
              className="min-h-12 rounded-md border border-neutral-200 px-5 text-sm font-black text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500"
              onClick={() => void logoutUser()}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
