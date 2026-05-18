import { MouseEvent, useEffect, useState } from "react";
import { assets, navItems } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function Header() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const signupView = useHomeStore((state) => state.signupView);
  const backToHome = useHomeStore((state) => state.backToHome);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [signupView]);

  function handleSignupClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    openSignup();
  }

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    setIsMobileMenuOpen(false);

    if (signupView === "signup") {
      event.preventDefault();
      backToHome();
    }
  }

  function handleMenuToggle() {
    setIsMobileMenuOpen((currentValue) => !currentValue);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-100 bg-white/95 shadow-sm shadow-neutral-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          className="flex items-center"
          href="#home"
          aria-label="FoodOnlines home"
          onClick={handleHomeClick}
        >
          <img
            className="block h-24 w-auto max-w-[220px] object-contain sm:max-w-[300px]"
            src={assets.logo}
            alt="FoodOnlines logo"
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-neutral-700 lg:flex">
          {navItems.map((item) => (
            <a
              className="transition hover:text-citrus-500"
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              key={item}
              onClick={(event) => {
                if (item === "Home" && signupView === "signup") {
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

        <div className="flex items-center gap-3 lg:ml-auto">
          {signupView === "signup" ? (
            <button
              className="hidden min-h-12 rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:inline-flex lg:items-center"
              onClick={backToHome}
              type="button"
            >
              Home
            </button>
          ) : null}
          <a
            className="hidden min-h-12 items-center rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 lg:flex"
            href="#signup"
            onClick={handleSignupClick}
          >
            Sign up
          </a>
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
                  if (item === "Home" && signupView === "signup") {
                    event.preventDefault();
                    backToHome();
                  }

                  setIsMobileMenuOpen(false);
                }}
              >
                {item}
              </a>
            ))}

            <a
              className="mt-2 flex min-h-12 items-center justify-center rounded-md bg-citrus-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600"
              href="#signup"
              onClick={handleSignupClick}
            >
              Join Us Now
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
