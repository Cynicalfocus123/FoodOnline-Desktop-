import { assets, navItems } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function Header() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const signupView = useHomeStore((state) => state.signupView);
  const backToHome = useHomeStore((state) => state.backToHome);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-100 bg-white/95 shadow-sm shadow-neutral-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          className="flex items-center"
          href="#home"
          aria-label="FoodOnlines home"
          onClick={(event) => {
            if (signupView === "signup") {
              event.preventDefault();
              backToHome();
            }
          }}
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
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {signupView === "signup" ? (
            <button
              className="min-h-12 rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500"
              onClick={backToHome}
              type="button"
            >
              Home
            </button>
          ) : null}
          <a
            className="hidden min-h-12 items-center rounded-md border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-citrus-500 hover:text-citrus-500 sm:flex"
            href="#signup"
            onClick={(event) => {
              event.preventDefault();
              openSignup();
            }}
          >
            Sign up
          </a>
          <a
            className="min-h-12 rounded-md bg-citrus-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-citrus-600 sm:px-5"
            href="#best-deals"
            onClick={(event) => {
              if (signupView === "signup") {
                event.preventDefault();
                backToHome();
              }
            }}
          >
            Shop now
          </a>
        </div>
      </div>
    </header>
  );
}
