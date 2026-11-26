"use client";

import Link from "next/link";
import { FileText, ShieldAlert, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Terms of Service</span>
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
                <FileText size={22} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#351044", margin: 0 }}>
                  Terms of Service
                </h1>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Last Updated: November 2026 Â· Effective for all users of namhastro.com
                </span>
              </div>
            </div>

            {/* Statutory Disclaimer Box */}
            <div
              style={{
                marginBlock: "1.5rem",
                padding: "1.25rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(212, 168, 79, 0.08)",
                border: "1px solid rgba(212, 168, 79, 0.35)",
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <ShieldAlert size={22} color="#D4A84F" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
              <div style={{ fontSize: "0.85rem", color: "#351044", lineHeight: 1.5 }}>
                <strong>CRITICAL STATUTORY DISCLAIMER:</strong> Astrology, Janam Kundli analysis, Horoscope readings,
                and Vedic spiritual guidance provided through NAMH ASTRO represent traditional cultural beliefs and
                spiritual interpretations. They do not constitute certified medical, psychiatric, financial, or legal advice.
                NAMH ASTRO disclaims all legal liability for individual life decisions made by users.
              </div>
            </div>

            <div style={{ display: "grid", gap: "1.75rem", color: "#444", fontSize: "0.92rem", lineHeight: 1.65 }}>
              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  1. Acceptance of Terms &amp; Eligibility
                </h2>
                <p>
                  By accessing or registering on NAMH ASTRO (namhastro.com) or downloading our Android application,
                  you confirm that you are at least 18 years of age and legally competent to enter into a binding contract
                  under the Indian Contract Act, 1872. If you are accessing the platform on behalf of another individual,
                  you represent that you possess lawful authority to do so.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  2. Role of NAMH ASTRO as an Intermediary
                </h2>
                <p>
                  NAMH ASTRO operates strictly as an electronic marketplace and communications intermediary under Section 79
                  of the Information Technology Act, 2000. We connect seekers with independent astrologers, Vedic scholars,
                  and Pandits. The opinions, predictions, and remedial guidance shared by astrologers represent their personal
                  professional assessments and not the official endorsement of NAMH ASTRO Technologies Private Limited.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  3. User Accounts &amp; Security
                </h2>
                <p>
                  You agree to provide true, accurate, and current information when registering or creating birth profiles.
                  You are solely responsible for maintaining the confidentiality of your credentials, OTPs, and wallet access.
                  Notify us immediately at support@namhastro.com if you suspect unauthorized access to your account.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  4. Consultation Billing &amp; Financial Ledger
                </h2>
                <p>
                  Consultation rates (Chat, Audio, Video) are set on a per-minute basis in Indian Rupees (INR) and displayed
                  transparently on each astrologer&apos;s profile card prior to initiation. When a session starts, an initial
                  reservation is placed on your wallet balance. Billing is computed by our automated backend server based on
                  active millisecond connections. Promotional wallet balances are consumed prior to real deposit balances.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  5. Code of Conduct &amp; Zero Tolerance
                </h2>
                <p>
                  Both customers and astrologers must maintain mutual respect and dignity. The following behaviors are strictly
                  prohibited and result in immediate termination of account and legal reporting:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.35rem" }}>
                  <li>Harassment, abusive language, obscenity, or sexual misconduct in chat or calls.</li>
                  <li>Asking or sharing personal direct phone numbers, UPI IDs, or off-platform payment methods.</li>
                  <li>Making guarantees regarding lottery outcomes, death, unproven cures for medical illnesses, or black magic.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  6. Intellectual Property
                </h2>
                <p>
                  All proprietary astrology calculation algorithms, user interface designs, logos, graphics, software source
                  code, and brand marks are the exclusive intellectual property of NAMH ASTRO Technologies Private Limited.
                  Any scraping, reverse-engineering, or unauthorized reproduction is strictly prohibited.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  7. Governing Law &amp; Jurisdiction
                </h2>
                <p>
                  These Terms are governed by the laws of India. Any legal dispute, claim, or proceedings arising out of
                  or related to these Terms or platform usage shall be subject to the exclusive jurisdiction of the competent
                  courts in Bengaluru, Karnataka, India.
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
