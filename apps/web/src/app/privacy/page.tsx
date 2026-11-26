"use client";

import Link from "next/link";
import { Database, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem",
              border: "1px solid rgba(212, 168, 79, 0.25)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBlockEnd: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044" }}>
                <Lock size={22} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#351044", margin: 0 }}>
                  Privacy Policy &amp; Data Protection
                </h1>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Compliance: Digital Personal Data Protection Act 2023 (DPDP) &amp; IT Rules 2011
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: "1.75rem", color: "#444", fontSize: "0.92rem", lineHeight: 1.65, marginTop: "1.5rem" }}>
              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  1. Information We Collect
                </h2>
                <p>
                  To provide accurate Vedic astrological insights and seamless communications, we collect:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.35rem" }}>
                  <li><strong>Contact Details:</strong> Full name, phone number, and email address for account creation and OTP authentication.</li>
                  <li><strong>Astrological Parameters:</strong> Date of birth, precise time of birth, birth city, latitude, longitude, and gender (essential for computing planetary longitudes and Janam Kundli Bhavas).</li>
                  <li><strong>Financial Data:</strong> Recharge history, ledger logs, and transaction reference IDs. (Note: We do NOT store credit/debit card numbers or CVV; all payment transactions are tokenized via PCI-DSS certified Razorpay).</li>
                  <li><strong>Consultation Metadata:</strong> Call durations, chat timestamps, and connection health metrics to resolve billing disputes.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  2. Complete Astrologer Anonymity
                </h2>
                <p>
                  Your privacy is sacred. When you initiate an audio call, video consultation, or chat session, our
                  WebRTC Agora proxy ensures that your actual phone number, email address, and real identity are never
                  revealed to the astrologer. The astrologer only sees the birth details you explicitly authorize for Kundli analysis.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  3. Media Encryption &amp; Storage
                </h2>
                <p>
                  Live voice and video streams are transmitted through end-to-end encrypted WebRTC channels. We do not
                  routinely record live calls. If an astrologer or customer requests a quality evaluation or files a dispute,
                  only server metadata is referenced. Chat transcripts are encrypted at rest in our secure MySQL database.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  4. Non-Disclosure &amp; Third-Party Marketing
                </h2>
                <p>
                  We have a strict <strong>Zero Third-Party Data Sale</strong> policy. Your birth chart, personal dilemmas,
                  and contact information will NEVER be sold, rented, or shared with commercial marketing agencies, data brokers,
                  or lead generation firms.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  5. Your Data Rights
                </h2>
                <p>
                  Under Indian privacy regulations, you have the right to:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.35rem" }}>
                  <li>Access your stored birth profiles and consultation history at any time via your Customer Dashboard.</li>
                  <li>Update, correct, or delete individual family birth profiles.</li>
                  <li>Request complete account deletion and erasure of data by emailing support@namhastro.com.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  6. Grievance Officer
                </h2>
                <p>
                  For any privacy inquiries or grievance redressal, please reach out to our appointed Data Privacy Officer:
                  <br />
                  <strong>Email:</strong> privacy@namhastro.com / support@namhastro.com<br />
                  <strong>Address:</strong> NAMH ASTRO Technologies Private Limited, Kailash Vedic Complex, Bengaluru, Karnataka, 560001.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
