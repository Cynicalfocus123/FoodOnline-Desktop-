import { useEffect, useRef, useState } from "react";
import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function HeroSlider() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const slide = slides[0];
  const videoReference = useRef<HTMLVideoElement | null>(null);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const activeVideoSource = isMobileViewport ? assets.mobileHeroVideo : assets.heroVideo;

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
  }, [activeVideoSource]);

  return (
    <section
      id="home"
      className="relative isolate min-h-[760px] overflow-hidden bg-neutral-950 bg-cover bg-center pt-24 text-white"
      style={{ backgroundImage: `url(${assets.heroPoster})` }}
    >
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
      <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-950/20" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.18),rgba(10,13,16,0.45)_34%,rgba(10,13,16,0.86)_100%)]" />
      <div className="relative z-20 mx-auto flex min-h-[680px] max-w-7xl items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>

          <div className="mx-auto mt-10 max-w-3xl sm:mt-12">
            <p className="mb-4 text-lg font-black leading-7 text-white sm:text-2xl sm:leading-8">
              Register now and join the future of wholesale food
            </p>
            <button
              className="min-h-14 min-w-[220px] rounded-md bg-citrus-500 px-8 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-citrus-600 sm:min-w-[260px]"
              onClick={openSignup}
              type="button"
            >
              Join Us Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
