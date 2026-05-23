type PromoStickyBarProps = {
  onOpen: () => void;
};

function TicketVisual() {
  return (
    <div className="relative flex h-14 w-20 shrink-0 items-end justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#fff4ef] via-[#fff6d5] to-[#ffe8fb]">
      <span className="absolute left-[-7px] top-5 h-4 w-4 rounded-full bg-white/90" />
      <span className="absolute right-[-7px] top-5 h-4 w-4 rounded-full bg-white/90" />
      <span className="absolute left-3 top-2 -rotate-6 rounded-lg bg-[#ff2b17] px-2 py-1 text-[10px] font-black text-white shadow-sm">
        10%
      </span>
      <div className="absolute bottom-0 h-4 w-full bg-white/65" />
      <div className="absolute bottom-1 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-[#ff5d52] bg-[#fff7f6]" />
      <div className="absolute bottom-3 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-full bg-[#ff5d52]" />
    </div>
  );
}

export function PromoStickyBar({ onOpen }: PromoStickyBarProps) {
  return (
    <button
      aria-label="Open welcome promotion"
      className="fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-24px)] max-w-[640px] -translate-x-1/2 items-center gap-3 rounded-[22px] border border-white/10 bg-neutral-900/88 px-3 py-3 text-left shadow-[0_18px_48px_rgba(15,23,42,0.28)] backdrop-blur-xl transition hover:bg-neutral-900/94 sm:bottom-6 sm:w-[calc(100%-48px)] sm:gap-5 sm:px-5"
      onClick={onOpen}
      type="button"
    >
      <TicketVisual />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-xs">Welcome offer</p>
        <p className="mt-1 text-sm font-semibold text-white sm:text-[1.15rem]">
          Use code: <span className="font-black">WELCOME</span> for 10% off!
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold text-white underline underline-offset-4 sm:text-base">Copy Code</span>
    </button>
  );
}
