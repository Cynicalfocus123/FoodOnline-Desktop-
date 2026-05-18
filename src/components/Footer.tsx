import { footerLinkRows } from "../data/home";

export function Footer() {
  return (
    <footer id="company" className="border-t border-neutral-100 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        {footerLinkRows.map((row) => (
          <nav
            className="flex flex-col items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2"
            key={row.join("-")}
          >
            {row.map((link) => (
              <a className="transition hover:text-citrus-500" href="#company" key={link}>
                {link}
              </a>
            ))}
          </nav>
        ))}
        <p className="pt-2 text-xs font-semibold text-neutral-400">
          Copyright foodonlines.com 2002 to 2026
        </p>
      </div>
    </footer>
  );
}
