import { assets, footerColumns, footerContactItems, footerDescription } from "../data/home";
import { useHomeStore } from "../store/homeStore";

function FooterIcon({ type }: { type: "location" | "phone" | "email" | "hours" }) {
  const commonProps = {
    className: "h-5 w-5 shrink-0 text-emerald-500",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (type) {
    case "location":
      return (
        <svg {...commonProps}>
          <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    case "phone":
      return (
        <svg {...commonProps}>
          <path d="M6.5 4.5h3l1 4-2.1 1.7a13.2 13.2 0 0 0 5.4 5.4l1.7-2.1 4 1v3c0 .8-.7 1.5-1.5 1.5A14.5 14.5 0 0 1 4.5 6c0-.8.7-1.5 1.5-1.5Z" />
        </svg>
      );
    case "email":
      return (
        <svg {...commonProps}>
          <path d="M4 6.5h16v11H4z" />
          <path d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      );
    case "hours":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const openAboutUs = useHomeStore((state) => state.openAboutUs);
  const openDrivers = useHomeStore((state) => state.openDrivers);

  return (
    <footer id="company" className="border-t border-neutral-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] lg:gap-12">
          <div className="max-w-[360px]">
            <a aria-label="FoodOnlines home" className="inline-flex items-center" href="#home">
              <img
                alt="FoodOnlines logo"
                className="h-24 w-auto max-w-[320px] object-contain sm:h-28"
                src={assets.logo}
              />
            </a>

            <p className="mt-5 text-[19px] leading-8 text-neutral-800">{footerDescription}</p>

            <div className="mt-10 space-y-4 text-[15px] leading-8 text-neutral-800 sm:text-[16px]">
              {footerContactItems.map((item) => (
                <div className="flex items-start gap-3" key={item.label}>
                  <FooterIcon type={item.type} />
                  <p>
                    <span className="font-bold text-neutral-900">{item.label}</span> {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[30px] font-bold tracking-[-0.03em] text-slate-800">{column.title}</h2>
              <nav className="mt-7 flex flex-col gap-5 text-[16px] text-slate-800 sm:text-[17px]">
                {column.links.map((link) => {
                  const label = typeof link === "string" ? link : link.label;
                  const href = typeof link === "string" ? "#company" : link.href;
                  const isAboutUsLink = href === "/about-us";
                  const isDriverLink = href === "/company/drivers";

                  return (
                    <a
                      className="transition hover:text-citrus-500"
                      href={href}
                      key={label}
                      onClick={
                        isAboutUsLink
                          ? (event) => {
                              event.preventDefault();
                              openAboutUs();
                            }
                          : isDriverLink
                          ? (event) => {
                              event.preventDefault();
                              openDrivers();
                            }
                          : undefined
                      }
                    >
                      {label}
                    </a>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-neutral-100 pt-6 text-sm text-neutral-500">
          Copyright foodonlines.com 2002 to 2026
        </p>
      </div>
    </footer>
  );
}
