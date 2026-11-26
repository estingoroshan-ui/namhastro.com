"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  Lock,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "1140px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>About NAMH ASTRO</span>
          </div>

          {/* Hero Section */}
          <div
            style={{
              background: "linear-gradient(135deg, #351044 0%, #240B32 100%)",
              borderRadius: "var(--radius-lg)",
              padding: "3.5rem 2rem",
              textAlign: "center",
              color: "#FFFFFF",
              border: "1px solid rgba(212, 168, 79, 0.35)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              marginBlockEnd: "3.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1rem",
                borderRadius: "999px",
                background: "rgba(212, 168, 79, 0.15)",
                border: "1px solid rgba(212, 168, 79, 0.4)",
                color: "#F2C96B",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBlockEnd: "1.25rem",
              }}
            >
              <Sparkles size={16} /> Authentic Vedic Heritage
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBlockEnd: "1rem",
                lineHeight: 1.2,
              }}
            >
              Bridging Sacred Wisdom With <span style={{ color: "#F2C96B" }}>Modern Technology</span>
            </h1>

            <p
              style={{
                maxWidth: "750px",
                marginInline: "auto",
                fontSize: "1.05rem",
                color: "rgba(255, 255, 255, 0.88)",
                lineHeight: 1.6,
                marginBlockEnd: "2rem",
              }}
            >
              NAMH ASTRO is India&apos;s premier spiritual and astrological marketplace. We empower millions of seekers
              worldwide to navigate life&apos;s most vital decisions through verified Vedic scholars, state-of-the-art
              real-time consultations, and genuine spiritual remedies.
            </p>

            {/* Quick Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.5rem",
                maxWidth: "900px",
                marginInline: "auto",
                borderTop: "1px solid rgba(212, 168, 79, 0.25)",
                paddingTop: "2rem",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "#F2C96B" }}>500+</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>Verified Astrologers</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "#F2C96B" }}>1,00,000+</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>Consultations Completed</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "#F2C96B" }}>4.9 / 5.0</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>Average Devotee Rating</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "#F2C96B" }}>100%</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>Confidential &amp; Secure</div>
              </div>
            </div>
          </div>

          {/* Our Core Pillars */}
          <div style={{ marginBlockEnd: "3.5rem" }}>
            <div style={{ textAlign: "center", marginBlockEnd: "2.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)", marginBlockEnd: "0.5rem" }}>
                Why Devotees Trust NAMH ASTRO
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                Our 4 foundational commitments to authentic guidance and technology excellence
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              <div
                style={{
                  background: "#FFFFFF",
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.2)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", marginBlockEnd: "1rem" }}>
                  <ShieldCheck size={26} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  Strict 4-Tier Astrologer Vetting
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  Every astrologer undergoes government ID verification, Vedic academic credential checks, multiple technical interviews with senior Acharyas, and ongoing quality audits.
                </p>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.2)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", marginBlockEnd: "1rem" }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  100% Privacy &amp; Anonymity
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  Your phone number, chat transcripts, and personal questions remain strictly encrypted. Astrologers never see your contact details or phone number.
                </p>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.2)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", marginBlockEnd: "1rem" }}>
                  <Clock size={26} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  Server-Controlled Billing
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  Billing is tracked by our verified enterprise financial ledger to the millisecond. No hidden fees, no unauthorized deductions, and instant automatic refunds if disconnected.
                </p>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.2)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", marginBlockEnd: "1rem" }}>
                  <Award size={26} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  Lab-Certified Products &amp; Pujas
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  All Astro Store rudrakshas, yantras, and gemstones include government-recognized lab certificates. Online Pujas are performed live at sacred kshetras by verified Vedic Pandits.
                </p>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem",
              border: "1px solid rgba(212, 168, 79, 0.2)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2.5rem",
              marginBlockEnd: "3.5rem",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#351044", marginBlockEnd: "1rem" }}>
                Our Sacred Mission
              </h3>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                To preserve and celebrate the timeless wisdom of Brihat Parashara Hora Shastra, Jaimini Sutras,
                and Vedic astronomy by connecting discerning seekers with upright, erudite practitioners. We eliminate
                superstition and extortion through transparent pricing, verified credentials, and compassionate guidance.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#351044", marginBlockEnd: "1rem" }}>
                Our Technology Vision
              </h3>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Powered by high-definition Agora audio &amp; video calling, real-time WebSocket messaging, an exact
                astronomy calculation engine with Chitrapaksha (Lahiri) Ayanamsha, and double-entry financial ledgering,
                NAMH ASTRO delivers an uncompromised spiritual experience anytime, anywhere.
              </p>
            </div>
          </div>

          {/* Action Callout */}
          <div
            style={{
              textAlign: "center",
              padding: "2.5rem",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(53, 16, 68, 0.05) 0%, rgba(212, 168, 79, 0.1) 100%)",
              border: "1px solid rgba(212, 168, 79, 0.3)",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "#351044", marginBlockEnd: "0.75rem" }}>
              Ready to Seek Vedic Clarity?
            </h3>
            <p style={{ color: "var(--color-text-muted)", maxWidth: "550px", marginInline: "auto", marginBlockEnd: "1.5rem" }}>
              Connect with top Vedic astrologers right now via private chat, audio call, or video consultation.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/astrologers?mode=chat"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <MessageCircle size={18} /> Chat with Astrologer
              </Link>
              <Link
                href="/kundli"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: "#FFFFFF",
                  border: "1px solid rgba(212, 168, 79, 0.5)",
                  color: "#351044",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <Compass size={18} /> Free Janam Kundli
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
