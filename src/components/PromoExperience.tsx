import { useEffect, useState } from "react";
import { getIsPromoDismissed, setPromoDismissed } from "../lib/promoStorage";
import { PromoModalDesktop } from "./PromoModalDesktop";
import { PromoModalMobile } from "./PromoModalMobile";
import { PromoStickyBar } from "./PromoStickyBar";

function copyPromoCode() {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }

  return navigator.clipboard
    .writeText("WELCOME")
    .then(() => true)
    .catch(() => false);
}

export function PromoExperience() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    setIsDismissed(getIsPromoDismissed());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  async function handleCopy() {
    const didCopy = await copyPromoCode();
    setHasCopied(didCopy);
  }

  function handleOpen() {
    setHasCopied(false);
    setIsModalOpen(true);
  }

  function handleDismiss() {
    setPromoDismissed(true);
    setIsDismissed(true);
    setIsModalOpen(false);
  }

  function handleCloseModalOnly() {
    setIsModalOpen(false);
  }

  if (!isHydrated || isDismissed) {
    return null;
  }

  const copyLabel = hasCopied ? "Code Copied" : "Copy Code";

  return (
    <>
      <PromoStickyBar onOpen={handleOpen} />

      <div
        className={`fixed inset-0 z-[80] transition ${isModalOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isModalOpen}
      >
        <button
          aria-label="Close promotion overlay"
          className={`absolute inset-0 bg-neutral-950/45 transition-opacity duration-300 ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseModalOnly}
          type="button"
        />

        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div
            className={`flex w-full justify-center transition duration-300 ${
              isModalOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"
            }`}
          >
            <PromoModalDesktop
              copyLabel={copyLabel}
              hasCopied={hasCopied}
              onClose={handleDismiss}
              onCopy={() => void handleCopy()}
            />
            <PromoModalMobile
              copyLabel={copyLabel}
              hasCopied={hasCopied}
              onClose={handleDismiss}
              onCopy={() => void handleCopy()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
