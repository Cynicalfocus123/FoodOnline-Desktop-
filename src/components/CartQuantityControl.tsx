import { useHomeStore } from "../store/homeStore";

type CartQuantityControlProps = {
  productId: string;
  variant?: "compact" | "detail";
};

function MinusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="m9 7 .6-2h4.8l.6 2" />
      <path d="M8 7v10.3A1.7 1.7 0 0 0 9.7 19h4.6A1.7 1.7 0 0 0 16 17.3V7" />
      <path d="M10 11v4" />
      <path d="M14 11v4" />
    </svg>
  );
}

export function CartQuantityControl({ productId, variant = "compact" }: CartQuantityControlProps) {
  const quantity = useHomeStore((state) => state.cartQuantities[productId] ?? 0);
  const addToCart = useHomeStore((state) => state.addToCart);
  const setCartQuantity = useHomeStore((state) => state.setCartQuantity);

  if (quantity <= 0) {
    return (
      <button
        className={
          variant === "detail"
            ? "inline-flex min-h-14 w-full items-center justify-center rounded-[22px] bg-leaf-600 px-6 text-base font-black text-white shadow-[0_14px_32px_rgba(22,163,74,0.24)] transition hover:bg-leaf-700"
            : "inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-full border-2 border-leaf-500 px-4 text-[13px] font-black text-leaf-600 transition hover:bg-leaf-500 hover:text-white"
        }
        onClick={(event) => {
          event.stopPropagation();
          addToCart(productId);
        }}
        type="button"
      >
        Add to cart
      </button>
    );
  }

  return (
    <div
      className={
        variant === "detail"
          ? "flex min-h-14 w-full items-center overflow-hidden rounded-[22px] bg-leaf-600 text-white shadow-[0_14px_32px_rgba(22,163,74,0.24)]"
          : "flex min-h-11 w-full items-center overflow-hidden rounded-full bg-leaf-600 text-white shadow-[0_10px_24px_rgba(22,163,74,0.2)]"
      }
    >
      <button
        className={
          variant === "detail"
            ? "inline-flex h-14 w-14 shrink-0 items-center justify-center"
            : "inline-flex h-11 w-11 shrink-0 items-center justify-center"
        }
        onClick={(event) => {
          event.stopPropagation();
          setCartQuantity(productId, quantity - 1);
        }}
        type="button"
      >
        {quantity === 1 ? <TrashIcon /> : <MinusIcon />}
      </button>
      <span
        className={
          variant === "detail"
            ? "flex-1 text-center text-base font-black tabular-nums"
            : "min-w-0 flex-1 text-center text-[15px] font-black tabular-nums"
        }
      >
        {quantity}
      </span>
      <button
        className={
          variant === "detail"
            ? "inline-flex h-14 w-14 shrink-0 items-center justify-center"
            : "inline-flex h-11 w-11 shrink-0 items-center justify-center"
        }
        onClick={(event) => {
          event.stopPropagation();
          setCartQuantity(productId, quantity + 1);
        }}
        type="button"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
