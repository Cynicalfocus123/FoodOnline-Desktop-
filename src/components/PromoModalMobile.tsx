type PromoModalMobileProps = {
  copyLabel: string;
  hasCopied: boolean;
  onClose: () => void;
  onCopy: () => void;
};

const mobileBenefitItems = [
  "No.1 Online Asian Marketplace",
  "One-Stop Shop for Asian Food, Beauty, and Home Goods",
  "500,000+ Asian Goods, 9,000+ Asian Brands",
  "5 Star App Store Rating! Millions of User Reviews",
];

function MobileBenefitIcon({ index }: { index: number }) {
  const labels = ["A", "B", "C", "D"];

  return (
    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-red-50 text-xs font-black text-[#ef1b13]">
      {labels[index]}
    </span>
  );
}

export function PromoModalMobile({ copyLabel, hasCopied, onClose, onCopy }: PromoModalMobileProps) {
  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.26)] md:hidden">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffd4ea_0%,#ffe5f3_40%,#fff5fb_100%)] px-4 pb-0 pt-4">
        <button
          aria-label="Dismiss promotion"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/20"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="text-2xl leading-none">x</span>
        </button>

        <div className="relative flex min-h-[158px] items-end justify-center pb-4">
          <div className="absolute left-0 bottom-0 h-20 w-20 rounded-tr-[18px] bg-[#d7ea65]" />
          <div className="absolute left-16 bottom-0 h-16 w-20 rounded-tl-[12px] rounded-tr-[12px] bg-[#ffb0c8]" />
          <div className="absolute right-0 bottom-0 h-20 w-24 rounded-tl-[20px] bg-[#ffc37f]" />
          <div className="relative z-10 rounded-[22px] bg-white px-8 py-5 shadow-[0_16px_34px_rgba(255,43,23,0.12)]">
            <p className="text-center text-5xl font-black leading-none text-[#ef1b13]">10%</p>
            <p className="mt-1 text-center text-xl font-black uppercase tracking-tight text-[#ef1b13]">Off</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-5 pt-5 text-center">
        <h2 className="text-[1.9rem] font-black leading-tight tracking-[-0.04em] text-neutral-950">Welcome to FoodOnlines</h2>
        <p className="mt-3 text-[1rem] font-bold leading-7 text-neutral-900">Get 10% Off Your First Order!</p>
        <p className="mt-2 text-[15px] font-semibold text-neutral-600">
          Code: <span className="font-black text-neutral-950">WELCOME</span>
        </p>

        <div className="mt-5 rounded-[20px] bg-neutral-50 p-4 text-left">
          <ul className="grid gap-4 text-[0.92rem] font-semibold leading-6 text-neutral-900">
            {mobileBenefitItems.map((item, index) => (
              <li className="flex items-start gap-3" key={item}>
                <MobileBenefitIcon index={index} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <button
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[18px] bg-[#ef1b13] px-6 text-lg font-black text-white transition hover:bg-[#d71811]"
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
