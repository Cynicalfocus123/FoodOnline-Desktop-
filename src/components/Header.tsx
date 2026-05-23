import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
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
      className="h-5 w-5 shrink-0 text-neutral-800"
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

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-neutral-800"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.4-3.1 4-4.7 7-4.7s5.6 1.6 7 4.7" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-neutral-800"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M3.5 4.5h2.2l1.8 8.6a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1l1.2-5.7H7.1" />
      <path d="M8.8 16.5h10.1" />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5 text-neutral-500" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-neutral-500"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M5 7.5h3l1.3-2h5.4l1.3 2h3a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13.2" r="3.4" />
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

function MenuChevron() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-neutral-500"
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
  const [searchTerm, setSearchTerm] = useState("");
  const languageMenuReference = useRef<HTMLElement | null>(null);

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

  function handleNavClick(itemLabel: string, event: MouseEvent<HTMLAnchorElement>) {
    if (itemLabel === "Home" && siteView !== "home") {
      event.preventDefault();
      backToHome();
    }

    setIsMobileMenuOpen(false);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.info("FoodOnline mock search", searchTerm.trim());
  }

  const languageDropdown = isLanguageMenuOpen ? (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[1100] w-[240px] rounded-3xl border border-neutral-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
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
              <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-leaf-500" : "bg-transparent"}`} />
            </span>
            <span className="flex-1">{language.label}</span>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-[1000] isolate border-b border-neutral-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
        ref={languageMenuReference}
      >
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 lg:py-3">
          <div className="flex min-h-[56px] items-center justify-between gap-2 lg:min-h-[64px] lg:gap-4">
            <div className="flex min-w-0 items-center gap-2 lg:flex-1 lg:gap-4">
            <a className="flex shrink-0 items-center" href="#home" aria-label="FoodOnlines home" onClick={handleHomeClick}>
              <img
                alt="FoodOnlines logo"
                className="block h-10 w-auto max-w-[100px] object-contain min-[390px]:max-w-[128px] sm:h-12 sm:max-w-[180px] lg:max-w-[190px]"
                src={assets.logo}
              />
            </a>

            <button
              className="hidden shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-bold text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:text-leaf-600 lg:inline-flex"
              onClick={openZipPanel}
              type="button"
            >
              <LocationMarker />
              <span>{zipCode}</span>
            </button>

            <nav className="hidden min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap text-[14px] font-semibold text-neutral-800 scrollbar-none lg:flex xl:gap-6 xl:text-[15px]">
              {navItems.map((item) => (
                <a
                  className={`inline-flex items-center gap-1.5 transition hover:text-leaf-600 ${
                    item.accent === "leaf" ? "text-leaf-500" : "text-neutral-800"
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={(event) => handleNavClick(item.label, event)}
                >
                  <span>{item.label}</span>
                  {item.hasChevron ? <MenuChevron /> : null}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {currentUser ? (
              <button
                className="inline-flex min-h-11 items-center gap-2 px-1 text-[15px] font-semibold text-neutral-900 transition hover:text-leaf-600"
                onClick={handleAccountClick}
                type="button"
              >
                <UserIcon />
                <span>My Account</span>
              </button>
            ) : (
              <a
                className="inline-flex min-h-11 items-center gap-2 px-1 text-[15px] font-semibold text-neutral-900 transition hover:text-leaf-600"
                href="#login"
                onClick={handleLoginClick}
              >
                <UserIcon />
                <span>Login / Register</span>
              </a>
            )}

            <div className="relative">
              <button
                aria-expanded={isLanguageMenuOpen}
                aria-label="Select language"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
                onClick={() => setIsLanguageMenuOpen((currentValue) => !currentValue)}
                type="button"
              >
                <GlobeIcon />
                <span>{selectedLanguage.shortLabel}</span>
                <ChevronIcon isOpen={isLanguageMenuOpen} />
              </button>

              {languageDropdown}
            </div>

            <button
              className="inline-flex h-11 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
              onClick={() => document.getElementById("best-deals")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              type="button"
            >
              <CartIcon />
            </button>

            {currentUser ? (
              <button
                className="inline-flex min-h-12 items-center rounded-full bg-citrus-500 px-4 text-sm font-black text-white transition hover:bg-citrus-600"
                onClick={() => void logoutUser()}
                type="button"
              >
                Logout
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 text-sm font-bold text-neutral-900 shadow-sm min-[390px]:gap-1.5"
              onClick={openZipPanel}
              type="button"
            >
              <LocationMarker />
              <span>{zipCode}</span>
            </button>

            <div className="relative hidden sm:block">
              <button
                aria-expanded={isLanguageMenuOpen}
                aria-label="Select language"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-900"
                onClick={() => setIsLanguageMenuOpen((currentValue) => !currentValue)}
                type="button"
              >
                <GlobeIcon />
                <span>{selectedLanguage.shortLabel}</span>
                <ChevronIcon isOpen={isLanguageMenuOpen} />
              </button>
              {languageDropdown}
            </div>

            {!currentUser ? (
              <a
                className="hidden h-10 shrink-0 items-center text-xs font-bold text-neutral-900 transition hover:text-leaf-600 min-[560px]:inline-flex"
                href="#login"
                onClick={handleLoginClick}
              >
                Login / Register
              </a>
            ) : null}

            <button
              aria-label="View cart"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
              onClick={() => document.getElementById("best-deals")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              type="button"
            >
              <CartIcon />
            </button>

            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500"
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

          <form
            className="mx-auto flex min-h-12 w-full max-w-4xl items-center gap-2 rounded-full border-2 border-neutral-900/80 bg-neutral-50 px-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition focus-within:border-leaf-500 focus-within:bg-white focus-within:shadow-[0_12px_34px_rgba(15,23,42,0.1)] sm:min-h-14 sm:px-5 lg:mt-1"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <SearchIcon />
            <input
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:text-neutral-500 sm:text-base"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search groceries, snacks, drinks and more"
              type="search"
              value={searchTerm}
            />
            <button
              aria-label="Search by image"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-200 sm:inline-flex"
              type="button"
            >
              <CameraIcon />
            </button>
            <button
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 sm:h-10 sm:w-auto sm:px-5 sm:text-sm sm:font-black"
              type="submit"
            >
              <SearchIcon className="h-4 w-4 text-white sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {isMobileMenuOpen ? (
          <div
            className="border-t border-neutral-100 bg-white px-4 pb-5 pt-3 shadow-lg shadow-neutral-950/5 lg:hidden"
            id="mobile-navigation"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <a
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-leaf-600"
                  href={item.href}
                  key={item.label}
                  onClick={(event) => handleNavClick(item.label, event)}
                >
                  {item.label}
                </a>
              ))}

              {!currentUser ? (
                <a
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-leaf-600"
                  href="#login"
                  onClick={handleLoginClick}
                >
                  Login / Register
                </a>
              ) : (
                <button
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 hover:text-leaf-600"
                  onClick={handleAccountClick}
                  type="button"
                >
                  My Account
                </button>
              )}

              <div className="mt-2 grid gap-2">
                <button
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50 sm:hidden"
                  onClick={() => setIsLanguageMenuOpen((currentValue) => !currentValue)}
                  type="button"
                >
                  <GlobeIcon />
                  <span>{selectedLanguage.shortLabel}</span>
                  <ChevronIcon isOpen={isLanguageMenuOpen} />
                </button>
              </div>

              {isLanguageMenuOpen ? (
                <div className="mt-2 rounded-3xl border border-neutral-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
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
        ) : null}
      </header>

      <div
        className={`fixed inset-0 z-[1200] transition ${isZipPanelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
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
