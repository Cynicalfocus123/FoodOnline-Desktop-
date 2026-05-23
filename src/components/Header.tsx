import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { assets, languageOptions, navItems, zipCodeExample } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

function LocationMarker() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-neutral-700"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-neutral-700"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.7 4 5.6 4 8.5s-1.4 5.8-4 8.5c-2.6-2.7-4-5.6-4-8.5s1.4-5.8 4-8.5Z" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-neutral-500 transition ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function Header() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const openLogin = useHomeStore((state) => state.openLogin);
  const siteView = useHomeStore((state) => state.siteView);
  const backToHome = useHomeStore((state) => state.backToHome);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const logoutUser = usePublicAuthStore((state) => state.logoutUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isZipPanelOpen, setIsZipPanelOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(languageOptions[0].code);
  const [zipCode, setZipCode] = useState(zipCodeExample);
  const [draftZipCode, setDraftZipCode] = useState(zipCodeExample);
  const languageMenuReference = useRef<HTMLDivElement | null>(null);

  const selectedLanguage = useMemo(
    () => languageOptions.find((language) => language.code === selectedLanguageCode) ?? languageOptions[0],
    [selectedLanguageCode],
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [siteView]);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      if (languageMenuReference.current?.contains(event.target as Node)) {
        return;
      }

      setIsLanguageMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isLanguageMenuOpen]);

  useEffect(() => {
    if (!isZipPanelOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isZipPanelOpen]);

  function handleSignupClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    openSignup();
  }

  function handleLoginClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    openLogin();
  }

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    setIsMobileMenuOpen(false);

    if (siteView !== "home") {
      event.preventDefault();
      backToHome();
    }
  }

  function handleAccountClick() {
    setIsMobileMenuOpen(false);

    if (siteView !== "home") {
      backToHome();
      window.setTimeout(() => {
        document.getElementById("account-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 30);
      return;
    }

    document.getElementById("account-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleMenuToggle() {
    setIsMobileMenuOpen((currentValue) => !currentValue);
  }

  function openZipPanel() {
    setDraftZipCode(zipCode);
    setIsZipPanelOpen(true);
  }

  function closeZipPanel() {
    setIsZipPanelOpen(false);
  }

  function saveZipCode() {
    setZipCode(draftZipCode.trim() || zipCodeExample);
    setIsZipPanelOpen(false);
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-200 bg-white/95 shadow-sm shadow-neutral-950/5 backdrop-blur-xl">
        <div className="border-b border-neutral-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              className="inline-flex min-w-0 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition hover:border-neutral-300 hover:bg-neutral-100"
              onClick={openZipPanel}
              type="button"
            >
              <LocationMarker />
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Deliver to
                </span>
                <span className="block truncate text-sm font-semibold text-neutral-900">{zipCode}</span>
              </span>
            </button>

            <div className="relative" ref={languageMenuReference}>
              <button
                aria-expanded={isLanguageMenuOpen}
                aria-label="Select language"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
                onClick={() => setIsLanguageMenuOpen((currentValue) => !currentValue)}
                type="button"
              >
                <GlobeIcon />
                <span className="max-w-[72px] truncate sm:max-w-none">{selectedLanguage.shortLabel}</span>
                <ChevronIcon isOpen={isLanguageMenuOpen} />
              </button>

              {isLanguageMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] rounded-3xl border border-neutral-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                  {languageOptions.map((language) => {
                    const isSelected = language.code === selectedLanguageCode;

                    return (
                      <button
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                        dir={language.dir}
                        key={language.code}
                        lang={language.lang}
                        onClick={() => {
                          setSelectedLanguageCode(language.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? "border-leaf-500" : "border-neutral-300"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${isSelected ? "bg-leaf-500" : "bg-transparent"}`}
                          />
                        </span>
                        <span className="flex-1">{language.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
          <a className="flex items-center" href="#home" aria-label="FoodOnlines home" onClick={handleHomeClick}>
            <img
              alt="FoodOnlines logo"
              className="block h-12 w-auto max-w-[180px] object-contain sm:h-14 sm:max-w-[220px]"
              src={assets.logo}
            />
          </a>

          <nav className="hidden items-center justify-center gap-8 text-sm font-semibold text-neutral-700 lg:flex">
            {navItems.map((item) => (
              <a
                className="transition hover:text-citrus-500"
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
                onClick={(event) => {
                  if (item === "Home" && siteView !== "home") {
                    event.preventDefault();
                    backToHome();
                  }

                  setIsMobileMenuOpen(false);
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:justify-self-end">
            {siteView !== "home" ? (
              <button
                className="hidden min-h-11 rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:inline-flex lg:items-center"
                onClick={backToHome}
                type="button"
              >
                Home
              </button>
            ) : null}
            {currentUser ? (
              <>
                <button
                  className="hidden min-h-11 rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-leaf-500 hover:text-leaf-700 lg:inline-flex lg:items-center"
                  onClick={handleAccountClick}
                  type="button"
                >
                  My Account
                </button>
                <button
                  className="hidden min-h-11 items-center rounded-full bg-citrus-500 px-4 text-sm font-black text-white transition hover:bg-citrus-600 lg:inline-flex"
                  onClick={() => void logoutUser()}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  className="hidden min-h-11 items-center rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-leaf-500 hover:text-leaf-700 lg:flex"
                  href="#login"
                  onClick={handleLoginClick}
                >
                  Login
                </a>
                <a
                  className="hidden min-h-11 items-center rounded-full bg-citrus-500 px-4 text-sm font-black text-white transition hover:bg-citrus-600 lg:flex"
                  href="#signup"
                  onClick={handleSignupClick}
                >
                  Register
                </a>
              </>
            )}

            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:hidden"
              onClick={handleMenuToggle}
              type="button"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 rounded-full bg-current transition ${
                    isMobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 rounded-full bg-current transition ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 rounded-full bg-current transition ${
                    isMobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            className="border-t border-neutral-100 bg-white px-4 pb-5 pt-3 shadow-lg shadow-neutral-950/5 lg:hidden"
            id="mobile-navigation"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <a
                  className="rounded-2xl px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 hover:text-citrus-500"
                  href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                  key={item}
                  onClick={(event) => {
                    if (item === "Home" && siteView !== "home") {
                      event.preventDefault();
                      backToHome();
                    }

                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item}
                </a>
              ))}

              <button
                className="mt-2 flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openZipPanel();
                }}
                type="button"
              >
                Change ZIP Code
              </button>

              {currentUser ? (
                <>
                  <button
                    className="flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-leaf-500 hover:text-leaf-700"
                    onClick={handleAccountClick}
                    type="button"
                  >
                    My Account
                  </button>
                  <button
                    className="flex min-h-12 items-center justify-center rounded-2xl bg-citrus-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
                    onClick={() => void logoutUser()}
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    className="flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-leaf-500 hover:text-leaf-700"
                    href="#login"
                    onClick={handleLoginClick}
                  >
                    Login
                  </a>
                  <a
                    className="flex min-h-12 items-center justify-center rounded-2xl bg-citrus-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
                    href="#signup"
                    onClick={handleSignupClick}
                  >
                    Register
                  </a>
                </>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <div
        className={`fixed inset-0 z-50 transition ${isZipPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isZipPanelOpen}
      >
        <button
          aria-label="Close ZIP code panel"
          className={`absolute inset-0 bg-neutral-950/35 transition-opacity duration-300 ${
            isZipPanelOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeZipPanel}
          type="button"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white px-6 pb-8 pt-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out sm:px-8 ${
            isZipPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="zip-panel-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-neutral-950" id="zip-panel-title">
                Change Your Zip Code
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                Inventory information and delivery speeds may vary for different locations.
              </p>
            </div>

            <button
              aria-label="Close ZIP code panel"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              onClick={closeZipPanel}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>

          <label className="mt-10 grid gap-3" htmlFor="zip-code-input">
            <span className="text-sm font-semibold text-neutral-700">United States / Canada ZIP Code*</span>
            <input
              className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-citrus-500 focus:ring-citrus-500/15"
              id="zip-code-input"
              inputMode="numeric"
              maxLength={10}
              onChange={(event) => setDraftZipCode(event.target.value)}
              placeholder={zipCodeExample}
              type="text"
              value={draftZipCode}
            />
          </label>

          <button
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#e43d30] px-6 text-base font-bold text-white transition hover:bg-[#c63529]"
            onClick={saveZipCode}
            type="button"
          >
            Save
          </button>
        </aside>
      </div>
    </>
  );
}
