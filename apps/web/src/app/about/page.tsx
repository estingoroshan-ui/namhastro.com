"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, ChevronRight, Globe, HeartHandshake, Lock, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Verified Vedic Astrologers",
    desc: "Every practitioner undergoes rigorous four-stage screening: Vedic credential validation, Shastric knowledge viva with senior Acharyas, audio/video consultation test calls, and government identity background verification.",
  },
  {
    icon: Lock,
    title: "Sacred Privacy & Anonymity",
    desc: "Your personal details, birth charts, chat transcripts, and audio/video consultations remain strictly confidential. Devotee phone numbers are never shared with astrologers, protected by dual-sided Agora WebRTC tokenization.",
  },
  {
    icon: Award,
    title: "Server-Controlled Honest Billing",
    desc: "No hidden charges or surprise minimums. Our automated real-time financial ledger meters consultations per minute with instant balance reservation and automatic release upon session termination.",
  },
  {
    icon: HeartHandshake,
    title: "Consecrated Spiritual Marketplace",
    desc: "From temple-sanctified Online Pujas performed by authorized Vedic Pandits with live video sankalps to 100% government-certified lab-tested gemstones and authentic Rudraksha beads.",
  },
];

const MILESTONES = [
  { metric: "50,000+", label: "Devotees Served Across India & Worldwide" },
  { metric: "150+", label: "Verified Vedic Astrologers & Acharyas" },
  { metric: "4.92 / 5", label: "Average Consultation Satisfaction Rating" },
  { metric: "100%", label: "Satisfaction & Honest Refund Guarantee" },
];

export default function AboutUsPage() {
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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>About Us</span>
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
        <section style={{ background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", color: "#FFFFFF", padding: "3rem 0" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(212,168,79,0.5)", color: "#F8D677", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.85rem" }}>
              <Sparkles size={14} /> Sacred Vedic Heritage &amp; Modern Technology
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.9rem, 3vw, 2.8rem)", color: "#FFFFFF", marginBottom: "0.85rem" }}>
              About NAMH ASTRO
            </h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "1rem", lineHeight: 1.7 }}>
              Bridging the timeless wisdom of Maharishi Parashara, Jaimini, and Varahamihira with modern real-time WebRTC technology. We connect seekers with authentic Vedic masters for clarity, solace, and spiritual elevation.
            </p>
          </div>
        </section>

        {/* Core Mission Section */}
        <section className="container" style={{ marginTop: "3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#D4A84F", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Our Sacred Purpose
              </span>
              <h2 style={{ fontSize: "2rem", color: "#351044", margin: "0.4rem 0 1rem", fontFamily: "var(--font-serif, serif)", lineHeight: 1.3 }}>
                Restoring Purity &amp; Reverence to Vedic Astrology
              </h2>
              <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                Vedic Astrology (Jyotish) is the eye of the Vedas — a sacred spiritual science intended to guide human consciousness through the karmic crossroads of life. Too often, modern commercial platforms have reduced this profound wisdom to transactional gimmicks and fear-based predictions.
              </p>
              <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                At <strong>NAMH ASTRO</strong>, we stand for authenticity, empathy, and strict ethical standards. Our astrologers do not sell fear; they provide clarity, classical Vedic remedial paths, and spiritual encouragement that empower you to fulfill your highest Dharma.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/astrologers" className="btn btn-gold">
                  Explore Astrologers <ArrowRight size={16} />
                </Link>
                <Link href="/partner" className="btn btn-outline">
                  Join as Astrologer Partner
                </Link>
              </div>
            </div>

            {/* Platform Milestones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {MILESTONES.map((m) => (
                <div key={m.label} className="surface-card" style={{ padding: "1.5rem", textAlign: "center", backgroundColor: "#FFF9F0", borderColor: "rgba(212,168,79,0.3)" }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#351044", fontFamily: "var(--font-serif, serif)", marginBottom: "0.3rem" }}>
                    {m.metric}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Pillars Grid */}
        <section className="container" style={{ marginTop: "4rem" }}>
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 2.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#D4A84F", fontWeight: 700, textTransform: "uppercase" }}>Our Guiding Principles</span>
            <h2 style={{ fontSize: "1.85rem", color: "#351044", margin: "0.3rem 0 0.75rem", fontFamily: "var(--font-serif, serif)" }}>
              Why Thousands of Devotees Trust NAMH ASTRO
            </h2>
            <p style={{ color: "#666", fontSize: "0.92rem" }}>
              Uncompromising dedication to authenticity, privacy, and verifiable results across every consultation and sacred offering.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="surface-card" style={{ padding: "1.75rem", backgroundColor: "#FFFFFF" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    <Icon size={22} color="#D4A84F" />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", color: "#351044", marginBottom: "0.5rem", fontFamily: "var(--font-serif, serif)" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: "0.86rem", color: "#666", lineHeight: 1.6, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing Banner */}
        <section className="container" style={{ marginTop: "4rem" }}>
          <div style={{ background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", borderRadius: "14px", padding: "2.5rem 2rem", textAlign: "center", color: "#FFFFFF" }}>
            <h3 style={{ fontSize: "1.6rem", color: "#FFFFFF", marginBottom: "0.5rem", fontFamily: "var(--font-serif, serif)" }}>
              Experience the Wisdom of Authentic Jyotish
            </h3>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 1.5rem" }}>
              Get answers to questions about career, marriage compatibility, health, and spiritual path with our verified Acharyas today.
            </p>
            <Link href="/astrologers" className="btn btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              Start First Consultation <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
