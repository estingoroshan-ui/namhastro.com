# NAMH ASTRO — Complete Route & Endpoint Inventory

Every route across Public Web, Customer App, Astrologer Partner Portal/App, Super Admin, REST API v1, and Socket.IO namespaces is inventoried below and mapped to its delivery step.

---

## 1. Public Website & PWA Routes (`apps/web`)

| Route | Purpose | Step |
|---|---|---|
| `/` | Enterprise Homepage (Hero, Services, Astrologers, Zodiac, Kundli, Panchang, Puja, Store, Reviews, FAQ) | Step 1 (Foundation) / Step 2 (Full) |
| `/chat-with-astrologer` | Chat astrologer marketplace with full search & filters | Step 2 |
| `/talk-to-astrologer` | Audio consultation astrologer marketplace | Step 2 |
| `/video-consultation` | Video consultation astrologer marketplace | Step 2 |
| `/astrologer/[slug]` | Full public astrologer profile (bio, skills, pricing, availability, reviews, actions) | Step 4 |
| `/free-kundli` | Free Janam Kundli generator & Lagna/Navamsa/Dasha viewer | Step 9 |
| `/kundli-matching` | Ashtakoot Guna Milan & Dosha matching | Step 9 |
| `/horoscope` | Daily, weekly, monthly, yearly horoscopes (12 zodiac signs) | Step 9 |
| `/horoscope/[sign]` | Individual zodiac sign horoscope detail | Step 9 |
| `/panchang` | Daily Panchang, Tithi, Rahu Kaal, Shubh Muhurat, Festivals | Step 9 |
| `/live` | Live astrologer streaming lobby & schedule | Step 9 |
| `/live/[sessionId]` | Live stream viewer, real-time chat & paid questions | Step 9 |
| `/puja` | Spiritual Puja marketplace & categories | Step 10 |
| `/puja/[slug]` | Puja detail, Sankalp booking & packages | Step 10 |
| `/store` | NAMH ASTRO Store e-commerce catalog | Step 10 |
| `/store/[slug]` | Product detail, variants, certificates, reviews | Step 10 |
| `/store/cart` & `/store/checkout` | Shopping cart, pincode check, address & Razorpay checkout | Step 10 |
| `/become-an-astrologer` | Astrologer registration & KYC onboarding portal | Step 4 |
| `/auth/login` & `/auth/register` | Mobile OTP, Email, Google & Apple authentication | Step 3 |
| `/auth/forgot-password` | Password reset flow | Step 3 |
| `/about`, `/contact`, `/faq`, `/blogs` | CMS-managed informational & SEO pages | Step 2 / Step 11 |
| `/legal/privacy`, `/legal/terms`, `/legal/refund`, `/legal/disclaimer` | Legal, privacy, refund & astrology disclaimer pages | Step 2 / Step 11 |

---

## 2. Customer Dashboard & Mobile App Routes (`/account/*` & `apps/mobile-customer`)

| Route / Screen | Module | Step |
|---|---|---|
| `/account` | Customer Overview & Quick Actions | Step 3 |
| `/account/profile` | My Profile, Preferred Language, Consent | Step 3 |
| `/account/birth-details` | Primary Birth Details & Family Birth Profiles | Step 3 |
| `/account/wallet` | My Wallet, Recharge Packages, Custom Amount | Step 5 |
| `/account/transactions` | Immutable Transaction History & Invoice Downloads | Step 5 |
| `/account/consultations/chat` | Chat History & Active Chat Sessions | Step 6 |
| `/account/consultations/call` | Audio Call History | Step 7 |
| `/account/consultations/video` | Video Consultation History | Step 7 |
| `/account/appointments` | Upcoming & Past Scheduled Appointments | Step 7 |
| `/account/favourites` | Favourite & Followed Astrologers | Step 3 |
| `/account/kundli` | Saved Kundlis, Matching History & Purchased PDF Reports | Step 9 |
| `/account/pujas` | My Puja Bookings, Live Links & Prasad Tracking | Step 10 |
| `/account/orders` | Astro Store Orders, Tracking, Returns & Invoices | Step 10 |
| `/account/addresses` | Saved Shipping Addresses | Step 10 |
| `/account/referrals` & `/account/coupons` | Referral & Rewards, Coupons & Offers | Step 10 |
| `/account/notifications` | Notification Centre | Step 3 / Step 11 |
| `/account/support` | Customer Support Tickets | Step 11 |
| `/account/settings` | Preferences, Privacy, Delete Account, Logout | Step 3 |

Mobile Bottom Navigation Tabs: **`Home` | `Chat` | `Call` | `Live` | `Profile`**

---

## 3. Astrologer Partner Portal & App Routes (`/partner/*` & `apps/mobile-partner`)

| Route / Screen | Module | Step |
|---|---|---|
| `/partner` | Partner Dashboard (Online/Chat/Call/Video toggles, Earnings, Active Session) | Step 4 |
| `/partner/requests` | Incoming Chat, Audio & Video Requests + Waiting Queue | Step 6 / Step 7 |
| `/partner/session/[id]` | Active Consultation Room + Customer Birth Details + Kundli Viewer + Private Notes | Step 6 / Step 7 |
| `/partner/history` | Consultation History & Customer Reviews | Step 6 / Step 7 |
| `/partner/schedule` | Availability Calendar, Working Hours & Leave Management | Step 4 / Step 7 |
| `/partner/rates` | Current Rates & Rate Change Requests | Step 4 |
| `/partner/earnings` | Earnings Report, Commission Breakdown, Settlements, Withdrawals, Bank Accounts, Statements | Step 8 |
| `/partner/live` | Go Live Studio & Live Session History | Step 9 |
| `/partner/followers` | Followers & Notifications | Step 4 |
| `/partner/training` & `/partner/support` | Training Centre & Partner Support Tickets | Step 4 / Step 11 |
| `/partner/settings` | Profile Settings & Logout | Step 4 |

---

## 4. Super Admin & Staff CRM Routes (`/admin/*`)

| Route Prefix | Module | Step |
|---|---|---|
| `/admin` | Executive KPI Dashboard (Real-time sessions, revenue, approvals, payouts) | Step 11 |
| `/admin/customers` | All/Active/New/Blocked Customers, Wallets, History | Step 11 |
| `/admin/astrologers` | Applications, KYC Verification, Interviews, Pricing, Commissions, Availability | Step 4 / Step 11 |
| `/admin/consultations` | Active Sessions, History, Queue, Disputes, Failed/Cancelled | Step 6 / Step 11 |
| `/admin/finance` | Ledger, Recharges, Revenue, Payout Approvals, Refunds, GST Invoices, Reconciliation | Step 5 / Step 8 / Step 11 |
| `/admin/astrology` | Kundli Settings, Horoscope, Zodiac, Panchang, Festivals, Reports | Step 9 / Step 11 |
| `/admin/live` | Live Monitoring, Schedules, Moderation, Reported Streams | Step 9 / Step 11 |
| `/admin/puja` | Categories, Pujas, Packages, Pandits, Temples, Bookings, Prasad | Step 10 / Step 11 |
| `/admin/store` | Categories, Products (File Upload), Inventory, Orders, Shipping, Returns, Reviews | Step 10 / Step 11 |
| `/admin/marketing` | Banners, Popups, First-Free Rules, Referrals, Coupons, Campaigns | Step 10 / Step 11 |
| `/admin/cms` | Branding, Header/Footer, FAQs, Testimonials, Blogs, SEO, Policies, Maintenance | Step 11 |
| `/admin/staff` | Staff CRUD, Roles, Custom Permissions, Activity Logs | Step 11 |
| `/admin/security` | Support Tickets, Complaints, Fraud Alerts, Audit Logs, System Health, Backups | Step 11 |

---

## 5. Backend REST API v1 Inventory (`/api/v1/*`)

| Endpoint Group | Routes | Step |
|---|---|---|
| System & Docs | `GET /api/v1/health`, `GET /api/v1/docs`, `GET /api/v1/meta/architecture`, `GET /api/v1/meta/routes` | **Step 1 (Live)** |
| Auth & Profiles | `/api/v1/auth/*` (OTP send/verify, email, OAuth, refresh, logout, delete), `/api/v1/customers/me/*` | Step 3 |
| Astrologers & KYC | `/api/v1/astrologers/*`, `/api/v1/partner/*`, `/api/v1/admin/kyc/*` | Step 4 |
| Wallet & Payments | `/api/v1/wallet/*`, `/api/v1/payments/razorpay/*`, `/api/v1/webhooks/razorpay`, `/api/v1/invoices/*` | Step 5 |
| Consultations & Billing | `/api/v1/consultations/*`, `/api/v1/billing/*`, `/api/v1/appointments/*`, `/api/v1/rtc/token` | Step 6 / Step 7 |
| Settlements & Payouts | `/api/v1/partner/earnings/*`, `/api/v1/partner/withdrawals/*`, `/api/v1/admin/payouts/*` | Step 8 |
| Astrology & Live | `/api/v1/astrology/kundli`, `/matching`, `/panchang`, `/horoscope`, `/api/v1/live/*` | Step 9 |
| Puja, Store & Marketing | `/api/v1/pujas/*`, `/api/v1/store/*`, `/api/v1/coupons/*`, `/api/v1/referrals/*` | Step 10 |
| Admin, CMS & Reports | `/api/v1/admin/*`, `/api/v1/notifications/*`, `/api/v1/reports/export` | Step 11 |

---

## 6. Real-Time Socket.IO Namespaces

- `/ws/chat` — Two-way consultation messaging, typing indicators, delivery/read receipts, attachments, session countdown & billing ticks (Step 6).
- `/ws/call` — Incoming audio/video call signaling, accept/decline/timeout, waiting queue position updates, disconnection grace timers (Step 7).
- `/ws/live` — Live viewer counts, moderated live chat, paid question queue & wallet deduction confirmation (Step 9).
- `/ws/presence` — Astrologer online/busy/offline status broadcasts and admin real-time dashboard KPIs (Step 4 / Step 6).
