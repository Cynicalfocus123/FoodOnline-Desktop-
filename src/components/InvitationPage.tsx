import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "../lib/apiClient";
import { useHomeStore } from "../store/homeStore";

type InvitationResponse = {
  valid: boolean;
  referral_code: string;
  program: {
    heading?: string | null;
    copy?: string | null;
    referee_benefit_title?: string | null;
    referee_benefit_copy?: string | null;
    terms_content?: string | null;
  };
};

export function InvitationPage() {
  const referralCode = useHomeStore((state) => state.pendingReferralCode);
  const openSignup = useHomeStore((state) => state.openSignup);
  const backToHome = useHomeStore((state) => state.backToHome);
  const [invite, setInvite] = useState<InvitationResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!referralCode) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    apiRequest<InvitationResponse>("/referrals/invite/" + encodeURIComponent(referralCode))
      .then((response) => {
        setInvite(response);
        setStatus("ready");
      })
      .catch((error) => setStatus(error instanceof ApiError && error.status === 404 ? "unavailable" : "unavailable"));
  }, [referralCode]);

  return (
    <section className="bg-neutral-50 px-4 pb-16 pt-[140px] sm:px-6 sm:pt-[154px] lg:pt-[162px]">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-soft">
        <div className="bg-leaf-700 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/75">FoodOnlines</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {status === "ready" ? invite?.program.heading : "FoodOnlines invitation"}
          </h1>
        </div>
        <div className="p-6 sm:p-10">
          {status === "loading" ? <p className="text-sm font-semibold text-neutral-600">Checking your invitation…</p> : null}
          {status === "unavailable" ? (
            <>
              <p className="text-base leading-7 text-neutral-600">This invitation is unavailable or no longer active. You can still create a FoodOnlines account.</p>
              <button className="mt-7 min-h-12 rounded-full bg-leaf-600 px-6 text-sm font-black text-white hover:bg-leaf-700" onClick={backToHome} type="button">Continue to FoodOnlines</button>
            </>
          ) : null}
          {status === "ready" && invite ? (
            <>
              <p className="text-base leading-7 text-neutral-700">{invite.program.copy}</p>
              <div className="mt-6 rounded-2xl bg-leaf-50 p-5">
                <p className="font-black text-neutral-950">{invite.program.referee_benefit_title}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{invite.program.referee_benefit_copy}</p>
              </div>
              <p className="mt-6 text-xs leading-5 text-neutral-500">{invite.program.terms_content}</p>
              <button className="mt-7 min-h-12 rounded-full bg-leaf-600 px-6 text-sm font-black text-white hover:bg-leaf-700" onClick={openSignup} type="button">Create customer account</button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
