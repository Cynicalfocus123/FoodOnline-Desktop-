import { useEffect, type ReactNode } from "react";
import { useHomeStore } from "../store/homeStore";

const basePath = import.meta.env.BASE_URL;
const vendorHeroImage = `${basePath}images/become-vendor/vendor-hero.png`;

const stats = [
  {
    label: "30 MILLION+",
    supportingText: "Trusted by customers around the world",
  },
  {
    label: "20 MILLION+",
    supportingText: "MONTHLY VISITS",
  },
  {
    label: "90 %",
    supportingText: "YOY growth",
  },
  {
    label: "ZERO",
    supportingText: "Only pay low commission on what you sell",
  },
];

const businessCards = [
  {
    icon: <ReachIcon />,
    title: "Expand Your Brand's Global Reach",
    body: "Grow your business and connect with millions of customers worldwide",
  },
  {
    icon: <PortalIcon />,
    title: "Take Control of Your Business Growth",
    body: "Manage products, monitor orders, track performance, and access powerful insights through our centralized Seller Portal.",
  },
  {
    icon: <FulfillmentIcon />,
    title: "Streamline Your Logistics with Flexible Fulfillment",
    body: "Let us handle storage, packing, and shipping so you can focus on growing your business.",
  },
];

const steps = [
  {
    number: "1",
    title: "Tell Us About Your Business and Products",
    body: "Share information about your company, product categories, and top-selling items so we can better understand your business and support a successful launch.",
    className: "bg-[#a9d3df]",
    illustration: <BusinessProfileIllustration />,
  },
  {
    number: "2",
    title: "Verify Your Business and Payment Information",
    body: "To ensure a secure and successful selling experience, please provide business verification documents, proof of identity, and your tax and payment information so we can process payouts accurately and securely.",
    className: "bg-[#f8cf75]",
    illustration: <PaymentIllustration />,
  },
  {
    number: "3",
    title: "Verify Certifications and Qualifications",
    body: "Upload your Certificate of Insurance and any required resale certificates to ensure compliance with applicable regulatory requirements.",
    className: "bg-[#d8e9c4]",
    illustration: <CertificateIllustration />,
  },
];

function ArrowCircle({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6b1a] text-white ${className}`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

function VendorCtaButton({
  children,
  className = "",
  onClick,
  variant = "normal",
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  variant?: "normal" | "large";
}) {
  return (
    <button
      className={`inline-flex min-h-14 items-center justify-center gap-4 rounded-full border-[6px] border-[#ff6b1a] bg-white px-7 font-semibold text-[#ff6b1a] shadow-[0_12px_30px_rgba(54,91,31,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(54,91,31,0.14)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b1a]/30 ${
        variant === "large" ? "text-[clamp(2rem,5vw,3.8rem)] lg:min-h-28 lg:px-16" : "text-[clamp(1.25rem,2.6vw,2.15rem)]"
      } ${className}`}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      <ArrowCircle className={variant === "large" ? "h-14 w-14 lg:h-20 lg:w-20" : ""} />
    </button>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-12 w-12 shrink-0 text-black sm:h-16 sm:w-16" fill="currentColor" viewBox="0 0 64 64">
      <path d="M32 2c3.7 16.1 8.9 24.3 25 30-16.1 5.7-24.3 13.9-30 30-5.7-16.1-13.9-24.3-30-30 16.1-5.7 24.3-13.9 30-30Z" />
    </svg>
  );
}

function ReachIcon() {
  return (
    <svg aria-hidden="true" className="h-20 w-20 text-[#64bd00]" fill="none" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="29" stroke="currentColor" strokeWidth="5" />
      <path d="M20 48h56M48 19c9 9 13 19 13 29s-4 20-13 29M48 19c-9 9-13 19-13 29s4 20 13 29" stroke="#111" strokeLinecap="round" strokeWidth="4" />
      <path d="M64 23h13v13M77 23 58 42" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      <circle cx="26" cy="66" r="7" fill="#64bd00" />
      <circle cx="34" cy="74" r="7" fill="#64bd00" />
    </svg>
  );
}

function PortalIcon() {
  return (
    <svg aria-hidden="true" className="h-20 w-20 text-[#64bd00]" fill="none" viewBox="0 0 96 96">
      <rect height="49" rx="5" stroke="#111" strokeWidth="4" width="64" x="16" y="18" />
      <path d="M38 80h20M48 67v13" stroke="#111" strokeLinecap="round" strokeWidth="4" />
      <path d="M27 53h8v8h-8zM44 43h8v18h-8zM61 32h8v29h-8z" fill="#64bd00" stroke="#111" strokeWidth="3" />
      <path d="m25 38 13-8 14 7 17-14" stroke="#64bd00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <path d="M24 25h12M24 32h8" stroke="#111" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function FulfillmentIcon() {
  return (
    <svg aria-hidden="true" className="h-20 w-20 text-[#64bd00]" fill="none" viewBox="0 0 96 96">
      <path d="M28 35 48 24l20 11v28L48 74 28 63Z" fill="#d8b078" stroke="#111" strokeLinejoin="round" strokeWidth="4" />
      <path d="m28 35 20 12 20-12M48 47v27" stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <path d="M37 27c3-8 18-8 21 0M48 18v12" stroke="#64bd00" strokeLinecap="round" strokeWidth="4" />
      <path d="M18 58h21M58 58h20M22 68h16M61 68h13" stroke="#111" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function GlobeGraphic() {
  return (
    <div aria-hidden="true" className="relative h-[230px] w-[230px] sm:h-[310px] sm:w-[310px] lg:h-[400px] lg:w-[400px]">
      <div className="absolute inset-0 rounded-full bg-[#64bd00]" />
      <svg className="absolute inset-[10%] h-[80%] w-[80%] text-black" fill="none" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="138" stroke="currentColor" strokeWidth="3" />
        <path d="M32 118c46-18 87-20 124-4 42 17 83 9 112-4M42 202c35-18 72-20 111-3 38 16 77 13 116-9M150 12c-34 37-51 84-51 140s17 102 51 136M150 12c34 37 51 84 51 140s-17 102-51 136" stroke="currentColor" strokeWidth="2" />
        <path d="M49 84 95 52l59 23 59-40 38 72-41 45 29 66-88 28-52-33-65 24-19-74Z" fill="currentColor" opacity="0.94" />
        {[50, 95, 154, 213, 251, 75, 119, 184, 231].map((cx, index) => (
          <circle cx={cx} cy={[84, 52, 75, 35, 107, 163, 213, 152, 218][index]} fill="currentColor" key={cx} r="4" />
        ))}
        <path d="m50 84 45-32 59 23 59-40 38 72M75 163l44 50 65-61 47 66M95 52l24 161M154 75l30 77M213 35l-29 117" stroke="#c4dfb8" strokeWidth="2" />
      </svg>
    </div>
  );
}

function BusinessProfileIllustration() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[240px]">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_24px_rgba(0,0,0,0.14)]">
        <div className="flex h-12 items-center gap-2 bg-neutral-600 px-4">
          <span className="h-4 w-4 rounded-full bg-[#f25b3d]" />
          <span className="h-4 w-4 rounded-full bg-[#45b7e8]" />
          <span className="h-4 w-4 rounded-full bg-[#ffd65a]" />
          <span className="ml-3 h-4 flex-1 rounded bg-neutral-500" />
        </div>
        <div className="grid gap-4 p-4">
          <div className="rounded-md bg-[#e95c42] px-4 py-2 text-center text-4xl font-semibold leading-none text-white">WWW.</div>
          <div className="grid grid-cols-[64px_1fr] gap-4">
            <div className="grid h-16 place-items-center rounded-lg bg-[#49bfea]">
              <svg className="h-10 w-10 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48">
                <path d="M24 39c-8-5-12-11-12-19 0-7 5-12 12-12s12 5 12 12c0 8-4 14-12 19Z" />
                <path d="M24 10v28M16 20c6 2 9 5 10 12M32 20c-6 2-9 5-10 12" />
              </svg>
            </div>
            <div className="grid content-center gap-2">
              <span className="h-2 rounded bg-neutral-300" />
              <span className="h-2 rounded bg-neutral-300" />
              <span className="h-2 rounded bg-neutral-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[210px] w-full max-w-[250px]">
      <div className="absolute left-4 top-8 h-28 w-36 rotate-[-28deg] rounded-xl border-[10px] border-neutral-600 bg-white shadow-lg">
        <div className="mt-5 h-4 bg-neutral-300" />
        <div className="mx-4 mt-5 h-4 rounded bg-neutral-300" />
      </div>
      <div className="absolute bottom-5 left-8 h-20 w-20 rounded-2xl bg-[#2d9ad1] shadow-lg">
        <svg className="m-auto mt-5 h-10 w-10 text-[#ffd65a]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" viewBox="0 0 48 48">
          <path d="m12 24 10 10 18-22" />
        </svg>
      </div>
      <div className="absolute right-1 top-16 h-24 w-36 rotate-[6deg] rounded-xl bg-[#e95c42] p-4 shadow-xl">
        <div className="h-4 rounded bg-[#ffd65a]" />
        <div className="mt-8 h-3 w-20 rounded bg-[#9ed7e5]" />
        <div className="absolute bottom-5 right-5 flex gap-1">
          <span className="h-5 w-5 rounded-full bg-white/85" />
          <span className="h-5 w-5 rounded-full bg-white/85" />
        </div>
      </div>
    </div>
  );
}

function CertificateIllustration() {
  return (
    <div aria-hidden="true" className="mx-auto grid h-[210px] w-full max-w-[260px] place-items-center">
      <div className="relative w-full rounded bg-white p-7 shadow-lg">
        <div className="text-center text-2xl font-semibold uppercase text-neutral-600">Certificate</div>
        <div className="mx-auto mt-5 h-2 w-28 rounded bg-neutral-300" />
        <div className="mx-auto mt-3 h-2 w-36 rounded bg-neutral-300" />
        <div className="absolute -bottom-9 left-1/2 h-20 w-20 -translate-x-1/2">
          <div className="absolute inset-4 rounded-full bg-[#f6b544]" />
          <div className="absolute inset-0 rotate-45 bg-[#ffd65a]" />
          <div className="absolute bottom-0 left-4 h-10 w-5 bg-[#e95c42]" />
          <div className="absolute bottom-0 right-4 h-10 w-5 bg-[#e95c42]" />
        </div>
      </div>
    </div>
  );
}

function SectionShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`relative mx-auto w-full max-w-[1640px] px-5 sm:px-10 lg:px-16 ${className}`}>{children}</section>;
}

export function BecomeVendorPage() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const openLogin = useHomeStore((state) => state.openLogin);

  useEffect(() => {
    document.title = "Become a Vendor | FoodOnlines";

    const description =
      "Sell globally with FoodOnlines and reach more customers through a global marketplace for food brands and suppliers.";
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }, []);

  return (
    <div
      className="overflow-hidden bg-[#c4dfb8] pt-[116px] text-black sm:pt-[128px] lg:pt-[138px]"
      style={{ fontFamily: 'Poppins, Inter, "Nunito Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <SectionShell className="grid min-h-[calc(100vh-138px)] items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:py-20">
        <div className="relative z-10 max-w-[1040px]">
          <p className="text-[clamp(2.35rem,5vw,4.7rem)] font-normal leading-none">Sell Globally</p>
          <h1 className="mt-8 max-w-[1040px] text-[clamp(3.1rem,6.8vw,7.8rem)] font-semibold uppercase leading-[0.98]">
            REACH MORE CUSTOMERS.
            <br />
            GROW FASTER.
          </h1>
          <p className="mt-8 max-w-[920px] text-[clamp(1.25rem,2.4vw,2.45rem)] leading-[1.22]">
            Join a global marketplace designed to help food brands and suppliers expand into new markets and increase sales.
          </p>
          <VendorCtaButton className="mt-10" onClick={openSignup}>
            GET STARTED
          </VendorCtaButton>
        </div>

        <div className="relative mx-auto h-[340px] w-full max-w-[610px] sm:h-[460px] lg:h-[650px]" aria-hidden="true">
          <div
            className="absolute -right-16 top-0 h-[42%] w-[68%] rounded-full bg-[#a8cbda] bg-no-repeat sm:-right-20 lg:-right-24"
            style={{
              backgroundImage: `url("${vendorHeroImage}")`,
              backgroundPosition: "right top",
              backgroundSize: "1650px auto",
            }}
          />
          <div
            className="absolute -bottom-4 left-[6%] h-[60%] w-[88%] rounded-full bg-[#f6cf74] bg-no-repeat sm:-bottom-6 lg:-bottom-8"
            style={{
              backgroundImage: `url("${vendorHeroImage}")`,
              backgroundPosition: "right bottom",
              backgroundSize: "2100px auto",
            }}
          />
        </div>
      </SectionShell>

      <SectionShell className="py-12 sm:py-16">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[clamp(1.8rem,3vw,3.2rem)] leading-none">Sell Globally</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-center xl:gap-8">
          {stats.map((stat) => (
            <div className="contents" key={stat.label}>
              <SparkIcon />
              <div className="rounded-[28px] bg-[#c4dfb8] p-2 text-center sm:text-left xl:p-0">
                <p className="text-[clamp(2.6rem,4.6vw,5.1rem)] font-semibold uppercase leading-[1.05]">{stat.label}</p>
                <p className="mt-3 text-[clamp(1rem,1.6vw,1.28rem)] leading-snug">{stat.supportingText}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:py-20">
        <div className="max-w-[1160px]">
          <h2 className="text-[clamp(2.6rem,5vw,5.2rem)] font-semibold leading-tight">Who&apos;s Selling on Globally?</h2>
          <p className="mt-6 text-[clamp(1.45rem,3vw,3.2rem)] uppercase leading-[1.18]">
            JOIN THOUSANDS OF TRUSTED BRANDS AND BUSINESSES GROWING THEIR SALES THROUGH OUR GLOBAL MARKETPLACE.
          </p>
        </div>
        <div className="justify-self-center lg:-mr-24">
          <GlobeGraphic />
        </div>
      </SectionShell>

      <SectionShell className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-[840px]">
          <h2 className="text-[clamp(2rem,3.2vw,3.4rem)] font-semibold leading-tight">
            Everything You Need to Scale Your Business
          </h2>
          <p className="mt-4 text-[clamp(1.05rem,1.7vw,1.45rem)] leading-snug">
            Leverage our advanced Seller Portal to streamline operations, manage your products, and grow your sales with confidence.
          </p>
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {businessCards.map((card) => (
            <article
              className="grid min-h-[280px] place-items-center rounded-[26px] bg-white px-6 py-8 text-center shadow-[0_24px_55px_rgba(55,91,38,0.12)] sm:px-9"
              key={card.title}
            >
              <div>{card.icon}</div>
              <h3 className="mt-5 text-[clamp(1.25rem,2vw,1.65rem)] font-semibold leading-tight">{card.title}</h3>
              <p className="mt-3 max-w-[390px] text-[clamp(1rem,1.35vw,1.2rem)] leading-snug">{card.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="py-12 sm:py-16 lg:py-20">
        <p className="text-[clamp(1rem,2.1vw,2.1rem)] leading-none tracking-[0.18em]">One of the World&apos;s Largest Online Supermarkets</p>
        <h2 className="mt-4 text-[clamp(2.1rem,4.35vw,4.75rem)] font-semibold uppercase leading-[0.98]">
          START SELLING IN JUST
          <br />
          <span className="text-[#ff6b1a]">THREE SIMPLE STEPS</span>
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <article className={`rounded-[30px] px-6 py-8 shadow-[0_24px_55px_rgba(55,91,38,0.12)] sm:px-9 ${step.className}`} key={step.number}>
              <div className="flex items-start gap-5">
                <span className="relative inline-flex h-12 w-16 shrink-0 items-center justify-center">
                  <span className="absolute h-11 w-11 rounded-full border-[6px] border-[#b8c32d] bg-white" />
                  <span className="absolute right-0 h-9 w-9 rotate-45 bg-[#b8c32d]" />
                  <span className="relative text-xl font-semibold text-[#9fb000]">{step.number}</span>
                </span>
                <h3 className="text-[clamp(1.25rem,2vw,1.7rem)] font-semibold leading-tight">{step.title}</h3>
              </div>
              <div className="mt-8">{step.illustration}</div>
              <p className="mx-auto mt-8 max-w-[520px] text-center text-[clamp(1.15rem,1.55vw,1.38rem)] leading-relaxed">{step.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:py-24">
        <div>
          <h2 className="text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-tight">Start Selling Today</h2>
          <p className="mt-4 text-[clamp(1.3rem,2.4vw,2.6rem)] leading-tight">
            A Global Marketplace Connecting Sellers with Customers Worldwide
          </p>
          <p className="mt-12 text-[clamp(1.35rem,2.2vw,2.3rem)]">Already have a seller account?</p>
          <button
            className="mt-4 inline-flex min-h-12 items-center gap-2 text-[clamp(1.15rem,2vw,2rem)] font-semibold text-black transition hover:text-[#ff6b1a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b1a]/30"
            onClick={openLogin}
            type="button"
          >
            <span>Log in</span>
            <ArrowCircle className="h-8 w-8" />
          </button>
        </div>
        <VendorCtaButton className="w-full min-w-0 sm:min-w-[520px]" onClick={openSignup} variant="large">
          Sign up
        </VendorCtaButton>
      </SectionShell>
    </div>
  );
}
