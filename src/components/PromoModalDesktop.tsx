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
    <div className="hidden max-h-[calc(100dvh_-_32px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] w-full max-w-[460px] overflow-y-auto rounded-[22px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] md:block lg:max-w-[500px]">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffd3ea_0%,#ffe9f5_32%,#fef7fb_100%)] px-6 pb-3 pt-5">
        <button
          aria-label="Dismiss promotion"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/35 text-white transition hover:bg-white/50"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="text-2xl leading-none">x</span>
        </button>

        <div className="relative mx-auto flex max-w-[320px] items-end justify-center gap-3">
          <div className="h-20 w-20 rounded-[22px] bg-[#d8ef69] opacity-85" />
          <div className="absolute left-9 top-12 h-14 w-16 rounded-[16px] bg-[#ffb2cf]" />
          <div className="absolute right-9 top-14 h-16 w-16 rounded-[18px] bg-[#ffcb85]" />
          <div className="relative z-10 rounded-[22px] bg-white px-8 py-5 shadow-[0_16px_34px_rgba(255,43,23,0.12)]">
            <p className="text-center text-4xl font-black leading-none text-[#ef1b13]">10%</p>
            <p className="mt-1 text-center text-lg font-black uppercase tracking-tight text-[#ef1b13]">Off</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-5 text-center">
        <h2 className="text-[2rem] font-black leading-none tracking-[-0.04em] text-neutral-950 lg:text-[2.2rem]">Welcome to FoodOnlines</h2>
        <p className="mt-3 text-[1.12rem] font-bold text-neutral-900 lg:text-[1.22rem]">Get 10% Off Your First Order</p>
        <p className="mt-2 text-[15px] font-semibold text-neutral-600">
          Code: <span className="font-black text-neutral-950">WELCOME</span>
        </p>

        <div className="mt-5 rounded-[20px] bg-neutral-50 p-4 text-left">
          <ul className="grid gap-3 text-[0.92rem] font-semibold text-neutral-800 lg:text-[0.96rem]">
            {desktopBenefitItems.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ef1b13] text-xs font-black text-white">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-[#ef1b13] px-6 text-base font-black text-white transition hover:bg-[#d71811]"
            onClick={hasCopied ? onClose : onCopy}
            type="button"
          >
            {hasCopied ? "Code Copied" : copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
