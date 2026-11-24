export const BRAND_TOKENS = {
  name: "NAMH ASTRO",
  domain: "https://namhastro.com",
  tagline: "Sacred Vedic Wisdom, Modern Clarity",
  palette: {
    spiritualWhite: "#FFFFFF",
    warmIvory: "#FAF7F2",
    softParchment: "#F3ECE1",
    sacredSaffron: "#E86A17",
    deepSaffron: "#C8550C",
    templeGold: "#C89B3C",
    softGoldTint: "#FDF6E7",
    deepSandalwood: "#2A1E17",
    mutedAsh: "#6B5B53",
    hairlineBorder: "#E8DFD3",
    emeraldOnline: "#15803D",
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  sectionId?: string;
  deliveryStep: number;
  category: "primary" | "consultation" | "astrology" | "marketplace";
}

export const MAIN_HEADER_NAV: readonly NavItem[] = [
  { label: "Home", href: "/", deliveryStep: 1, category: "primary" },
  { label: "Chat with Astrologer", href: "/#route-inventory", sectionId: "chat-with-astrologer", deliveryStep: 2, category: "consultation" },
  { label: "Talk to Astrologer", href: "/#route-inventory", sectionId: "talk-to-astrologer", deliveryStep: 2, category: "consultation" },
  { label: "Video Consultation", href: "/#route-inventory", sectionId: "video-consultation", deliveryStep: 2, category: "consultation" },
  { label: "Free Kundli", href: "/#route-inventory", sectionId: "free-kundli", deliveryStep: 9, category: "astrology" },
  { label: "Kundli Matching", href: "/#route-inventory", sectionId: "kundli-matching", deliveryStep: 9, category: "astrology" },
  { label: "Horoscope", href: "/#route-inventory", sectionId: "horoscope", deliveryStep: 9, category: "astrology" },
  { label: "Live Astrologers", href: "/#route-inventory", sectionId: "live", deliveryStep: 9, category: "consultation" },
  { label: "Puja Booking", href: "/#route-inventory", sectionId: "puja", deliveryStep: 10, category: "marketplace" },
  { label: "Astro Store", href: "/#route-inventory", sectionId: "store", deliveryStep: 10, category: "marketplace" },
  { label: "Become an Astrologer", href: "/#route-inventory", sectionId: "become-an-astrologer", deliveryStep: 4, category: "marketplace" },
] as const;

export const MOBILE_BOTTOM_TABS = [
  { id: "home", label: "Home", href: "/" },
  { id: "chat", label: "Chat", href: "/#route-inventory" },
  { id: "call", label: "Call", href: "/#route-inventory" },
  { id: "live", label: "Live", href: "/#route-inventory" },
  { id: "profile", label: "Profile", href: "/#system-status" },
] as const;

export const ASTROLOGY_SPECIALISATIONS = [
  "Vedic Astrology",
  "Tarot Reading",
  "Numerology",
  "Palmistry",
  "Vastu Shastra",
  "Lal Kitab",
  "Nadi Astrology",
  "KP Astrology",
  "Prashna Kundli",
  "Western Astrology",
  "Relationship Guidance",
  "Marriage Consultation",
  "Career Consultation",
  "Business Guidance",
  "Spiritual Guidance",
] as const;

export const DEFAULT_RECHARGE_PACKAGES_INR = [100, 200, 500, 1000, 2000] as const;

export const CONSULTATION_STATES = [
  "REQUESTED",
  "ACCEPTED",
  "CONNECTING",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
  "DISCONNECTED",
  "FAILED",
  "REFUNDED",
] as const;

export type ConsultationState = (typeof CONSULTATION_STATES)[number];

export interface RouteEntry {
  path: string;
  surface: "Public Web" | "Customer App" | "Partner App" | "Super Admin" | "REST API v1" | "Socket.IO";
  description: string;
  step: number;
  status: "live" | "planned";
}

export const ROUTE_INVENTORY: readonly RouteEntry[] = [
  { path: "/", surface: "Public Web", description: "Enterprise Brand & Design System Foundation (Full Homepage in Step 2)", step: 1, status: "live" },
  { path: "/chat-with-astrologer", surface: "Public Web", description: "Chat astrologer directory with search, filters & real-time availability", step: 2, status: "planned" },
  { path: "/talk-to-astrologer", surface: "Public Web", description: "Audio consultation astrologer marketplace", step: 2, status: "planned" },
  { path: "/video-consultation", surface: "Public Web", description: "Video consultation astrologer marketplace", step: 2, status: "planned" },
  { path: "/astrologer/[slug]", surface: "Public Web", description: "Verified astrologer public profile, pricing & genuine reviews", step: 4, status: "planned" },
  { path: "/free-kundli", surface: "Public Web", description: "Deterministic Janam Kundli, Lagna, Navamsa & Dasha calculator", step: 9, status: "planned" },
  { path: "/kundli-matching", surface: "Public Web", description: "Ashtakoot Guna Milan & Dosha compatibility analysis", step: 9, status: "planned" },
  { path: "/horoscope", surface: "Public Web", description: "Daily, weekly, monthly & yearly horoscopes for 12 zodiac signs", step: 9, status: "planned" },
  { path: "/live", surface: "Public Web", description: "One-to-many live astrologer streaming & paid questions", step: 9, status: "planned" },
  { path: "/puja", surface: "Public Web", description: "Spiritual Puja booking marketplace, Sankalp & Prasad tracking", step: 10, status: "planned" },
  { path: "/store", surface: "Public Web", description: "NAMH ASTRO Store for Rudraksha, Gemstones, Yantra & Samagri", step: 10, status: "planned" },
  { path: "/become-an-astrologer", surface: "Public Web", description: "Astrologer registration, KYC document upload & verification workflow", step: 4, status: "planned" },
  { path: "/account/*", surface: "Customer App", description: "26-module Customer Dashboard (Profile, Birth Details, Wallet, History, Orders)", step: 3, status: "planned" },
  { path: "/partner/*", surface: "Partner App", description: "Astrologer Partner Dashboard (Toggles, Queue, Kundli Viewer, Earnings, Payouts)", step: 4, status: "planned" },
  { path: "/admin/*", surface: "Super Admin", description: "Enterprise RBAC Admin Panel (12 sidebar modules, CMS, Finance, Audit Logs)", step: 11, status: "planned" },
  { path: "GET /api/v1/health", surface: "REST API v1", description: "Runtime, database & service health diagnostics", step: 1, status: "live" },
  { path: "GET /api/v1/docs", surface: "REST API v1", description: "OpenAPI 3.1 contract specification", step: 1, status: "live" },
  { path: "GET /api/v1/meta/architecture", surface: "REST API v1", description: "System architecture & execution roadmap metadata", step: 1, status: "live" },
  { path: "GET /api/v1/meta/routes", surface: "REST API v1", description: "Machine-readable complete route inventory", step: 1, status: "live" },
  { path: "/ws/chat | /ws/call | /ws/live | /ws/presence", surface: "Socket.IO", description: "Real-time chat, WebRTC signaling, live streaming & availability", step: 6, status: "planned" },
] as const;

export const EXECUTION_STEPS = [
  { step: 1, title: "Audit, Architecture, Route Inventory & UI/UX Foundation", status: "in_progress" },
  { step: 2, title: "Public Desktop Website, Mobile Website & Customer App Interface", status: "pending" },
  { step: 3, title: "Customer Auth, Profile, Birth Details & Customer Dashboard", status: "pending" },
  { step: 4, title: "Astrologer Onboarding, KYC Approval, Public Profiles & Partner App", status: "pending" },
  { step: 5, title: "Wallet, Razorpay Payments, Invoices & Immutable Ledger", status: "pending" },
  { step: 6, title: "Real-Time Chat Engine, Session FSM & Server-Side Billing", status: "pending" },
  { step: 7, title: "Audio & Video WebRTC Calls, Waiting Queues & Appointments", status: "pending" },
  { step: 8, title: "Astrologer Earnings, Commission Rules & Payout Settlements", status: "pending" },
  { step: 9, title: "Kundli, Horoscope, Panchang, Matching & Live Streaming", status: "pending" },
  { step: 10, title: "Puja Booking, Astro Store, Referrals & Marketing Promotions", status: "pending" },
  { step: 11, title: "Super Admin Panel, Staff CRM, Notifications, Reports & CMS", status: "pending" },
  { step: 12, title: "Security Audit, Reconciliation Tests, Production Deploy & Signed Apps", status: "pending" },
] as const;
