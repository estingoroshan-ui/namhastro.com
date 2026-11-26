"use client";

import Link from "next/link";
import { useState } from "react";
import { Sun, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const ZODIAC_SIGNS = [
  { name: "Aries", hindi: "Mesh", dates: "Mar 21 - Apr 19", element: "Fire", ruler: "Mars", guidance: "Moon in favorable transit inspires dynamic initiative in professional tasks. Avoid hasty financial commitments." },
  { name: "Taurus", hindi: "Vrishabh", dates: "Apr 20 - May 20", element: "Earth", ruler: "Venus", guidance: "Venus bestows domestic harmony and auspicious financial opportunities. Health remains stable." },
  { name: "Gemini", hindi: "Mithun", dates: "May 21 - Jun 20", element: "Air", ruler: "Mercury", guidance: "Intellectual pursuits yield breakthroughs. Effective communication resolves pending family matters." },
  { name: "Cancer", hindi: "Kark", dates: "Jun 21 - Jul 22", element: "Water", ruler: "Moon", guidance: "Spiritual inclinations deepen. Excellent day for devotional prayer, meditation, and seeking ancestral blessings." },
  { name: "Leo", hindi: "Simha", dates: "Jul 23 - Aug 22", element: "Fire", ruler: "Sun", guidance: "Solar vitality enhances executive leadership. Recognition at work likely; maintain humility." },
  { name: "Virgo", hindi: "Kanya", dates: "Aug 23 - Sep 22", element: "Earth", ruler: "Mercury", guidance: "Meticulous attention to detail prevents administrative oversights. Favorable day for health regimens." },
  { name: "Libra", hindi: "Tula", dates: "Sep 23 - Oct 22", element: "Air", ruler: "Venus", guidance: "Balanced planetary energies favor partnership deliberations and business negotiations." },
  { name: "Scorpio", hindi: "Vrishchik", dates: "Oct 23 - Nov 21", element: "Water", ruler: "Mars", guidance: "Transformative planetary aspects awaken spiritual insights. Trust inner intuition in personal matters." },
  { name: "Sagittarius", hindi: "Dhanu", dates: "Nov 22 - Dec 21", element: "Fire", ruler: "Jupiter", guidance: "Jupiterian grace supports higher studies, pilgrimage plans, and long-term investment decisions." },
  { name: "Capricorn", hindi: "Makar", dates: "Dec 22 - Jan 19", element: "Earth", ruler: "Saturn", guidance: "Disciplined perseverance brings tangible career gains. Fulfill elder responsibilities dutifully." },
  { name: "Aquarius", hindi: "Kumbh", dates: "Jan 20 - Feb 18", element: "Air", ruler: "Saturn", guidance: "Innovative ideas receive peer encouragement. Social and humanitarian contributions bring joy." },
  { name: "Pisces", hindi: "Meen", dates: "Feb 19 - Mar 20", element: "Water", ruler: "Jupiter", guidance: "Intuitive and creative faculties are peaked. Charitable deeds attract divine grace and peace of mind." },
];

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SiteHeader />
      <main style={{ flex: 1, backgroundColor: "#FBF7F0", padding: "2rem 1rem" }}>
        <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span className="section-eyebrow" style={{ color: "#D4A84F", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              DAILY CELESTIAL GUIDANCE
            </span>
            <h1 className="serif-heading" style={{ fontSize: "2.2rem", color: "var(--royal-purple, #351044)", margin: "0.3rem 0" }}>
              Today&apos;s Vedic Horoscope (Rashifal)
            </h1>
            <p style={{ color: "var(--ink-muted, #6B7280)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Discover daily astrological predictions, planetary transits, lucky numbers, and Vedic remedies tailored to your Moon Sign.
            </p>
          </div>

          {/* Zodiac Selector Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.6rem", marginBottom: "1.5rem" }}>
            {ZODIAC_SIGNS.map((z) => (
              <button
                key={z.name}
                type="button"
                onClick={() => setSelectedSign(z)}
                style={{
                  padding: "0.65rem 0.5rem",
                  borderRadius: "8px",
                  border: selectedSign.name === z.name ? "2px solid #D4A84F" : "1px solid #E5E7EB",
                  backgroundColor: selectedSign.name === z.name ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                  boxShadow: selectedSign.name === z.name ? "0 4px 12px rgba(212,168,79,0.2)" : "none",
                }}
              >
                <strong style={{ display: "block", fontSize: "0.88rem", color: selectedSign.name === z.name ? "var(--royal-purple)" : "var(--ink)" }}>
                  {z.name}
                </strong>
                <span style={{ fontSize: "0.72rem", color: "#D4A84F", fontWeight: 600 }}>{z.hindi}</span>
              </button>
            ))}
          </div>

          {/* Selected Horoscope Card */}
          <div className="surface-card" style={{ padding: "1.75rem", borderRadius: "10px", backgroundColor: "#FFFFFF", borderLeft: "5px solid var(--royal-purple)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem", borderBottom: "1px solid #F3F4F6", paddingBottom: "0.75rem" }}>
              <div>
                <h2 className="serif-heading" style={{ fontSize: "1.5rem", color: "var(--royal-purple)", margin: 0 }}>
                  {selectedSign.name} ({selectedSign.hindi}) Daily Horoscope
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>{selectedSign.dates} · Ruler: {selectedSign.ruler} · Element: {selectedSign.element}</span>
              </div>
              <span className="status-pill status-online">Today&apos;s Transits</span>
            </div>

            <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--ink)", margin: "0.75rem 0 1.25rem" }}>
              {selectedSign.guidance}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Auspicious Color</span>
                <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>Golden Yellow &amp; Saffron</strong>
              </div>
              <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Lucky Number</span>
                <strong style={{ fontSize: "1rem", color: "#D4A84F" }}>3 and 9</strong>
              </div>
              <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Remedial Advice</span>
                <strong style={{ fontSize: "0.85rem", color: "#059669" }}>Chant Gayatri Mantra 11 times</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <Link href="/astrologers?mode=chat" className="btn btn-purple btn-sm">
                Chat with an Astrologer for {selectedSign.name} <ArrowRight size={14} />
              </Link>
              <Link href="/kundli" className="btn btn-outline btn-sm">
                Check Detailed Kundli
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
