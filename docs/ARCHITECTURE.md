# NAMH ASTRO — Enterprise System Architecture

**Domain:** `https://namhastro.com`  
**Stack:** Next.js (TypeScript) · Node.js + Express (TypeScript) · MySQL + Prisma ORM · Socket.IO · Redis · React Native (Customer & Partner Apps) · WebRTC

---

## 1. Monorepo Workspace Layout

```text
namhastro.com/
├── apps/
│   ├── web/                  # Next.js (App Router, TypeScript, PWA) — Public site, Customer Dashboard, Astrologer Portal, Super Admin
│   ├── api/                  # Node.js + Express + TypeScript — REST API v1, Socket.IO gateway, Billing Engine, Prisma ORM
│   ├── mobile-customer/      # React Native (Android & iOS) Customer Application (Step 2+)
│   └── mobile-partner/       # React Native (Android & iOS) Astrologer Partner Application (Step 4+)
├── packages/
│   └── shared/               # Shared TypeScript types, Zod validation schemas, design tokens, route constants, commission math
├── docs/
│   ├── AUDIT_REPORT.md       # Environment & DB audit
│   ├── ARCHITECTURE.md       # This system architecture blueprint
│   └── ROUTE_INVENTORY.md    # Complete web, mobile, admin, REST & Socket.IO route inventory
├── pnpm-workspace.yaml
└── package.json
```

---

## 2. High-Level System Architecture

```text
                        ┌────────────────────────────────────┐
                        │   Cloudflare / Nginx Reverse Proxy │
                        │   TLS 1.3 · WAF · Rate Limiting    │
                        └──────────┬──────────────┬──────────┘
                                   │              │
                 ┌─────────────────▼──┐        ┌──▼──────────────────────┐
                 │  Next.js Web/PWA   │        │  Express API + Socket.IO│
                 │  (namhastro.com)   │◄──────►│  (api.namhastro.com)    │
                 │  - Public Website  │  REST  │  - Auth & RBAC Engine   │
                 │  - Customer App    │  & WS  │  - Wallet & Ledger      │
                 │  - Partner Portal  │        │  - Per-Minute Billing   │
                 │  - Super Admin     │        │  - Consultation FSM     │
                 └────────────────────┘        │  - KYC & Settlements    │
                                               │  - Kundli / Puja / Shop │
                 ┌────────────────────┐        └──┬──────────┬──────────┬┘
                 │ React Native Apps  │───────────┘          │          │
                 │ - Customer (iOS/A) │               ┌──────▼───┐ ┌────▼─────┐
                 │ - Partner  (iOS/A) │               │  MySQL 8 │ │  Redis 7 │
                 └────────────────────┘               │ (Prisma) │ │ Queues & │
                                                      │ Immutable│ │ Sessions │
                                                      │  Ledger  │ │ Pub/Sub  │
                                                      └──────────┘ └──────────┘
                                                             │
                 ┌───────────────────────────────────────────┴──────────────────┐
                 │ External Production Providers (Credential-Gated)             │
                 │ Razorpay/X · WebRTC (Agora/LiveKit) · FCM · SMTP · S3/R2 ·   │
                 │ Swiss Ephemeris/Astrology API · SMS OTP                      │
                 └──────────────────────────────────────────────────────────────┘
```

---

## 3. Core Domain Boundaries

1. **Identity, Auth & RBAC (`auth`)**: Mobile OTP (rate-limited via Redis), Email verification, Google/Apple OAuth, JWT access + rotating HTTP-only refresh tokens, Admin MFA, Role-Based Access Control (`CUSTOMER`, `ASTROLOGER`, `SUPPORT`, `FINANCE`, `VERIFICATION`, `MARKETING`, `SUPER_ADMIN`), and complete audit logging.
2. **Astrologer Onboarding & Verification (`astrologers`)**: Multi-stage KYC workflow (`APPLIED → DOC_VERIFICATION → INTERVIEW → APPROVED → TRAINING → ACTIVE`), private encrypted/signed KYC document storage, availability toggling (`ONLINE`, `BUSY`, `OFFLINE`), and rate-change approval workflow.
3. **Wallet & Double-Entry Immutable Ledger (`wallet`)**: Segregated balances (`paidBalancePaise`, `promoBalancePaise`, `refundBalancePaise`), integer paise arithmetic (zero floating-point rounding drift), idempotency keys on every credit/debit, Razorpay order creation + HMAC signature + webhook verification, GST invoice generation, and reconciliation records.
4. **Consultation State Machine & Server-Side Billing (`consultations`)**:
   - Strict FSM: `REQUESTED → ACCEPTED → CONNECTING → ACTIVE → COMPLETED` (plus `REJECTED`, `CANCELLED`, `EXPIRED`, `DISCONNECTED`, `FAILED`, `REFUNDED`).
   - Billing timer starts strictly on server-confirmed `ACTIVE` transition.
   - Agreed per-minute rate and commission split are locked on the session record at start.
   - Server-side heartbeat deducts/reserves per configured billing interval, prevents negative balances, triggers low-balance alerts, and auto-terminates when credit reaches zero.
5. **Real-Time Communication (`realtime`)**: Socket.IO with Redis adapter for horizontal scaling; two-way chat with delivery/read receipts, attachments, typing indicators; WebRTC backend-minted ephemeral tokens for audio, video, and one-to-many live streaming without exposing personal phone numbers.
6. **Astrology Engine (`astrology`)**: Deterministic calculation service backed by ephemeris/astrology API using exact DOB, TOB, lat/lng, and IANA timezone for Janam Kundli, Navamsa, Dasha, Guna Milan, Panchang, and Horoscopes, paired with mandatory spiritual-guidance disclaimers.
7. **Spiritual Services & Commerce (`puja`, `store`)**: Puja booking, Sankalp details, Pandit assignment, fulfilment media, Prasad tracking; Astro Store catalog, variants, stock locks, pincode serviceability, GST orders, returns, and reviews.
8. **Super Admin & CMS (`admin`)**: Dynamic homepage banners, recharge packs, global & per-astrologer commissions, staff permissions, notification templates, and CSV/Excel/PDF financial reports.

---

## 4. Brand & UI/UX Design System Foundation

- **Palette (Light, Sacred, High-Contrast):**
  - Spiritual White: `#FFFFFF` (primary cards & surfaces)
  - Warm Ivory: `#FAF7F2` (page canvas)
  - Soft Parchment: `#F3ECE1` (subtle section elevation)
  - Sacred Saffron: `#E86A17` (primary CTA & brand accent)
  - Deep Saffron Hover: `#C8550C`
  - Temple Gold: `#C89B3C` (verified badges, borders, celestial accents)
  - Deep Sandalwood: `#2A1E17` (primary ink — WCAG AAA on ivory/white)
  - Muted Ash: `#6B5B53` (secondary ink — WCAG AA+)
  - Emerald Status: `#15803D` (online availability)
- **Typography:**
  - Display / Spiritual Serif: `Cormorant Garamond` (weights 600, 700)
  - UI & Body Sans: `Plus Jakarta Sans` (weights 400, 500, 600, 700)
  - Fluid responsive scale using `clamp()`, `rem` units, and `text-wrap: balance` on headings.
- **Native-Like Mobile Web & PWA:**
  - Compact sticky header with mobile drawer and persistent 5-tab bottom navigation (`Home | Chat | Call | Live | Profile`) respecting `env(safe-area-inset-bottom)`.

---

## 5. Security, Compliance & Operational Standards

- All money stored in **integer paise** (`BIGINT` / `INT`); never floats.
- Zero hardcoded credentials; validated environment configuration at boot via Zod.
- Private KYC files stored outside public webroot with short-lived signed URLs restricted to `VERIFICATION` and `SUPER_ADMIN` roles.
- Mandatory disclaimers on all astrology, Kundli, and Puja pages; no guaranteed outcome claims; no fake ratings, reviews, or fabricated online counts.
- Automated daily MySQL logical backups (`mysqldump` + encrypted offsite upload) and point-in-time recovery runbook (completed in Step 12).
