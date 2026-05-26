import { useEffect, useRef } from "react";
import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function HeroSlider() {
  const openLogin = useHomeStore((state) => state.openLogin);
  const slide = slides[0];
  const videoReference = useRef<HTMLVideoElement | null>(null);
  const activeVideoSource = assets.splashVideo;

  useEffect(() => {
    const videoElement = videoReference.current;
    if (!videoElement) {
      return;
    }

    void videoElement.play().catch(() => undefined);
  }, [activeVideoSource]);

  return (
    <section
      id="home"
      className="relative isolate min-h-[620px] overflow-hidden bg-neutral-950 bg-cover bg-center text-white sm:min-h-[700px]"
      style={{ backgroundImage: `url(${assets.heroPoster})` }}
    >
      <video
        key={activeVideoSource}
        ref={videoReference}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
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
      <div className="pointer-events-none absolute inset-0 z-10 bg-neutral-950/30" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,173,64,0.2),rgba(10,13,16,0.4)_34%,rgba(10,13,16,0.84)_100%)]" />
      <div className="relative z-20 mx-auto flex min-h-[620px] max-w-7xl items-center justify-center px-4 pb-32 pt-10 text-center sm:min-h-[700px] sm:px-6 sm:pb-36 sm:pt-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center px-4 sm:bottom-10">
        <button
          className="min-h-14 w-full max-w-[240px] rounded-2xl bg-citrus-500 px-8 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-citrus-600 sm:max-w-[260px]"
          onClick={openLogin}
          type="button"
        >
          Join Now
        </button>
      </div>
    </section>
  );
}
