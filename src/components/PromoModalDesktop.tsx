type PromoModalDesktopProps = {
  copyLabel: string;
  hasCopied: boolean;
  onClose: () => void;
  onCopy: () => void;
};

const desktopBenefitItems = [
  "Free shipping from qualifying orders",
  "Fast daily grocery delivery",
  "Fresh essentials across food, beauty, and home",
  "Easy returns on eligible products",
];

export function PromoModalDesktop({ copyLabel, hasCopied, onClose, onCopy }: PromoModalDesktopProps) {
  return (
    <div className="hidden w-full max-w-[520px] overflow-hidden rounded-[24px] bg-white shadow-[0_32px_90px_rgba(15,23,42,0.3)] md:block">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffd3ea_0%,#ffe9f5_32%,#fef7fb_100%)] px-7 pb-4 pt-6">
        <button
          aria-label="Dismiss promotion"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/35 text-white transition hover:bg-white/50"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="text-3xl leading-none">x</span>
        </button>

        <div className="relative mx-auto flex max-w-[360px] items-end justify-center gap-4">
          <div className="h-24 w-24 rounded-[24px] bg-[#d8ef69] opacity-85" />
          <div className="absolute left-10 top-14 h-16 w-20 rounded-[18px] bg-[#ffb2cf]" />
          <div className="absolute right-10 top-16 h-20 w-20 rounded-[20px] bg-[#ffcb85]" />
          <div className="relative z-10 rounded-[24px] bg-white px-10 py-6 shadow-[0_18px_48px_rgba(255,43,23,0.14)]">
            <p className="text-center text-5xl font-black leading-none text-[#ef1b13]">10%</p>
            <p className="mt-2 text-center text-xl font-black uppercase tracking-tight text-[#ef1b13]">Off</p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 text-center">
        <h2 className="text-[2.35rem] font-black leading-none tracking-[-0.04em] text-neutral-950">Welcome to FoodOnlines</h2>
        <p className="mt-3 text-[1.35rem] font-bold text-neutral-900">Get 10% Off Your First Order</p>
        <p className="mt-3 text-base font-semibold text-neutral-600">
          Code: <span className="font-black text-neutral-950">WELCOME</span>
        </p>

        <div className="mt-6 rounded-[22px] bg-neutral-50 p-5 text-left">
          <ul className="grid gap-3 text-[0.98rem] font-semibold text-neutral-800">
            {desktopBenefitItems.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ef1b13] text-sm font-black text-white">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex min-h-13 items-center justify-center rounded-[18px] bg-[#ef1b13] px-6 text-base font-black text-white transition hover:bg-[#d71811]"
            onClick={onCopy}
            type="button"
          >
            {copyLabel}
          </button>
          <button
            className="inline-flex min-h-13 items-center justify-center rounded-[18px] border border-neutral-200 bg-white px-6 text-base font-bold text-neutral-900 transition hover:bg-neutral-50"
            onClick={hasCopied ? onClose : onCopy}
            type="button"
          >
            {hasCopied ? "Got it!" : "Copy Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
