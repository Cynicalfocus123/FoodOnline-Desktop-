import { MouseEvent, useEffect, useState } from "react";
import { assets, navItems } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

export function Header() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const openLogin = useHomeStore((state) => state.openLogin);
  const siteView = useHomeStore((state) => state.siteView);
  const backToHome = useHomeStore((state) => state.backToHome);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const logoutUser = usePublicAuthStore((state) => state.logoutUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [siteView]);

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

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-100 bg-white/95 shadow-sm shadow-neutral-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        <a
          className="flex items-center"
          href="#home"
          aria-label="FoodOnlines home"
          onClick={handleHomeClick}
        >
          <img
            className="block h-20 w-auto max-w-[190px] object-contain sm:max-w-[250px]"
            src={assets.logo}
            alt="FoodOnlines logo"
          />
        </a>

        <nav className="hidden items-center justify-center gap-8 pl-8 text-sm font-semibold text-neutral-700 lg:flex">
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
              className="hidden min-h-12 rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:inline-flex lg:items-center"
              onClick={backToHome}
              type="button"
            >
              Home
            </button>
          ) : null}
          {currentUser ? (
            <>
              <button
                className="hidden min-h-12 rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-leaf-500 hover:text-leaf-700 lg:inline-flex lg:items-center"
                onClick={handleAccountClick}
                type="button"
              >
                My Account
              </button>
              <button
                className="hidden min-h-12 items-center rounded-md bg-citrus-500 px-4 text-sm font-black text-white transition hover:bg-citrus-600 lg:inline-flex"
                onClick={() => void logoutUser()}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                className="hidden min-h-12 items-center rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-leaf-500 hover:text-leaf-700 lg:flex"
                href="#login"
                onClick={handleLoginClick}
              >
                Login
              </a>
              <a
                className="hidden min-h-12 items-center rounded-md bg-citrus-500 px-4 text-sm font-black text-white transition hover:bg-citrus-600 lg:flex"
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
            className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:hidden"
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
                className="rounded-md px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 hover:text-citrus-500"
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

            {currentUser ? (
              <>
                <button
                  className="mt-2 flex min-h-12 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-leaf-500 hover:text-leaf-700"
                  onClick={handleAccountClick}
                  type="button"
                >
                  My Account
                </button>
                <button
                  className="flex min-h-12 items-center justify-center rounded-md bg-citrus-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
                  onClick={() => void logoutUser()}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  className="mt-2 flex min-h-12 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-leaf-500 hover:text-leaf-700"
                  href="#login"
                  onClick={handleLoginClick}
                >
                  Login
                </a>
                <a
                  className="flex min-h-12 items-center justify-center rounded-md bg-citrus-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
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
  );
}
