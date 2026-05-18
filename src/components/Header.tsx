import { assets, navItems } from "../data/home";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-100 bg-white/95 shadow-sm shadow-neutral-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a className="flex items-center" href="#home" aria-label="FoodOnlines home">
          <img
            className="h-16 w-auto object-contain"
            src={assets.logo}
            alt="FoodOnlines logo"
          />
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
