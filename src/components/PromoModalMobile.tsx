type PromoModalMobileProps = {
  copyLabel: string;
  onClose: () => void;
  onCopy: () => void;
  onLater: () => void;
};

const mobileBenefitItems = [
  "No.1 Online Asian Marketplace",
  "One-Stop Shop for Asian Food, Beauty, and Home Goods",
  "500,000+ Asian Goods, 9,000+ Asian Brands",
  "5 Star App Store Rating! Millions of User Reviews",
];

function MobileBenefitIcon({ index }: { index: number }) {
  return (
    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-lg font-black text-[#ef1b13]">
      {index === 0 ? "★" : index === 1 ? "🛒" : index === 2 ? "▣" : "👍"}
    </span>
  );
}

export function PromoModalMobile({ copyLabel, onClose, onCopy, onLater }: PromoModalMobileProps) {
  return (
    <div className="w-full overflow-hidden rounded-t-[28px] bg-white shadow-[0_-24px_64px_rgba(15,23,42,0.2)] md:hidden">
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffd4ea_0%,#ffe5f3_40%,#fff5fb_100%)] px-5 pb-0 pt-5">
        <button
          aria-label="Dismiss promotion"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/20"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true" className="text-3xl leading-none">×</span>
        </button>

        <div className="relative flex min-h-[210px] items-end justify-center pb-6">
          <div className="absolute left-0 bottom-0 h-24 w-24 rounded-tr-[20px] bg-[#d7ea65]" />
          <div className="absolute left-20 bottom-0 h-20 w-24 rounded-tl-[14px] rounded-tr-[14px] bg-[#ffb0c8]" />
          <div className="absolute right-0 bottom-0 h-24 w-28 rounded-tl-[24px] bg-[#ffc37f]" />
          <div className="relative z-10 rounded-[24px] bg-white px-10 py-6 shadow-[0_18px_40px_rgba(255,43,23,0.14)]">
            <p className="text-center text-6xl font-black leading-none text-[#ef1b13]">10%</p>
            <p className="mt-2 text-center text-2xl font-black uppercase tracking-tight text-[#ef1b13]">Off</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-7 pt-6 text-center">
        <h2 className="text-[2.3rem] font-black leading-tight tracking-[-0.04em] text-neutral-950">Welcome to FoodOnlines</h2>
        <p className="mt-4 text-[1.15rem] font-bold leading-8 text-neutral-900">Get 10% Off Your First Order!</p>

        <div className="mt-6 rounded-[22px] bg-neutral-50 p-5 text-left">
          <ul className="grid gap-5 text-[1.02rem] font-semibold leading-7 text-neutral-900">
            {mobileBenefitItems.map((item, index) => (
              <li className="flex items-start gap-4" key={item}>
                <MobileBenefitIcon index={index} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 grid gap-4">
          <button
            className="inline-flex min-h-16 items-center justify-center rounded-[20px] bg-[#ef1b13] px-6 text-xl font-black text-white transition hover:bg-[#d71811]"
            onClick={onCopy}
            type="button"
          >
            {copyLabel}
          </button>
          <button
            className="inline-flex min-h-16 items-center justify-center rounded-[20px] border border-neutral-200 bg-white px-6 text-xl font-bold text-neutral-900 transition hover:bg-neutral-50"
            onClick={onLater}
            type="button"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
