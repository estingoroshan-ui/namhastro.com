"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Calendar, ChevronRight, Heart, Moon, ShieldCheck, Sparkles, Sun, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ZodiacIllustration } from "@/components/icons/ZodiacIcons";
import { ZODIAC_SIGNS } from "@/data/marketplace";

const HOROSCOPE_DETAILS: Record<string, {
  mood: string;
  love: string;
  career: string;
  health: string;
  luckyColor: string;
  luckyNumber: string;
  shubhTime: string;
}> = {
  aries: {
    mood: "Energized & Resolute",
    love: "Honest communication with your partner resolves past misunderstandings. Single Arians may receive an unexpected message from a former acquaintance.",
    career: "Mars empowers your initiative. Favorable day to propose new projects, lead team initiatives, and settle pending administrative approvals.",
    health: "High vitality. Channel excess energy into physical exercise, and avoid overly spicy or stimulating foods in the evening.",
    luckyColor: "Crimson Red & Golden Ochre",
    luckyNumber: "9 and 18",
    shubhTime: "08:30 AM – 10:15 AM",
  },
  taurus: {
    mood: "Harmonious & Grounded",
    love: "Venus enhances romantic intimacy. A peaceful dinner or thoughtful gesture creates enduring marital warmth.",
    career: "Financial decisions favor steady investments. Long-term commercial contracts and real estate matters gain stability today.",
    health: "Protect your throat and neck from seasonal chills. Herbal warm infusions provide comforting relief.",
    luckyColor: "Ivory White & Emerald Green",
    luckyNumber: "6 and 24",
    shubhTime: "02:15 PM – 04:00 PM",
  },
  gemini: {
    mood: "Curious & Communicative",
    love: "Intellectual banter stimulates deep connection. Keep promises and clarify schedules to avoid minor domestic misalignments.",
    career: "Mercury sharpens your analytical skills. Excellent day for negotiations, digital marketing campaigns, and content publishing.",
    health: "Nervous exhaustion may surface if multitasking excessively. Practice 10 minutes of deep pranayama.",
    luckyColor: "Bright Yellow & Mint Green",
    luckyNumber: "5 and 14",
    shubhTime: "11:00 AM – 12:45 PM",
  },
  cancer: {
    mood: "Intuitive & Caring",
    love: "Family gatherings bring profound contentment. Express gratitude to elders and nurture bonds with your children or spouse.",
    career: "Your empathy aids in client retention. Sensitive business transactions should be handled with written clarity.",
    health: "Emotional balance influences digestion. Prefer freshly cooked satvik meals over refrigerated food.",
    luckyColor: "Pearl White & Silver",
    luckyNumber: "2 and 11",
    shubhTime: "09:00 AM – 10:30 AM",
  },
  leo: {
    mood: "Magnificent & Generous",
    love: "The Sun bestows magnetic attraction. Share recognition with your companion to ensure balanced domestic joy.",
    career: "Executive decisions yield immediate respect. A senior stakeholder or mentor offers constructive career endorsement.",
    health: "Cardiovascular stamina is strong. Ensure proper hydration and balance sunlight exposure.",
    luckyColor: "Royal Gold & Saffron",
    luckyNumber: "1 and 19",
    shubhTime: "10:30 AM – 12:00 PM",
  },
  virgo: {
    mood: "Meticulous & Purposeful",
    love: "Constructive support strengthens romantic trust. Avoid unnecessary criticism and celebrate simple mutual victories.",
    career: "Flawless audit of documents, legal papers, and ledger accounts. Your attention to detail prevents costly errors.",
    health: "Digestive sensitivity requires mindful chewing and avoidance of irregular meal intervals.",
    luckyColor: "Forest Green & Sandalwood",
    luckyNumber: "5 and 23",
    shubhTime: "03:30 PM – 05:00 PM",
  },
  libra: {
    mood: "Balanced & Aesthetic",
    love: "Romantic equilibrium prevails. Diplomatic resolutions bring ease to strained relationship boundaries.",
    career: "Collaborative joint ventures, creative partnerships, and public relations initiatives bear fruitful prospects.",
    health: "Lower back ergonomics need attention during prolonged desk hours. Take brief stretch pauses.",
    luckyColor: "Pastel Pink & Sky Blue",
    luckyNumber: "6 and 15",
    shubhTime: "01:00 PM – 02:30 PM",
  },
  scorpio: {
    mood: "Penetrating & Transformative",
    love: "Intense emotional loyalty. Transparent dialogue dissolves unspoken anxieties between romantic partners.",
    career: "Favorable day for research, confidential agreements, and strategic problem-solving. Keep blueprints private.",
    health: "Reproductive and pelvic wellness benefits from adequate hydration and mindful rest cycles.",
    luckyColor: "Deep Maroon & Rust Gold",
    luckyNumber: "9 and 27",
    shubhTime: "07:15 AM – 08:45 AM",
  },
  sagittarius: {
    mood: "Expansive & Philosophical",
    love: "Shared spiritual or philosophical pursuits deepen conjugal happiness. Plan a sacred temple visit together.",
    career: "Jupiter inspires visionary breakthroughs. Academic pursuits, higher certification, and international trade flourish.",
    health: "Thigh and hip flexibility benefits from light yoga stretches. Avoid overeating sugary treats.",
    luckyColor: "Sunflower Yellow & Royal Purple",
    luckyNumber: "3 and 12",
    shubhTime: "11:30 AM – 01:15 PM",
  },
  capricorn: {
    mood: "Disciplined & Industrious",
    love: "Steadfast devotion comforts your loved ones. Practical support demonstrates affection more powerfully than words.",
    career: "Saturn rewards methodical perseverance. Construction, manufacturing, and long-range infrastructure goals advance.",
    health: "Knees and joints require gentle warming before morning routines. Calcium-rich diet recommended.",
    luckyColor: "Charcoal Grey & Navy Blue",
    luckyNumber: "8 and 17",
    shubhTime: "04:00 PM – 05:30 PM",
  },
  aquarius: {
    mood: "Innovative & Humanistic",
    love: "Unconventional solutions revitalize romance. Value freedom and intellectual space in close relationships.",
    career: "Technology, networking, and collective team projects thrive. Unorthodox concepts find surprising traction.",
    health: "Circulation in ankles and calves benefits from regular evening strolls. Maintain sleep rhythm.",
    luckyColor: "Electric Blue & Platinum",
    luckyNumber: "4 and 22",
    shubhTime: "05:00 PM – 06:30 PM",
  },
  pisces: {
    mood: "Spiritual & Compassionate",
    love: "Unconditional empathy heals domestic hearts. Intuitive understanding of partner's unvoiced feelings.",
    career: "Creative imagination and spiritual commerce excel. Charitable undertakings receive community blessings.",
    health: "Foot reflexology and soothing warm baths alleviate lymphatic fatigue. Restful sleep is essential.",
    luckyColor: "Sea Green & Haldi Yellow",
    luckyNumber: "3 and 21",
    shubhTime: "08:00 AM – 09:30 AM",
  },
};

export default function DailyHoroscopePage() {
  const [selectedSignId, setSelectedSignId] = useState<string>("aries");
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");

  const sign = ZODIAC_SIGNS.find((z) => z.id === selectedSignId) || ZODIAC_SIGNS[0];
  const details = HOROSCOPE_DETAILS[selectedSignId] || HOROSCOPE_DETAILS.aries;

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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Daily Horoscope</span>
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
              <Sun size={14} /> Vedic Rashifal · 12 Rashis
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Today&apos;s Horoscope &amp; Planetary Transits
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Read authentic daily Vedic astrological forecasts calculated from transit Moon and planetary aspects. Select your Rashi below to reveal guidance on love, career, finances, and well-being.
            </p>
          </div>
        </section>

        {/* 12 Zodiac Sign Picker Grid */}
        <section className="container" style={{ marginTop: "2rem" }}>
          <div className="zodiac-grid" style={{ marginBottom: "2rem" }}>
            {ZODIAC_SIGNS.map((z) => {
              const isSelected = z.id === selectedSignId;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedSignId(z.id)}
                  className="surface-card"
                  style={{
                    padding: "0.9rem 0.6rem",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderColor: isSelected ? "#351044" : "rgba(212,168,79,0.3)",
                    backgroundColor: isSelected ? "#FFF6E5" : "#FFFFFF",
                    boxShadow: isSelected ? "0 4px 12px rgba(53,16,68,0.15)" : "none",
                    transform: isSelected ? "translateY(-2px)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ZodiacIllustration sign={z.id} />
                  <strong style={{ fontSize: "0.9rem", color: "#351044" }}>{z.name}</strong>
                  <span style={{ fontSize: "0.78rem", color: "#D4A84F", fontFamily: "var(--font-hi, sans-serif)", fontWeight: 600 }}>
                    {z.hindi}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#777" }}>{z.dates}</span>
                </button>
              );
            })}
          </div>

          {/* Horoscope Detail View */}
          <div className="surface-card" style={{ padding: "2rem", backgroundColor: "#FFFFFF" }}>
            {/* Header & Tabs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(212,168,79,0.25)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <ZodiacIllustration sign={sign.id} />
                <div>
                  <h2 style={{ fontSize: "1.6rem", color: "#351044", margin: 0, fontFamily: "var(--font-serif, serif)" }}>
                    {sign.name} ({sign.hindi}) — {timeframe === "daily" ? "Today's Guidance" : timeframe === "weekly" ? "Weekly Outlook" : "Monthly Forecast"}
                  </h2>
                  <span style={{ fontSize: "0.82rem", color: "#666" }}>
                    Dates: <strong>{sign.dates}</strong> · Element: <strong>{sign.element}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["daily", "weekly", "monthly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`btn btn-sm ${timeframe === t ? "btn-purple" : "btn-outline"}`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
              <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                <div style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", fontWeight: 600 }}>Cosmic Vibe &amp; Mood</div>
                <strong style={{ fontSize: "0.95rem", color: "#351044" }}>{details.mood}</strong>
              </div>
              <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                <div style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", fontWeight: 600 }}>Lucky Colors</div>
                <strong style={{ fontSize: "0.95rem", color: "#351044" }}>{details.luckyColor}</strong>
              </div>
              <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                <div style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", fontWeight: 600 }}>Lucky Numbers</div>
                <strong style={{ fontSize: "0.95rem", color: "#351044" }}>{details.luckyNumber}</strong>
              </div>
              <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                <div style={{ fontSize: "0.75rem", color: "#777", textTransform: "uppercase", fontWeight: 600 }}>Shubh Muhurat Time</div>
                <strong style={{ fontSize: "0.95rem", color: "#2E7D32" }}>{details.shubhTime}</strong>
              </div>
            </div>

            {/* Detailed Predictions */}
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {/* Love & Relationships */}
              <div style={{ padding: "1.25rem", borderRadius: "8px", backgroundColor: "#FFF5F7", border: "1px solid #FED7E2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <Heart size={18} color="#E53E3E" />
                  <h3 style={{ fontSize: "1.05rem", color: "#9B2C2C", margin: 0 }}>Love, Marriage &amp; Relationships</h3>
                </div>
                <p style={{ fontSize: "0.88rem", color: "#742A2A", lineHeight: 1.6, margin: 0 }}>{details.love}</p>
              </div>

              {/* Career & Finances */}
              <div style={{ padding: "1.25rem", borderRadius: "8px", backgroundColor: "#F0FFF4", border: "1px solid #C6F6D5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <Briefcase size={18} color="#2F855A" />
                  <h3 style={{ fontSize: "1.05rem", color: "#22543D", margin: 0 }}>Career, Business &amp; Wealth</h3>
                </div>
                <p style={{ fontSize: "0.88rem", color: "#276749", lineHeight: 1.6, margin: 0 }}>{details.career}</p>
              </div>

              {/* Health & Vitality */}
              <div style={{ padding: "1.25rem", borderRadius: "8px", backgroundColor: "#F7FAFC", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <Zap size={18} color="#4A5568" />
                  <h3 style={{ fontSize: "1.05rem", color: "#2D3748", margin: 0 }}>Health &amp; Energy Alignment</h3>
                </div>
                <p style={{ fontSize: "0.88rem", color: "#4A5568", lineHeight: 1.6, margin: 0 }}>{details.health}</p>
              </div>
            </div>

            {/* Direct Astrologer Callout */}
            <div style={{ marginTop: "2rem", padding: "1.5rem", background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", borderRadius: "10px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h4 style={{ margin: "0 0 0.3rem", color: "#FFFFFF", fontSize: "1.15rem" }}>
                  Have questions about your {sign.name} transit?
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                  Connect with verified Vedic astrologers for custom Janam Kundli analysis and personalized remedies.
                </p>
              </div>
              <Link href="/astrologers" className="btn btn-gold" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
                Consult an Astrologer <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
