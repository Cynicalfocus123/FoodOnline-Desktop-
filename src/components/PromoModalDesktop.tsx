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
    <div className="hidden w-full max-w-[600px] overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.34)] md:block">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffd3ea_0%,#ffe9f5_32%,#fef7fb_100%)] px-8 pb-5 pt-7">
        <button
          aria-label="Dismiss promotion"
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/35 text-white transition hover:bg-white/50"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="text-3xl leading-none">×</span>
        </button>

        <div className="relative mx-auto flex max-w-[420px] items-end justify-center gap-4">
          <div className="h-28 w-28 rounded-[26px] bg-[#d8ef69] opacity-85" />
          <div className="absolute left-12 top-16 h-20 w-24 rounded-[20px] bg-[#ffb2cf]" />
          <div className="absolute right-12 top-20 h-24 w-24 rounded-[24px] bg-[#ffcb85]" />
          <div className="relative z-10 rounded-[26px] bg-white px-12 py-7 shadow-[0_18px_48px_rgba(255,43,23,0.14)]">
            <p className="text-center text-6xl font-black leading-none text-[#ef1b13]">10%</p>
            <p className="mt-2 text-center text-2xl font-black uppercase tracking-tight text-[#ef1b13]">Off</p>
          </div>
        </div>
      </div>

      <div className="px-10 pb-10 pt-7 text-center">
        <h2 className="text-[3rem] font-black leading-none tracking-[-0.04em] text-neutral-950">Welcome to FoodOnlines</h2>
        <p className="mt-4 text-[1.65rem] font-bold text-neutral-900">Get 10% Off Your First Order</p>
        <p className="mt-4 text-lg font-semibold text-neutral-600">
          Code: <span className="font-black text-neutral-950">WELCOME</span>
        </p>

        <div className="mt-7 rounded-[24px] bg-neutral-50 p-6 text-left">
          <ul className="grid gap-4 text-[1.05rem] font-semibold text-neutral-800">
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

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex min-h-14 items-center justify-center rounded-[20px] bg-[#ef1b13] px-6 text-lg font-black text-white transition hover:bg-[#d71811]"
            onClick={onCopy}
            type="button"
          >
            {copyLabel}
          </button>
          <button
            className="inline-flex min-h-14 items-center justify-center rounded-[20px] border border-neutral-200 bg-white px-6 text-lg font-bold text-neutral-900 transition hover:bg-neutral-50"
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
