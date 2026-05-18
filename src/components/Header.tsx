import { navItems } from "../data/home";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/20 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a className="flex items-center gap-3" href="#home" aria-label="FoodOnlines home">
          <img
            className="h-14 w-14 rounded-md object-contain"
            src="/assets/app-install-icon.png"
            alt="FoodOnlines logo"
          />
          <span className="text-2xl font-black tracking-normal text-ink">
            <span className="text-leaf-600">Food</span>
            <span className="text-citrus-500">Onlines</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-neutral-700 lg:flex">
          {navItems.map((item) => (
            <a className="transition hover:text-citrus-500" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            className="hidden h-11 items-center rounded-md border border-neutral-200 px-5 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 sm:flex"
            href="#splash"
          >
            Sign up
          </a>
          <a
            className="rounded-md bg-citrus-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
            href="#best-deals"
          >
            Shop now
          </a>
        </div>
      </div>
    </header>
  );
}
