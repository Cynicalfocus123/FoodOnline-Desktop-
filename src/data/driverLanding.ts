export const driverAssets = {
  hero: {
    src: "foodonlines-driver-hero.png",
    alt: "FoodOnlines driver loading branded delivery boxes into a van",
  },
  earnings: {
    src: "foodonlines-driver-earnings.png",
    alt: "FoodOnlines driver checking a delivery phone near a customer doorway",
  },
  support: {
    src: "foodonlines-driver-support.png",
    alt: "FoodOnlines drivers loading delivery parcels into a branded van",
  },
  community: {
    src: "foodonlines-driver-community.png",
    alt: "FoodOnlines driver team standing together",
  },
  flex: {
    src: "driver-flex.webp",
    alt: "Driver using a phone to choose grocery delivery routes",
  },
  fleet: {
    src: "driver-fleet.webp",
    alt: "FoodOnlines fleet driver near a delivery van",
  },
  handoff: {
    src: "driver-delivery-hand-off.webp",
    alt: "Driver handing a grocery order to a customer",
  },
  appRoute: {
    src: "driver-app-route.webp",
    alt: "FoodOnlines route app screen",
  },
  routeSelect: {
    src: "driver-route-select.webp",
    alt: "Delivery route selection on a phone",
  },
  doorDelivery: {
    src: "driver-door-delivery.webp",
    alt: "Driver delivering groceries to a home",
  },
  payout: {
    src: "driver-payout.webp",
    alt: "Driver payout confirmation screen",
  },
  team: {
    src: "driver-team.webp",
    alt: "FoodOnlines delivery team",
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
    image: "earnings" as DriverAssetKey,
  },
  {
    title: "2. Dedicated Support Around the Clock",
    subtitle: "A Better Experience for Independent Contractors",
    body: "From onboarding to daily operations, we provide the resources, assistance, and benefits that help you perform at your best and earn with confidence.",
    accent: "green",
    image: "support" as DriverAssetKey,
  },
  {
    title: "3. Drive Together. Grow Together.",
    subtitle: "A Community That Invests in Your Success.",
    body: "Join a network of dedicated drivers where collaboration, support, and career opportunities help you achieve more than just earnings.",
    accent: "orange",
    image: "community" as DriverAssetKey,
  },
] as const;

export const groupedDeliverySteps = [
  {
    title: "Choose the deliveries you want to fulfill for the day",
    body: "Pick as few or as many route stops as fit your workday.",
    image: "routeSelect" as DriverAssetKey,
  },
  {
    title: "Deliver your orders within the delivery window",
    body: "Bring groceries to customers on your selected route.",
    image: "doorDelivery" as DriverAssetKey,
  },
  {
    title: "Get paid for completed deliveries",
    body: "Track your progress and receive payout information clearly.",
    image: "payout" as DriverAssetKey,
  },
] as const;

export const eligibilityItems = [
  {
    title: "Vehicle requirements",
    body: "Reliable vehicle, clean condition, enough space for grocery bags, and ability to safely complete delivery routes.",
  },
  {
    title: "Age requirements",
    body: "Drivers must meet the minimum legal driving age in their service area.",
  },
  {
    title: "License, authorization, and insurance",
    body: "Valid driver's license, work authorization where required, and active vehicle insurance.",
  },
  {
    title: "Background check",
    body: "Applicants may need to complete a background check before starting deliveries.",
  },
  {
    title: "Other requirements",
    body: "Smartphone access, customer-service mindset, and ability to carry grocery orders safely.",
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
