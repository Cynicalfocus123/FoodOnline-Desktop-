import { assets, footerColumns, footerContactItems, footerDescription } from "../data/home";
import { useHomeStore } from "../store/homeStore";

function FooterIcon({ type }: { type: "email" }) {
  const commonProps = {
    className: "h-5 w-5 shrink-0 text-emerald-500",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  return (
    <svg {...commonProps}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m5.5 8 6.5 5 6.5-5" />
    </svg>
  );
}

export function Footer() {
  const openAboutUs = useHomeStore((state) => state.openAboutUs);
  const openBecomeVendor = useHomeStore((state) => state.openBecomeVendor);
  const openBecomePartner = useHomeStore((state) => state.openBecomePartner);
  const openBecomeSponsor = useHomeStore((state) => state.openBecomeSponsor);
  const openAffiliate = useHomeStore((state) => state.openAffiliate);
  const openDrivers = useHomeStore((state) => state.openDrivers);
  const openWholesaler = useHomeStore((state) => state.openWholesaler);
  const openContactUs = useHomeStore((state) => state.openContactUs);
  const openReturnPolicy = useHomeStore((state) => state.openReturnPolicy);
  const openTermsOfUse = useHomeStore((state) => state.openTermsOfUse);
  const openPrivacyPolicy = useHomeStore((state) => state.openPrivacyPolicy);
  const openFaq = useHomeStore((state) => state.openFaq);

  return (
    <footer id="company" className="border-t border-neutral-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] lg:gap-12">
          <div className="max-w-[360px]">
            <a aria-label="FoodOnlines home" className="inline-flex items-center" href="#home">
              <img
                alt="FoodOnlines logo"
                className="h-10 w-auto max-w-[140px] object-contain sm:h-12"
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
                  const isContactUsLink = href === "/contact-us";
                  const isBecomeVendorLink = href === "/become-vendor";
                  const isBecomePartnerLink = href === "/become-partner";
                  const isBecomeSponsorLink = href === "/become-a-sponsor";
                  const isAffiliateLink = href === "/affiliate";
                  const isDriverLink = href === "/company/drivers";
                  const isWholesalerLink = href === "/wholesaler";
                  const isReturnPolicyLink = href === "/return-policy";
                  const isTermsOfUseLink = href === "/terms-and-conditions";
                  const isPrivacyPolicyLink = href === "/privacy-policy";
                  const isFaqLink = href === "/faq";

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
                          : isPrivacyPolicyLink
                          ? (event) => {
                              event.preventDefault();
                              openPrivacyPolicy();
                            }
                          : isContactUsLink
                          ? (event) => {
                              event.preventDefault();
                              openContactUs();
                            }
                          : isBecomeVendorLink
                          ? (event) => {
                              event.preventDefault();
                              openBecomeVendor();
                            }
                          : isBecomePartnerLink
                          ? (event) => {
                              event.preventDefault();
                              openBecomePartner();
                            }
                          : isBecomeSponsorLink
                          ? (event) => {
                              event.preventDefault();
                              openBecomeSponsor();
                            }
                          : isAffiliateLink
                          ? (event) => {
                              event.preventDefault();
                              openAffiliate();
                            }
                          : isDriverLink
                          ? (event) => {
                              event.preventDefault();
                              openDrivers();
                            }
                          : isWholesalerLink
                          ? (event) => {
                              event.preventDefault();
                              openWholesaler();
                            }
                          : isReturnPolicyLink
                          ? (event) => {
                              event.preventDefault();
                              openReturnPolicy();
                            }
                          : isTermsOfUseLink
                          ? (event) => {
                              event.preventDefault();
                              openTermsOfUse();
                            }
                          : isFaqLink
                          ? (event) => {
                              event.preventDefault();
                              openFaq();
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
