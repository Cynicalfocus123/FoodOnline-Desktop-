import { shortcutItems } from "../data/home";
import { MockIcon } from "./MockIcon";

export function ShortcutRow() {
  return (
    <section className="mt-0 border-b border-neutral-200 bg-white pb-3 pt-2 sm:pb-4 sm:pt-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none lg:justify-between">
          {shortcutItems.map((item) => (
            <a
              className="flex min-w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-1 text-center text-[13px] font-medium leading-4 text-neutral-800 transition hover:bg-neutral-50 hover:text-neutral-950 sm:min-w-[102px] sm:text-sm"
              href={item.href}
              key={item.label}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
                <MockIcon className="h-5 w-5" name={item.icon} />
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
