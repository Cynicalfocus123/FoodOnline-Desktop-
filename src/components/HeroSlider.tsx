import { useEffect, useRef, useState } from "react";
import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function HeroSlider() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const openLogin = useHomeStore((state) => state.openLogin);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const slide = slides[0];
  const videoReference = useRef<HTMLVideoElement | null>(null);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const activeVideoSource = assets.heroVideo;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewportMode = (event?: MediaQueryListEvent) => {
      setIsMobileViewport(event ? event.matches : mediaQuery.matches);
    };

    updateViewportMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewportMode);

      return () => {
        mediaQuery.removeEventListener("change", updateViewportMode);
      };
    }

    mediaQuery.addListener(updateViewportMode);

    return () => {
      mediaQuery.removeListener(updateViewportMode);
    };
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      setHasVideoStarted(false);
      return;
    }

    const videoElement = videoReference.current;
    if (!videoElement) {
      return;
    }

    setHasVideoStarted(false);

    const markVideoReady = () => {
      setHasVideoStarted(true);
    };

    videoElement.addEventListener("playing", markVideoReady);
    videoElement.addEventListener("canplay", markVideoReady);

    void videoElement.play().catch(() => {
      setHasVideoStarted(false);
    });

    return () => {
      videoElement.removeEventListener("playing", markVideoReady);
      videoElement.removeEventListener("canplay", markVideoReady);
    };
  }, [activeVideoSource, isMobileViewport]);

  function scrollToDeals() {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function viewAccount() {
    document.getElementById("account-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="home"
      className="relative isolate min-h-[620px] overflow-hidden bg-neutral-950 bg-cover bg-center text-white sm:min-h-[700px]"
      style={{ backgroundImage: `url(${assets.heroPoster})` }}
    >
      {isMobileViewport ? (
        <div
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-500 ${
            hasVideoStarted ? "opacity-100" : "opacity-0"
          }`}
        >
          <iframe
            className="absolute left-1/2 top-1/2 h-[118%] w-[210%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
            src={assets.mobileHeroEmbed}
            title="Food mobile video less mb"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            tabIndex={-1}
            aria-hidden="true"
            onLoad={() => setHasVideoStarted(true)}
          />
        </div>
      ) : (
        <video
          key={activeVideoSource}
          ref={videoReference}
          className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-500 ${
            hasVideoStarted ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          poster={assets.heroPoster}
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
        >
          <source src={activeVideoSource} type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-950/30" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,173,64,0.2),rgba(10,13,16,0.4)_34%,rgba(10,13,16,0.84)_100%)]" />
      <div className="relative z-20 mx-auto flex min-h-[620px] max-w-7xl items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            Grocery storefront mockup
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>

          <div className="mx-auto mt-6 max-w-3xl sm:mt-8">
            <p className="mb-6 text-base font-semibold leading-7 text-white/85 sm:text-xl sm:leading-8">
              {currentUser
                ? `Signed in as ${currentUser.firstName || currentUser.email}.`
                : "Blinkit-style rows, Yamibuy-inspired shortcuts, and clean desktop-first browsing made ready for API wiring later."}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="min-h-14 min-w-[220px] rounded-2xl bg-citrus-500 px-8 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-citrus-600 sm:min-w-[240px]"
                onClick={currentUser ? viewAccount : openSignup}
                type="button"
              >
                {currentUser ? "View Account" : "Register"}
              </button>
              <button
                className="min-h-14 min-w-[220px] rounded-2xl border border-white/70 bg-white/10 px-8 text-base font-black text-white backdrop-blur transition hover:bg-white/20 sm:min-w-[220px]"
                onClick={currentUser ? scrollToDeals : openLogin}
                type="button"
              >
                {currentUser ? "Browse Deals" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
