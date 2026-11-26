"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, FileText, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function TermsOfServicePage() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: "80vh", backgroundColor: "#FDFBF7", paddingBottom: "4rem" }}>
        {/* Navigation Breadcrumb & Back Bar */}
        <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(212,168,79,0.25)", padding: "0.85rem 0" }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
              <Link href="/" style={{ color: "#351044", fontWeight: 600, textDecoration: "none" }}>Home</Link>
              <ChevronRight size={14} color="#D4A84F" />
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Terms of Service</span>
            </div>
            <Link
              href="/"
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section style={{ background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", color: "#FFFFFF", padding: "2.5rem 0" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(212,168,79,0.5)", color: "#F8D677", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.85rem" }}>
              <Scale size={14} /> Legal Contract &amp; Platform Guidelines
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Terms of Service
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Last Updated: November 26, 2026 · NAMH ASTRO Technologies Private Limited
            </p>
          </div>
        </section>

        {/* Legal Text Content */}
        <section className="container" style={{ marginTop: "2.5rem" }}>
          <div className="surface-card" style={{ maxWidth: "850px", margin: "0 auto", padding: "2.5rem", backgroundColor: "#FFFFFF", lineHeight: 1.8, color: "#444", fontSize: "0.92rem" }}>
            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "0 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              1. Acceptance of Terms &amp; Eligibility
            </h2>
            <p>
              By accessing, browsing, registering an account, or transacting on <strong>https://namhastro.com</strong> (referred to as the &quot;Platform&quot; or &quot;NAMH ASTRO&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. You must be at least 18 years of age or possess legal parental consent in accordance with Indian Contract Act, 1872 to use our consultation services.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              2. Nature of Vedic Consultation Services
            </h2>
            <p>
              NAMH ASTRO acts as a curated digital marketplace connecting devotees with verified independent Vedic astrologers, numerologists, tarot readers, and Vedic pandits. Astrological guidance, horoscope readings, Kundli analyses, and spiritual gemstone advice are faith-based religious sciences grounded in traditional Hindu Vedic scriptures. 
            </p>
            <div style={{ padding: "1rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)", margin: "1rem 0" }}>
              <strong style={{ color: "#351044" }}>Important Disclaimer:</strong> Astrological consultations do not constitute, and should never substitute for, professional medical diagnosis, mental health therapy, certified financial investment advice, or formal legal counsel. Users are urged to exercise independent judgment for life-critical decisions.
            </div>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              3. Devotee Wallet, Pricing &amp; Per-Minute Billing
            </h2>
            <p>
              Consultations via Chat, Audio, and Video are billed on an automated, server-controlled per-minute rate set transparently on each astrologer&apos;s verified profile. Prior to connecting a session, the Platform verifies your Devotee Wallet balance and places a temporary hold equivalent to the minimum duration.
            </p>
            <p>
              Billing begins only after both participant connections have been established via WebSockets or Agora RTC. Billing ceases immediately when either party terminates the call. Unused reserved funds are instantly restored to your Devotee Wallet through our double-entry ledger.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              4. Code of Conduct &amp; Zero Tolerance Policy
            </h2>
            <p>
              Users agree to engage respectfully with astrologers and pandits. The following behaviors warrant immediate account suspension and forfeiture of wallet balances:
            </p>
            <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
              <li>Harassment, abusive language, obscenity, or sexual misconduct during consultations.</li>
              <li>Attempting to solicit personal phone numbers, off-platform payments, or external contact.</li>
              <li>Promoting black magic, illicit acts, or threatening harm against any individual.</li>
              <li>Unauthorized recording or public redistribution of private consultation sessions.</li>
            </ul>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              5. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms or Platform services shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#777" }}>For legal inquiries: legal@namhastro.com</span>
              <Link href="/privacy" className="btn btn-outline btn-sm">
                View Privacy Policy →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
