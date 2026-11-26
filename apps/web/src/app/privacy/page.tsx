"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Database, Lock, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PrivacyPolicyPage() {
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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Privacy Policy</span>
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
              <Lock size={14} /> DPDP Act 2023 &amp; Global Privacy Standards
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Privacy &amp; Data Protection Policy
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Last Updated: November 26, 2026 · We protect your sacred birth information and personal communications with zero compromises.
            </p>
          </div>
        </section>

        {/* Policy Body */}
        <section className="container" style={{ marginTop: "2.5rem" }}>
          <div className="surface-card" style={{ maxWidth: "850px", margin: "0 auto", padding: "2.5rem", backgroundColor: "#FFFFFF", lineHeight: 1.8, color: "#444", fontSize: "0.92rem" }}>
            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "0 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              1. Our Privacy Commitment
            </h2>
            <p>
              NAMH ASTRO Technologies Private Limited (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) holds the privacy and sanctity of our devotees in the highest regard. This Privacy Policy details how we collect, process, encrypt, and safeguard your personal information across our website (<strong>https://namhastro.com</strong>) and mobile applications.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              2. Information We Collect
            </h2>
            <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
              <li><strong>Personal Profile:</strong> Full name, phone number, email address, gender, and preferred language.</li>
              <li><strong>Astrological Birth Data:</strong> Date of birth, exact birth time, and geographic birth coordinates used strictly for Vedic Janam Kundli calculations.</li>
              <li><strong>Consultation Metadata:</strong> Session timestamps, call duration, per-minute billing logs, and chat messages encrypted in transit and at rest.</li>
              <li><strong>Transaction Data:</strong> Payment gateway tokens, Razorpay payment IDs, and double-entry wallet ledger records (we never store debit/credit card numbers or CVV).</li>
            </ul>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              3. Strict Masking &amp; Calling Privacy (Agora WebRTC)
            </h2>
            <div style={{ padding: "1.25rem", backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: "8px", margin: "1rem 0" }}>
              <strong style={{ color: "#22543D", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={18} /> Zero Contact Sharing Guarantee
              </strong>
              <p style={{ margin: "0.4rem 0 0", color: "#276749", fontSize: "0.88rem" }}>
                Your personal phone number is NEVER revealed to astrologers or pandits. Audio and video consultations are conducted using short-lived cryptographically signed tokens generated by our server over Agora WebRTC. Astrologers identify you solely by your chosen devotee display name.
              </p>
            </div>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              4. Data Security &amp; Encryption Standards
            </h2>
            <p>
              All communication between your device and our backend is encrypted using TLS 1.3 protocol. Sensitive records, birth charts, and user tokens are stored with AES-256 military-grade encryption within firewalled MariaDB and Redis instances hosted in certified tier-4 Indian data centers.
            </p>

            <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "1.75rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              5. Your Rights Under DPDP Act 2023
            </h2>
            <p>
              As a Data Principal under India&apos;s Digital Personal Data Protection Act 2023, you retain absolute authority over your personal information:
            </p>
            <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
              <li><strong>Right to Access:</strong> View and export your complete birth charts and wallet transaction history.</li>
              <li><strong>Right to Rectification:</strong> Update inaccurate birth times, places, or contact details at any time.</li>
              <li><strong>Right to Erasure (Forget Me):</strong> Request complete permanent deletion of your account and records by emailing our Data Protection Officer.</li>
            </ul>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#777" }}>Data Protection Officer: <strong>dpo@namhastro.com</strong></span>
              <Link href="/terms" className="btn btn-outline btn-sm">
                View Terms of Service →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
