import { formatPrice, getProductById } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

export function CheckoutPage() {
  const cartQuantities = useHomeStore((state) => state.cartQuantities);
  const selectedCartIds = useHomeStore((state) => state.selectedCartIds);
  const openCart = useHomeStore((state) => state.openCart);
  const backToHome = useHomeStore((state) => state.backToHome);
  const selectedZipCode = useHomeStore((state) => state.selectedZipCode);
  const currentUser = usePublicAuthStore((state) => state.currentUser);

  const selectedItems = Object.entries(cartQuantities)
    .filter(([productId]) => selectedCartIds.includes(productId))
    .map(([productId, quantity]) => ({
      product: getProductById(productId),
      quantity,
    }));

  const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!selectedItems.length) {
    return (
      <section className="bg-[#fcfcfd] px-4 pb-16 pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
        <div className="mx-auto grid max-w-5xl gap-6 rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
          <h1 className="text-3xl font-black text-neutral-950">Checkout</h1>
          <p className="text-sm leading-7 text-neutral-500">Select cart items before continuing to checkout.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-sm font-black text-white transition hover:bg-leaf-700"
              onClick={openCart}
              type="button"
            >
              Return to Cart
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-6 text-sm font-black text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
              onClick={backToHome}
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fcfcfd] px-4 pb-16 pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="grid gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Checkout</p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950">Shipping and payment</h1>
            <p className="text-sm leading-7 text-neutral-500">
              {currentUser
                ? `Signed in as ${currentUser.email}.`
                : "Guest checkout placeholder is ready for account connection."} Shipping and payment APIs are still placeholder-only.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
            <h2 className="text-xl font-black text-neutral-950">Shipping address</h2>
            <p className="text-sm leading-7 text-neutral-600">
              ZIP {selectedZipCode || "91789"} - address form placeholder. Connect this section to saved addresses and live delivery options later.
            </p>
          </div>

          <div className="grid gap-4 rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
            <h2 className="text-xl font-black text-neutral-950">Payment method</h2>
            <p className="text-sm leading-7 text-neutral-600">
              Payment collection is not connected yet. This placeholder is ready for card, wallet, and secure checkout integration.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)] xl:sticky xl:top-[176px] xl:self-start">
          <h2 className="text-2xl font-black text-neutral-950">Order total</h2>
          <div className="grid gap-4">
            {selectedItems.map(({ product, quantity }) => (
              <div className="flex items-center gap-3" key={product.id}>
                <img alt={product.name} className="h-16 w-16 rounded-[18px] bg-neutral-50 object-contain" src={product.image} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{product.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {quantity} x {formatPrice(product.price)}
                  </p>
                </div>
                <p className="text-sm font-black text-neutral-950">{formatPrice(product.price * quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-neutral-700">Subtotal</span>
              <span className="text-[1.8rem] font-black text-neutral-950">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
