# NAMH ASTRO — Step 1 Infrastructure, Workspace & Database Audit Report

**Audit Date:** 2026-11-24  
**Workspace Path:** `c:\xampp\htdocs\projects\namhastro.com`  
**Target Production Domain:** `https://namhastro.com`

---

## 1. Existing Project & Codebase Audit

| Check | Result | Action Required |
|---|---|---|
| Workspace Directory Contents | Empty greenfield directory (0 files, 0 folders) | Initialize clean enterprise monorepo (`apps/web`, `apps/api`, `packages/shared`, mobile app workspaces) |
| Legacy CMS / WordPress / Templates | None found | Build 100% original TypeScript + Next.js + Node.js/Express + Prisma architecture |
| Git Repository | Not yet initialized | Initialize Git with `.gitignore` protecting `.env`, uploads, and build artifacts |

## 2. Existing Database & Production Data Audit

| Check | Result | Action Required |
|---|---|---|
| Local Database Binary | MariaDB `10.4.32` (`C:\xampp\mysql\bin\mysql.exe`) | Compatible with Prisma MySQL provider |
| Local DB Service Status | Stopped (`ERROR 2002` on `127.0.0.1:3306`) | Start XAMPP MySQL or provision MySQL 8.0+ before executing `prisma migrate deploy` |
| Existing `namhastro` Schema | **Not present** in `C:\xampp\mysql\data` | Safe to create fresh `namhastro` database; zero legacy customer/astrologer/wallet records at risk |

## 3. Local Runtime & Tooling Audit

| Component | Version / Status | Notes |
|---|---|---|
| Node.js | `v24.16.0` | Meets and exceeds LTS requirements |
| npm | `11.13.0` (`npm.cmd`) | PowerShell `.ps1` execution policy restricted; use `.cmd` shims on Windows |
| pnpm | `12.3.4` (`pnpm.cmd`) | Ideal for workspace monorepo management |
| Git | `2.55.0.windows.5` | Available |
| Redis | Not installed locally | Required in Step 6/7 for Socket.IO adapter, session queues, and rate limiting |
| Postman CLI | Not installed locally | OpenAPI 3.1 spec exposed at `/api/v1/docs` and `docs/openapi.json` |

## 4. Pending Third-Party Credentials & Integrations (Required in Future Steps)

No third-party integrations are mocked or marked complete in Step 1. The following credentials will be required as their respective steps are reached:

1. **MySQL 8.0+ / MariaDB** (`DATABASE_URL`) — Required to apply migrations live (Step 1 schema & migration SQL prepared).
2. **Redis** (`REDIS_URL`) — Required for OTP rate limiting, Socket.IO pub/sub, and consultation queues (Steps 3, 6, 7).
3. **SMS / OTP Provider** (MSG91 / Twilio / AWS SNS) — Required for real mobile OTP verification (Step 3).
4. **OAuth Providers** (Google OAuth Client ID/Secret, Apple Sign-In) — Required for social login (Step 3).
5. **SMTP Email Provider** (AWS SES / SendGrid / Postmark) — Required for transactional emails and verification (Step 3, 11).
6. **Payment Gateway & Payouts** (Razorpay Live/Test Keys, Webhook Secret, RazorpayX) — Required for wallet recharges and astrologer settlements (Steps 5, 8).
7. **WebRTC / RTC Provider** (Agora / LiveKit / 100ms) — Required for real-time audio, video, and live streaming (Steps 7, 9).
8. **Astrology Calculation Engine / API** (Swiss Ephemeris / Prokerala / VedicAstro API) — Required for deterministic Kundli, Matching, Panchang, and Horoscope (Step 9).
9. **Firebase Cloud Messaging (FCM)** — Required for Android, iOS, and Web push notifications (Steps 4, 11).
10. **Object Storage (S3 / Cloudflare R2 / GCS)** — Required for private KYC documents, astrologer photos, product images, and invoice PDFs (Steps 4, 10).
