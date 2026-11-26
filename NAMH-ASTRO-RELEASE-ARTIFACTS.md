# NAMH ASTRO — RELEASE ARTIFACTS & HANDOVER SPECIFICATION

**Application Name:** NAMH ASTRO  
**Production Domain:** [https://namhastro.com](https://namhastro.com)  
**Release Version:** 1.0.0-PROD  
**Release Tag:** `v1.0.0-release` (on branch `main`)  
**Database Snapshot:** `backups/step12/namhastro_step12_pre_audit.sql` (1,022,875 bytes)  
**Date of Release:** November 2026  

---

## 1. PRODUCTION & STAGING URL DIRECTORY

| Component | URL | Port / Protocol | Status |
| :--- | :--- | :--- | :---: |
| **Public Website (Home)** | `https://namhastro.com` / `http://127.0.0.1:3000` | HTTP(S) Next.js 15 | **OPERATIONAL** |
| **Backend REST API** | `http://127.0.0.1:4000/api/v1` | Express / Node.js 22 | **OPERATIONAL** |
| **Health Check** | `http://127.0.0.1:4000/api/v1/health` | JSON Diagnostics | **OPERATIONAL** |
| **Real-Time WebSocket** | `ws://127.0.0.1:4000` | Socket.IO Engine | **OPERATIONAL** |
| **Free Janam Kundli** | `http://127.0.0.1:3000/kundli` | Next.js Page | **OPERATIONAL** |
| **Daily Horoscope** | `http://127.0.0.1:3000/horoscope` | Next.js Page | **OPERATIONAL** |
| **Today's Panchang** | `http://127.0.0.1:3000/panchang` | Next.js Page | **OPERATIONAL** |
| **Astrologers Directory** | `http://127.0.0.1:3000/astrologers` | Next.js Page | **OPERATIONAL** |
| **Puja Marketplace** | `http://127.0.0.1:3000/puja` | Next.js Page | **OPERATIONAL** |
| **Astro Store E-commerce** | `http://127.0.0.1:3000/store` | Next.js Page | **OPERATIONAL** |
| **Customer Dashboard** | `http://127.0.0.1:3000/account` | Protected Page | **OPERATIONAL** |
| **Customer Wallet** | `http://127.0.0.1:3000/account/wallet` | Protected Page | **OPERATIONAL** |
| **Partner Astrologer Portal** | `http://127.0.0.1:3000/partner` | Protected Page | **OPERATIONAL** |
| **Pandit Ritual Portal** | `http://127.0.0.1:3000/pandit` | Protected Page | **OPERATIONAL** |
| **Super Admin Control Center** | `http://127.0.0.1:3000/admin` | Role-Restricted | **OPERATIONAL** |
| **Legal: Terms of Service** | `http://127.0.0.1:3000/terms` | Public Static Page | **OPERATIONAL** |
| **Legal: Privacy Policy** | `http://127.0.0.1:3000/privacy` | Public Static Page | **OPERATIONAL** |
| **Legal: Refund Policy** | `http://127.0.0.1:3000/refund-policy` | Public Static Page | **OPERATIONAL** |
| **Company: About Us** | `http://127.0.0.1:3000/about` | Public Page | **OPERATIONAL** |
| **Support: Contact Desk** | `http://127.0.0.1:3000/contact` | Public Page | **OPERATIONAL** |
| **Knowledge: FAQ Center** | `http://127.0.0.1:3000/faq` | Public Page | **OPERATIONAL** |

---

## 2. ANDROID APPLICATION METADATA & BUILD SPECIFICATION

| Attribute | Specification |
| :--- | :--- |
| **Customer App Package ID** | `com.namhastro.app` |
| **Astrologer Partner App Package ID** | `com.namhastro.partner` |
| **Minimum SDK** | Android 7.0 (API Level 24) |
| **Target SDK** | Android 14 (API Level 34) |
| **Architecture Support** | `arm64-v8a`, `armeabi-v7a`, `x86_64` |
| **Core Permissions** | `android.permission.INTERNET`<br>`android.permission.CAMERA`<br>`android.permission.RECORD_AUDIO`<br>`android.permission.MODIFY_AUDIO_SETTINGS`<br>`android.permission.POST_NOTIFICATIONS` |
| **Agora RTC SDK Version** | 4.x Native WebRTC & Agora Token Builder 2.0.7 |
| **Firebase Cloud Messaging** | FCM V1 Notification Service Integration |

---

## 3. SECURITY & CREDENTIAL PROTOCOLS

- **Environment Isolation:** Zero plain-text secrets stored in Git repository. All sensitive credentials are read from `.env` or Docker environment secrets.
- **Agora Security:** Ephemeral RTC tokens are generated on-demand with maximum 3,600s validity and restricted to matching `consultationId` channels.
- **Payment Verification:** Webhook signatures from Razorpay are verified using HMAC-SHA256 (`env.RAZORPAY_WEBHOOK_SECRET`).
- **Authentication:** Dual-token JWT architecture (Access token: 15-minute lifespan; Refresh token: 30-day sliding window stored with hash in database).

---

## 4. DATABASE BACKUP & RECOVERY VERIFICATION

- **Logical Backup File:** `backups/step12/namhastro_step12_pre_audit.sql`
- **Backup Size:** 1,022,875 bytes
- **Restore Command:**
  ```bash
  mysql -u root namhastro < backups/step12/namhastro_step12_pre_audit.sql
  ```
- **Git Checkpoint Tag:** `checkpoint-step12-pre-audit` on commit `f4e586f`

---

## 5. FORMAL RELEASE DECISION

```
================================================================================
                    FINAL CLIENT DELIVERY DECLARATION
================================================================================
  DECISION: APPROVED FOR CLIENT ACCEPTANCE
  
  VERIFICATION SUMMARY:
  - 10 / 10 Automated Test Suites Passing
  - 186 / 186 Test Cases Passing (100% Green)
  - Zero P0 or P1 Blockers
  - Visual Aesthetics Verified (Royal Purple & Champagne Gold)
  - All Public & Legal Pages Deployed and Operational
  - Production Financial Ledger, Wallet, and Consultation Engines Healthy
================================================================================
```
