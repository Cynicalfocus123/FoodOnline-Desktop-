export const driverAssets = {
  hero: {
    src: "foodonlines-driver-hero.webp",
    alt: "FoodOnlines driver loading branded delivery boxes into a van",
  },
  earnings: {
    src: "foodonlines-driver-earnings.webp",
    alt: "FoodOnlines driver checking a delivery phone near a customer doorway",
  },
  earningsPerson: {
    src: "driver-earnings-person-crop.webp",
    alt: "FoodOnlines driver checking a phone near a doorway",
  },
  support: {
    src: "foodonlines-driver-support.webp",
    alt: "FoodOnlines drivers loading delivery parcels into a branded van",
  },
  community: {
    src: "foodonlines-driver-community.webp",
    alt: "FoodOnlines driver team standing together",
  },
  applyTeam: {
    src: "driver-apply-team.webp",
    alt: "FoodOnlines drivers standing in front of a branded delivery truck",
  },
  valueLoading: {
    src: "driver-value-loading.webp",
    alt: "FoodOnlines drivers loading delivery boxes into a truck",
  },
  valueCab: {
    src: "driver-value-cab.webp",
    alt: "FoodOnlines driver seated in a delivery truck cab",
  },
  valueTeam: {
    src: "driver-value-team.webp",
    alt: "FoodOnlines driver team standing together in an office",
  },
  valuePair: {
    src: "driver-value-pair.webp",
    alt: "Two FoodOnlines drivers standing near a delivery truck",
  },
  appRoute: {
    src: "driver-program-van.webp",
    alt: "FoodOnlines branded delivery van on the road",
  },
  routeSelect: {
    src: "driver-schedule-calendar.webp",
    alt: "Delivery schedule calendar with planned route stops",
  },
  doorDelivery: {
    src: "driver-route-delivery.webp",
    alt: "FoodOnlines driver loading delivery boxes into a van",
  },
  payout: {
    src: "driver-payout-phone.webp",
    alt: "Driver payout confirmation on a phone",
  },
} as const;

export type DriverAssetKey = keyof typeof driverAssets;

export const driverStats = [
  { value: 500, suffix: "+", label: "Delivery partners" },
  { value: 20000, suffix: "+", label: "Deliveries supported monthly" },
  { value: 250, suffix: "+", label: "Route-ready vehicles and partners" },
  { value: 11, suffix: "", label: "Operating hubs and service areas" },
] as const;

export const successCards = [
  {
    title: "How Much Can You Earn?",
    subtitle: "Parcel-based earning potential",
    body: "Most drivers earn between ฿10 and ฿20 per parcel delivered, with total earnings depending on the number of deliveries completed and route availability.",
    accent: "orange",
    image: "earningsPerson" as DriverAssetKey,
  },
  {
    title: "Dedicated Support Around the Clock",
    subtitle: "A Better Experience for Independent Contractors",
    body: "From onboarding to daily operations, we provide the resources, assistance, and benefits that help you perform at your best and earn with confidence.",
    accent: "green",
    image: "support" as DriverAssetKey,
  },
  {
    title: "Drive Together. Grow Together.",
    subtitle: "A Community That Invests in Your Success.",
    body: "Join a network of dedicated drivers where collaboration, support, and career opportunities help you achieve more than just earnings.",
    accent: "orange",
    image: "community" as DriverAssetKey,
  },
] as const;

export const groupedDeliverySteps = [
  {
    title: "Choose the Deliveries That Fit Your Schedule",
    body: "Select as few or as many deliveries as you want each day, giving you the flexibility to work at a pace that suits your availability and earning goals.",
    image: "routeSelect" as DriverAssetKey,
  },
  {
    title: "Timely Deliveries, Satisfied Customers",
    body: "Complete your chosen deliveries efficiently and ensure customers receive their orders on schedule throughout your route.",
    image: "doorDelivery" as DriverAssetKey,
  },
  {
    title: "Get Paid for Every Delivery",
    body: "Earn income for the deliveries you complete, with your earnings growing as you consistently fulfill orders on time.",
    image: "payout" as DriverAssetKey,
  },
] as const;

export const eligibilityItems = [
  {
    title: "Vehicle requirements",
    body: "To participate in grocery deliveries, drivers must own and operate a personal minivan, delivery van, or large SUV. For restaurant deliveries, eligible vehicles also include sedans, bicycles, motorcycles, and small to mid-sized SUVs.",
  },
  {
    title: "Age requirements",
    body: "You must be over 18 years of age.",
  },
  {
    title: "License, Work Authorization & Insurance Requirements",
    body: "Drivers must possess a valid driver's license, maintain current auto insurance coverage, and be legally authorized to work for any employer in Thailand.",
  },
  {
    title: "Background check",
    body: "All applicants must successfully pass a background screening as part of the onboarding process.",
  },
  {
    title: "Other requirements",
    body: "Applicants must have a minimum of six months of delivery driving experience. Drivers should be comfortable using GPS navigation and route-mapping tools, be capable of lifting up to (23 kg), and possess strong customer service and communication skills with a positive, professional attitude.",
  },
] as const;

export const fleetBenefits = [
  { title: "You're a full-time team member", subtitle: "Get steady support" },
  { title: "Join a fast-growing company", subtitle: "Be part of the journey" },
  { title: "Opportunities to grow", subtitle: "Grow with your team" },
] as const;

export const fleetCards = [
  { title: "Competitive compensation", subtitle: "Full-time pay and support" },
  { title: "Join a passionate team", subtitle: "Grow with people who care about food delivery" },
  { title: "Build something impactful", subtitle: "Help bring global food to more homes" },
] as const;

export const moreInfoItems = [
  {
    title: "Hours, schedule, and shifts",
    body: "Route availability, delivery windows, and shift details are finalized by service area and shared during onboarding.",
  },
  {
    title: "Compensation & pay",
    body: "Pay details depend on route type, completion, market, and role. Final HR-approved pay information appears during application review.",
  },
  {
    title: "Benefits & perks",
    body: "Full-time fleet roles may include additional team support, scheduled routes, and role-specific benefits where available.",
  },
  {
    title: "Requirements for eligibility",
    body: "Drivers need a reliable delivery setup, smartphone access, valid documentation, and a safe customer-service mindset.",
  },
  {
    title: "What you'll be doing",
    body: "Drivers pick up prepared grocery orders, follow grouped route details, deliver safely, and keep customers updated when needed.",
  },
] as const;
