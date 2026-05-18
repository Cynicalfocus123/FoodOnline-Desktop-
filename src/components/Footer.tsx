import { footerLinkRows } from "../data/home";
import { useAdminStore } from "../store/adminStore";

export function Footer() {
  const openAdminLogin = useAdminStore((state) => state.openAdminLogin);

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
        <button
          className="min-h-12 rounded-full border border-[#112017] px-6 text-xs font-black uppercase tracking-[0.16em] text-[#112017] transition hover:bg-[#112017] hover:text-white"
          onClick={openAdminLogin}
          type="button"
        >
          Test Admin Dashboard Feature
        </button>
        <p className="max-w-2xl text-xs font-semibold leading-6 text-neutral-500">
          Admin link is mock testing entry for dashboard and feature flow. Real secure backend still planned for
          Laravel PHP + MySQL phase.
        </p>
        <p className="pt-2 text-xs font-semibold text-neutral-400">
          Copyright foodonlines.com 2002 to 2026
        </p>
      </div>
    </footer>
  );
}
