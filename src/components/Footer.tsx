import { footerLinkRows } from "../data/home";

export function Footer() {
  return (
    <footer id="company" className="border-t border-neutral-100 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
        {footerLinkRows.map((row) => (
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500" key={row.join("-")}>
            {row.map((link) => (
              <a className="transition hover:text-citrus-500" href="#company" key={link}>
                {link}
              </a>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
