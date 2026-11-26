"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock, HelpCircle, RotateCcw, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function RefundPolicyPage() {
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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Refund &amp; Settlement Policy</span>
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
              <RotateCcw size={14} /> 100% Devotee Satisfaction Commitment
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Refund, Dispute &amp; Settlement Policy
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Last Updated: November 26, 2026 · Transparent per-minute billing with guaranteed rapid resolutions for dropped calls or unsatisfactory sessions.
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="container" style={{ marginTop: "2.5rem" }}>
          <div className="surface-card" style={{ maxWidth: "850px", margin: "0 auto", padding: "2.5rem", backgroundColor: "#FFFFFF", lineHeight: 1.8, color: "#444", fontSize: "0.92rem" }}>
            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "0 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              1. 60-Second Instant Drop Guarantee
            </h2>
            <p>
              We understand network fluctuations can occur. If an audio or video call disconnects within the <strong>first 60 seconds</strong> of connection, our automated billing engine cancels the session with <strong>zero deduction</strong>. 100% of your reserved wallet funds are automatically unlocked immediately.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              2. Eligibility for Consultation Refunds
            </h2>
            <p>
              A complete or partial refund credit to your Devotee Wallet will be granted under the following circumstances:
            </p>
            <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
              <li><strong>Severe Audio/Video Disturbance:</strong> Agora RTC network jitter or packet loss exceeding 40% rendering the conversation unintelligible.</li>
              <li><strong>Astrologer Inactivity:</strong> The astrologer failed to respond, remained silent, or was unresponsive during the active consultation timer.</li>
              <li><strong>Incomplete Paid Report:</strong> Personalised PDF reports not delivered within the promised 24–48 hour delivery timeline.</li>
              <li><strong>Duplicate Recharge:</strong> Unintentional multiple payments debited through UPI or payment gateway for a single recharge request.</li>
            </ul>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              3. Online Puja Booking Cancellations
            </h2>
            <p>
              Online Puja rituals involve temple logistics, offering preparations, and assigning Vedic priests:
            </p>
            <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
              <li><strong>Before Priest Assignment:</strong> Full 100% refund credited back to your original payment method or Devotee Wallet.</li>
              <li><strong>After Priest Assignment &amp; Sankalp Preparation:</strong> 50% refund, as sacred samagri and temple booking slots have been locked.</li>
              <li><strong>Post-Puja Ceremony:</strong> Once the ritual is solemnized with video proof, refunds cannot be processed.</li>
            </ul>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              4. Astro Store Gemstone &amp; Product Returns
            </h2>
            <p>
              All physical merchandise (energized gemstones, Rudrakshas, Yantras) are backed by our <strong>7-Day Transit Replacement Guarantee</strong>. If an item arrives damaged, defective, or with an unsealed laboratory certification certificate, notify support@namhastro.com within 7 days of delivery for a free courier exchange or full refund.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              5. Dispute Filing &amp; Resolution SLA
            </h2>
            <p>
              To claim a refund, click &quot;Report Issue&quot; on your consultation log in <strong>/account</strong> or email support@namhastro.com with your consultation ID. Our operations team reviews the server logs and resolves all verified claims within <strong>2 to 4 business hours</strong>.
            </p>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#777" }}>Dispute Desk: <strong>refunds@namhastro.com</strong></span>
              <Link href="/contact" className="btn btn-outline btn-sm">
                File a Support Dispute →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
