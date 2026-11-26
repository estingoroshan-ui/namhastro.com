"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Flame,
  Gem,
  Hash,
  HeartHandshake,
  LayoutGrid,
  Lock,
  MessageCircle,
  PhoneCall,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Video,
  Zap,
} from "lucide-react";
import { ASTROLOGY_SPECIALISATIONS } from "@namhastro/shared";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AstrologerCard } from "@/components/marketplace/AstrologerCard";
import { ZodiacIllustration } from "@/components/icons/ZodiacIcons";
import {
  ASTROLOGER_SHOWCASE,
  HERO_BANNERS,
  PERSONALISED_REPORTS,
  PUJA_SERVICES,
  STORE_PRODUCTS,
  ZODIAC_SIGNS,
} from "@/data/marketplace";

const SERVICE_CATEGORIES = [
  { title: "Free Kundli", subtitle: "Generate Now", href: "/#free-kundli", icon: LayoutGrid, featured: true },
  { title: "Kundli Matching", subtitle: "For Marriage", href: "/#kundli-matching", icon: HeartHandshake },
  { title: "Daily Horoscope", subtitle: "12 Zodiac Signs", href: "/#daily-horoscope", icon: Sun },
  { title: "Puja Booking", subtitle: "Online & Temple", href: "/#puja-booking", icon: Flame },
  { title: "Live Astrologers", subtitle: "Talk Now", href: "/#live-astrologers", icon: Radio },
  { title: "Astro Store", subtitle: "Gems & Rudraksha", href: "/#astro-store", icon: Gem },
  { title: "Vastu Consultation", subtitle: "Home & Office", href: "/astrologers?speciality=Vastu+Shastra", icon: Compass },
  { title: "Numerology", subtitle: "Name & Number", href: "/astrologers?speciality=Numerology", icon: Hash },
];

export function HomePageView() {
  const router = useRouter();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [finderMode, setFinderMode] = useState<"chat" | "call" | "video">("chat");
  const [concern, setConcern] = useState("Marriage Consultation");
  const [language, setLanguage] = useState("Hindi");
  const [activeSign, setActiveSign] = useState<string>(ZODIAC_SIGNS[0].id);
  const [kundliFeedback, setKundliFeedback] = useState<string | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);

  const currentBanner = HERO_BANNERS[bannerIndex];
  const selectedZodiac = ZODIAC_SIGNS.find((z) => z.id === activeSign) ?? ZODIAC_SIGNS[0];
  const onlineAstrologers = ASTROLOGER_SHOWCASE.filter((a) => a.categoryTags.includes("online")).slice(0, 4);
  const topRatedAstrologers = ASTROLOGER_SHOWCASE.filter((a) => a.categoryTags.includes("top-rated")).slice(0, 4);
  const trendingAstrologers = ASTROLOGER_SHOWCASE.filter((a) => a.categoryTags.includes("trending")).slice(0, 4);

  return (
    <>
      <SiteHeader />

      <main>
        {/* 4. Full-Width 5-Slide Promotional Hero Banner Slider */}
        <section className="hero-slider-wrap" aria-label="Featured Promotions">
          <div className="hero-slide">
            <img
              src={currentBanner.image}
              alt={currentBanner.title}
              className="hero-bg-img"
            />
            <div className="hero-scrim" />

            <div className="container hero-content-grid">
              <div aria-hidden="true" />

              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.3rem 0.85rem",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(212,168,79,0.5)",
                    color: "#F8D677",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    marginBlockEnd: "0.85rem",
                  }}
                >
                  <Sparkles size={13} /> {currentBanner.eyebrow}
                </span>

                <h1
                  className="serif-heading"
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(1.85rem, 1.35rem + 2vw, 3rem)",
                    fontWeight: 700,
                    marginBlockEnd: "0.75rem",
                  }}
                >
                  {currentBanner.title}
                </h1>

                <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.94rem", marginBlockEnd: "1.1rem", maxInlineSize: "38rem" }}>
                  {currentBanner.subtitle}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                  <Link href={currentBanner.ctaHref} className="btn btn-gold">
                    {currentBanner.ctaLabel} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/consultation/chat"
                    className="btn"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.12)",
                      color: "#FFFFFF",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <MessageCircle size={15} /> Live Chat
                  </Link>
                </div>
              </div>

              <div className="hero-offer-card">
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.2rem 0.65rem",
                    borderRadius: "9999px",
                    backgroundColor: "var(--royal-purple)",
                    color: "#F8D677",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    marginBlockEnd: "0.6rem",
                  }}
                >
                  {currentBanner.offerTag}
                </span>
                <h2 className="serif-heading" style={{ fontSize: "1.45rem", color: "var(--royal-purple)", marginBlockEnd: "0.3rem" }}>
                  {currentBanner.offerHeadline}
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginBlockEnd: "0.75rem" }}>
                  {currentBanner.offerNote}
                </p>
                <ul style={{ display: "grid", gap: "0.35rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)" }}>
                  {currentBanner.highlights.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CheckCircle2 size={14} color="#16A34A" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Slider Controls */}
            <div
              style={{
                position: "absolute",
                insetBlockEnd: "0.85rem",
                insetInline: 0,
                zIndex: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.55rem",
              }}
            >
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() => setBannerIndex((i) => (i - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: "9999px",
                  padding: "0.25rem",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              {HERO_BANNERS.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`View banner ${idx + 1}: ${b.title}`}
                  onClick={() => setBannerIndex(idx)}
                  style={{
                    inlineSize: idx === bannerIndex ? "1.6rem" : "0.55rem",
                    blockSize: "0.55rem",
                    borderRadius: "9999px",
                    border: 0,
                    backgroundColor: idx === bannerIndex ? "#F2C96B" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                />
              ))}
              <button
                type="button"
                aria-label="Next banner"
                onClick={() => setBannerIndex((i) => (i + 1) % HERO_BANNERS.length)}
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: "9999px",
                  padding: "0.25rem",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* 6. Astrology Service Category Icons Strip */}
        <section style={{ backgroundColor: "var(--white)", borderBlockEnd: "1px solid var(--border)" }}>
          <div className="container">
            <div className="category-strip">
              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    className={`category-card ${cat.featured ? "category-card-featured" : ""}`}
                  >
                    <span
                      style={{
                        inlineSize: "2.75rem",
                        blockSize: "2.75rem",
                        borderRadius: "0.75rem",
                        backgroundColor: cat.featured ? "var(--royal-purple)" : "var(--champagne-gold-soft)",
                        color: cat.featured ? "#F2C96B" : "var(--royal-purple)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon size={22} />
                    </span>
                    <strong style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{cat.title}</strong>
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-subtle)" }}>{cat.subtitle}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5 & 7. Connect, Consult, Solve + Find the Right Astrologer + Quick Actions */}
        <section className="mp-section">
          <div className="container">
            <div
              className="surface-card"
              style={{
                background: "linear-gradient(135deg, #FFFBF3 0%, #FFF3DE 55%, #FFFFFF 100%)",
                borderColor: "var(--border-gold)",
                padding: "clamp(1.25rem, 1rem + 1.5vw, 2.25rem)",
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))",
                alignItems: "center",
              }}
            >
              <div>
                <span className="section-eyebrow">Connect · Consult · Solve</span>
                <h2 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 1.35rem + 1.5vw, 2.5rem)", color: "var(--royal-purple)", marginBlockEnd: "0.65rem" }}>
                  Talk to India&apos;s Top Verified Astrologers
                </h2>
                <p style={{ marginBlockEnd: "1rem", maxInlineSize: "34rem" }}>
                  Get trusted spiritual guidance on career, marriage, relationships, business,
                  Vastu, and life&apos;s important milestones.
                </p>

                {/* Quick Consultation Modes */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.55rem", marginBlockEnd: "1rem" }}>
                  <Link href="/astrologers?mode=chat" className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                    <MessageCircle size={18} color="#351044" style={{ marginInline: "auto", marginBlockEnd: "0.25rem" }} />
                    <strong style={{ display: "block", fontSize: "0.78rem" }}>Live Chat</strong>
                  </Link>
                  <Link href="/astrologers?mode=call" className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                    <PhoneCall size={18} color="#351044" style={{ marginInline: "auto", marginBlockEnd: "0.25rem" }} />
                    <strong style={{ display: "block", fontSize: "0.78rem" }}>Audio Call</strong>
                  </Link>
                  <Link href="/astrologers?mode=video" className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                    <Video size={18} color="#351044" style={{ marginInline: "auto", marginBlockEnd: "0.25rem" }} />
                    <strong style={{ display: "block", fontSize: "0.78rem" }}>Video Call</strong>
                  </Link>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", fontSize: "0.78rem", fontWeight: 600, color: "var(--ink)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <ShieldCheck size={15} color="#D4A84F" /> Verified Experts
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Lock size={15} color="#D4A84F" /> 100% Confidential
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Zap size={15} color="#F59E0B" /> Instant Connect
                  </span>
                </div>
              </div>

              {/* Interactive Find the Right Astrologer Widget */}
              <div className="surface-card" style={{ boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--royal-purple)", marginBlockEnd: "0.85rem" }}>
                  Find the Right Astrologer
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem", marginBlockEnd: "0.85rem" }}>
                  {(["chat", "call", "video"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFinderMode(m)}
                      className={finderMode === m ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
                    >
                      {m === "chat" ? "Chat" : m === "call" ? "Audio Call" : "Video Call"}
                    </button>
                  ))}
                </div>

                <div style={{ display: "grid", gap: "0.65rem", marginBlockEnd: "0.9rem" }}>
                  <select
                    aria-label="Select Concern"
                    className="form-select"
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                  >
                    {ASTROLOGY_SPECIALISATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Select Language"
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-purple"
                  style={{ inlineSize: "100%" }}
                  onClick={() =>
                    router.push(
                      `/astrologers?mode=${finderMode}&speciality=${encodeURIComponent(concern)}&lang=${encodeURIComponent(language)}`
                    )
                  }
                >
                  Search Astrologers <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Available Online Astrologers */}
        <section className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Instant Consultation</span>
                <h2 className="section-title">Available Online Astrologers</h2>
              </div>
              <Link href="/astrologers?status=ONLINE" className="btn btn-outline btn-sm">
                View All Online <ArrowRight size={14} />
              </Link>
            </div>
            <div className="astro-grid">
              {onlineAstrologers.map((a) => (
                <AstrologerCard key={a.id} astrologer={a} />
              ))}
            </div>
          </div>
        </section>

        {/* 9. Top Rated Astrologers */}
        <section className="mp-section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Highest Client Satisfaction</span>
                <h2 className="section-title">Top Rated Astrologers</h2>
              </div>
              <Link href="/astrologers?sort=rating" className="btn btn-outline btn-sm">
                Explore Top Rated <ArrowRight size={14} />
              </Link>
            </div>
            <div className="astro-grid">
              {topRatedAstrologers.map((a) => (
                <AstrologerCard key={a.id} astrologer={a} />
              ))}
            </div>
          </div>
        </section>

        {/* 10. Trending Astrologers */}
        <section className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Most Consulted Today</span>
                <h2 className="section-title">Trending Astrologers</h2>
              </div>
              <Link href="/astrologers" className="btn btn-outline btn-sm">
                Browse Directory <ArrowRight size={14} />
              </Link>
            </div>
            <div className="astro-grid">
              {trendingAstrologers.map((a) => (
                <AstrologerCard key={a.id} astrologer={a} />
              ))}
            </div>
          </div>
        </section>

        {/* 11. Astrology Services by Speciality */}
        <section className="mp-section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">15 Traditional Disciplines</span>
                <h2 className="section-title">Explore Astrologers by Speciality</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              {ASTROLOGY_SPECIALISATIONS.map((spec) => (
                <Link
                  key={spec}
                  href={`/astrologers?speciality=${encodeURIComponent(spec)}`}
                  className="btn btn-outline btn-sm"
                >
                  {spec}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 12. First Consultation Promotional Section */}
        <section className="mp-section" style={{ paddingBlock: "1rem 2.5rem" }}>
          <div className="container">
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 60%, #4E1A66 100%)",
                border: "1px solid var(--champagne-gold)",
                padding: "clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)",
                color: "#FFFFFF",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.25rem",
              }}
            >
              <div>
                <span style={{ color: "#F2C96B", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Welcome Consultation Benefit
                </span>
                <h2 className="serif-heading" style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2.15rem)", marginBlock: "0.35rem" }}>
                  Begin Your First Consultation with Full Transparency
                </h2>
                <p style={{ color: "rgba(255,255,255,0.82)", maxInlineSize: "40rem" }}>
                  Introductory minutes and welcome offers are controlled securely from the Super
                  Admin Panel. Explicit customer consent is always required before transitioning to
                  paid per-minute billing.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                <Link href="/astrologers" className="btn btn-gold">
                  Start Consultation <ArrowRight size={15} />
                </Link>
                <Link href="/account/wallet" className="btn btn-outline" style={{ backgroundColor: "transparent", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.35)" }}>
                  View Wallet
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 13 & 14. Twelve Zodiac Signs + Daily Horoscope */}
        <section id="daily-horoscope" className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Rashifal · 12 Zodiac Signs</span>
                <h2 className="section-title">Daily Horoscope &amp; Zodiac Insights</h2>
              </div>
            </div>

            <div className="zodiac-grid" style={{ marginBlockEnd: "1.5rem" }}>
              {ZODIAC_SIGNS.map((z) => {
                const selected = z.id === activeSign;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setActiveSign(z.id)}
                    className="surface-card"
                    style={{
                      padding: "0.85rem 0.6rem",
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.35rem",
                      borderColor: selected ? "var(--royal-purple)" : "var(--border)",
                      backgroundColor: selected ? "var(--champagne-gold-soft)" : "var(--white)",
                    }}
                  >
                    <ZodiacIllustration sign={z.id} />
                    <strong style={{ fontSize: "0.86rem", color: "var(--ink)" }}>{z.name}</strong>
                    <span style={{ fontSize: "0.74rem", color: "var(--royal-purple)", fontFamily: "var(--font-hi)" }}>
                      {z.hindi}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--ink-subtle)" }}>{z.dates}</span>
                  </button>
                );
              })}
            </div>

            <div className="surface-card" style={{ backgroundColor: "var(--ivory)", borderColor: "var(--border-gold)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBlockEnd: "0.55rem" }}>
                <h3 className="serif-heading" style={{ fontSize: "1.4rem", color: "var(--royal-purple)" }}>
                  {selectedZodiac.name} ({selectedZodiac.hindi}) — Today&apos;s Guidance
                </h3>
                <span className="status-pill" style={{ backgroundColor: "var(--white)", color: "var(--royal-purple)", border: "1px solid var(--border)" }}>
                  Element: {selectedZodiac.element}
                </span>
              </div>
              <p style={{ color: "var(--ink)", marginBlockEnd: "0.75rem" }}>{selectedZodiac.guidance}</p>
              <Link href="/astrologers" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--royal-purple)" }}>
                Ask an astrologer about your {selectedZodiac.name} transit →
              </Link>
            </div>
          </div>
        </section>

        {/* 15 & 16. Free Janam Kundli + Kundli Matching */}
        <section id="free-kundli" className="mp-section">
          <div className="container">
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
              {/* Free Janam Kundli */}
              <div className="surface-card">
                <span className="section-eyebrow">Vedic Birth Chart</span>
                <h2 className="section-title" style={{ marginBlockEnd: "0.5rem" }}>Free Janam Kundli</h2>
                <p style={{ fontSize: "0.86rem", marginBlockEnd: "1rem" }}>
                  Enter accurate birth date, time, and place to prepare your Lagna, Navamsa, and
                  Vimshottari Dasha chart.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setKundliFeedback("Lagna: Taurus (Vrishabha 14°22') · Moon Sign: Leo (Simha) · Nakshatra: Magha (Pada 2) · Planetary Balance: Exalted Sun in 10th House, Jupiter in 9th (Bhagya Sthana) · Current Mahadasha: Mercury-Venus (Auspicious period for Career & Growth). Complete Vedic Birth Chart generated.");
                  }}
                  style={{ display: "grid", gap: "0.65rem" }}
                >
                  <input className="form-input" placeholder="Full Name" required />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <input type="date" className="form-input" aria-label="Date of Birth" required />
                    <input type="time" className="form-input" aria-label="Time of Birth" required />
                  </div>
                  <input className="form-input" placeholder="Birthplace (City, State, India)" required />
                  <button type="submit" className="btn btn-purple">
                    Generate Free Kundli
                  </button>
                </form>
                {kundliFeedback ? (
                  <div style={{ marginBlockStart: "0.75rem", padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px", border: "1px solid rgba(212,168,79,0.3)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--royal-purple)", display: "block", marginBottom: "0.25rem" }}>
                      Vedic Janam Kundli Calculated (Lahiri Ayanamsha)
                    </strong>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>
                      {kundliFeedback}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                      <Link href="/astrologers?mode=call" className="btn btn-purple btn-sm" style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}>
                        Discuss Chart with Astrologer
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Kundli Matching */}
              <div id="kundli-matching" className="surface-card">
                <span className="section-eyebrow">Ashtakoot Guna Milan</span>
                <h2 className="section-title" style={{ marginBlockEnd: "0.5rem" }}>Kundli Matching</h2>
                <p style={{ fontSize: "0.86rem", marginBlockEnd: "1rem" }}>
                  Check 36-Guna compatibility, Manglik Dosha, and Nadi alignment before marriage.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMatchFeedback("Ashtakoot Compatibility Score: 28 / 36 (Auspicious / Shubh Milan) · Varna: 1/1 · Vashya: 2/2 · Tara: 3/3 · Yoni: 4/4 · Graha Maitri: 5/5 · Gana: 5/6 · Bhakoot: 0/7 · Nadi: 8/8 · Manglik Dosha: Absent (Saumya Horoscope). Highly recommended match.");
                  }}
                  style={{ display: "grid", gap: "0.65rem" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <input className="form-input" placeholder="Boy's Full Name" required />
                    <input className="form-input" placeholder="Girl's Full Name" required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <input type="date" className="form-input" aria-label="Boy's Date of Birth" required />
                    <input type="date" className="form-input" aria-label="Girl's Date of Birth" required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <input className="form-input" placeholder="Boy's Birthplace" required />
                    <input className="form-input" placeholder="Girl's Birthplace" required />
                  </div>
                  <button type="submit" className="btn btn-gold">
                    Check Compatibility
                  </button>
                </form>
                {matchFeedback ? (
                  <div style={{ marginBlockStart: "0.75rem", padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px", border: "1px solid rgba(212,168,79,0.3)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--royal-purple)", display: "block", marginBottom: "0.25rem" }}>
                      Guna Milan Results (36 Guna Ashtakoot)
                    </strong>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>
                      {matchFeedback}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                      <Link href="/astrologers?mode=video" className="btn btn-purple btn-sm" style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}>
                        Consult Marriage Astrologer
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* 17. Live Astrologer Streaming */}
        <section id="live-astrologers" className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Interactive Broadcasts</span>
                <h2 className="section-title">Live Astrologer Sessions</h2>
              </div>
              <Link href="/consultation/call?mode=video" className="btn btn-outline btn-sm">
                Open Live Studio <ArrowRight size={14} />
              </Link>
            </div>
            <div className="astro-grid">
              {ASTROLOGER_SHOWCASE.slice(0, 4).map((a) => (
                <div key={`live-${a.id}`} className="surface-card" style={{ padding: "0.9rem" }}>
                  <div style={{ position: "relative", marginBlockEnd: "0.75rem" }}>
                    <img
                      src={a.photo}
                      alt={a.name}
                      style={{ inlineSize: "100%", blockSize: "10.5rem", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        insetBlockStart: "0.55rem",
                        insetInlineStart: "0.55rem",
                        backgroundColor: "var(--live-red)",
                        color: "#FFFFFF",
                        padding: "0.18rem 0.55rem",
                        borderRadius: "9999px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Radio size={11} /> LIVE
                    </span>
                  </div>
                  <strong style={{ display: "block", fontSize: "0.9rem" }}>{a.name}</strong>
                  <p style={{ fontSize: "0.76rem", marginBlock: "0.2rem 0.65rem" }}>{a.specialisations[0]} Q&amp;A</p>
                  <Link href={`/astrologer/${a.slug}`} className="btn btn-purple btn-sm" style={{ inlineSize: "100%" }}>
                    Join Live Session
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 18 & 19. Personalised Reports + Panchang & Shubh Muhurat */}
        <section id="panchang" className="mp-section">
          <div className="container">
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
              {/* Personalised Reports */}
              <div className="surface-card">
                <span className="section-eyebrow">Astrologer-Authored PDFs</span>
                <h2 className="section-title" style={{ marginBlockEnd: "1rem" }}>Personalised Astrology Reports</h2>
                <div style={{ display: "grid", gap: "0.65rem" }}>
                  {PERSONALISED_REPORTS.map((r) => (
                    <div
                      key={r.title}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--ivory)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <strong style={{ display: "block", fontSize: "0.86rem" }}>{r.title}</strong>
                        <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>
                          <FileText size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {r.pages} · Delivery {r.delivery}
                        </span>
                      </div>
                      <Link href="/account/wallet" className="btn btn-outline btn-sm">
                        ₹{r.priceInr}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panchang & Shubh Muhurat */}
              <div className="surface-card" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 100%)" }}>
                <span className="section-eyebrow">Vedic Almanac</span>
                <h2 className="section-title" style={{ marginBlockEnd: "1rem" }}>Today&apos;s Panchang &amp; Muhurat</h2>
                <dl style={{ display: "grid", gap: "0.65rem", fontSize: "0.86rem" }}>
                  {[
                    ["Tithi", "Shukla Paksha Chaturdashi"],
                    ["Nakshatra", "Rohini · Auspicious for new beginnings"],
                    ["Abhijit Muhurat", "11:48 AM – 12:36 PM IST"],
                    ["Rahu Kaal", "03:00 PM – 04:30 PM IST"],
                    ["Upcoming Festival", "Kartik Purnima & Dev Deepawali"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        paddingBlockEnd: "0.55rem",
                        borderBlockEnd: "1px solid var(--border)",
                      }}
                    >
                      <dt style={{ color: "var(--ink-muted)", fontWeight: 600 }}>{k}</dt>
                      <dd style={{ fontWeight: 700, color: "var(--royal-purple)", textAlign: "end" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* 20. Online Puja Booking */}
        <section id="puja-booking" className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Temple &amp; Online Rituals</span>
                <h2 className="section-title">Online Puja &amp; Sankalp Booking</h2>
              </div>
              <Link href="/account" className="btn btn-outline btn-sm">
                My Puja Bookings <ArrowRight size={14} />
              </Link>
            </div>
            <div className="astro-grid">
              {PUJA_SERVICES.map((puja) => (
                <article key={puja.id} className="surface-card" style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <img
                    src={puja.image}
                    alt={puja.title}
                    style={{ inlineSize: "100%", blockSize: "9.5rem", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                  />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9A6E1E", textTransform: "uppercase" }}>
                    {puja.category}
                  </span>
                  <strong style={{ fontSize: "0.92rem", color: "var(--ink)" }}>{puja.title}</strong>
                  <p style={{ fontSize: "0.76rem" }}>{puja.temple} · {puja.duration}</p>
                  <div style={{ marginBlockStart: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlockStart: "0.5rem", borderBlockStart: "1px solid var(--border)" }}>
                    <strong style={{ color: "var(--royal-purple)" }}>₹{puja.priceInr.toLocaleString("en-IN")}</strong>
                    <Link href="/account/wallet" className="btn btn-purple btn-sm">Book Puja</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 21. Spiritual Products Marketplace (NAMH Astro Store) */}
        <section id="astro-store" className="mp-section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Authentic Certified Remedies</span>
                <h2 className="section-title">NAMH Astro Store</h2>
              </div>
              <Link href="/account" className="btn btn-outline btn-sm">
                <ShoppingBag size={14} /> My Orders
              </Link>
            </div>
            <div className="astro-grid">
              {STORE_PRODUCTS.map((prod) => (
                <article key={prod.id} className="surface-card" style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ inlineSize: "100%", blockSize: "10rem", objectFit: "cover", borderRadius: "var(--radius-sm)", backgroundColor: "var(--ivory)" }}
                  />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--online)" }}>{prod.badge}</span>
                  <strong style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{prod.name}</strong>
                  <div style={{ marginBlockStart: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlockStart: "0.5rem", borderBlockStart: "1px solid var(--border)" }}>
                    <span>
                      <strong style={{ color: "var(--royal-purple)" }}>₹{prod.priceInr.toLocaleString("en-IN")}</strong>{" "}
                      <span style={{ textDecoration: "line-through", fontSize: "0.76rem", color: "var(--ink-subtle)" }}>
                        ₹{prod.mrpInr.toLocaleString("en-IN")}
                      </span>
                    </span>
                    <Link href="/account/wallet" className="btn btn-gold btn-sm">Buy Now</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 22. How NAMH ASTRO Works */}
        <section id="how-it-works" className="mp-section mp-section-white">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Simple 4-Step Experience</span>
                <h2 className="section-title">How NAMH ASTRO Works</h2>
              </div>
            </div>
            <div className="astro-grid">
              {[
                { step: "01", title: "Choose Verified Astrologer", desc: "Filter by Vedic, Tarot, KP, Vastu, language, experience, and transparent per-minute rates." },
                { step: "02", title: "Recharge Wallet Securely", desc: "Add credits via Razorpay UPI, cards, or net banking with instant GST invoices." },
                { step: "03", title: "Connect via Chat, Call or Video", desc: "Private, encrypted sessions — billing begins strictly when the astrologer connects." },
                { step: "04", title: "Receive Actionable Guidance", desc: "Review chat transcripts, birth charts, remedies, and invoices anytime in your dashboard." },
              ].map((s) => (
                <div key={s.step} className="surface-card" style={{ backgroundColor: "var(--ivory)" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 700, color: "var(--champagne-gold)" }}>
                    {s.step}
                  </span>
                  <h3 style={{ fontSize: "1rem", marginBlock: "0.4rem" }}>{s.title}</h3>
                  <p style={{ fontSize: "0.82rem" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 23. Customer Reviews & Trust Section */}
        <section id="reviews" className="mp-section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Verified Consultations Only</span>
                <h2 className="section-title">Built on Trust, Privacy &amp; Authenticity</h2>
              </div>
            </div>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))" }}>
              {[
                {
                  icon: ShieldCheck,
                  title: "6-Stage Astrologer KYC & Interview",
                  desc: "Every astrologer completes document verification, live interview, and ethics training before activation.",
                },
                {
                  icon: Award,
                  title: "Genuine Post-Session Reviews",
                  desc: "Only customers who complete a verified paid consultation can publish a star rating and review.",
                },
                {
                  icon: Star,
                  title: "Server-Controlled Fair Billing",
                  desc: "Zero charges while waiting in queue; automatic disconnection before negative balance.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="surface-card">
                    <Icon size={24} color="#351044" style={{ marginBlockEnd: "0.65rem" }} />
                    <h3 style={{ fontSize: "1rem", marginBlockEnd: "0.35rem" }}>{item.title}</h3>
                    <p style={{ fontSize: "0.84rem" }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 24. Android and iOS App Download */}
        <section id="download-app" className="mp-section mp-section-white">
          <div className="container">
            <div
              className="surface-card"
              style={{
                background: "linear-gradient(135deg, #FFF7E8 0%, #FFFFFF 100%)",
                borderColor: "var(--border-gold)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                padding: "clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)",
              }}
            >
              <div>
                <span className="section-eyebrow">Native Mobile Experience</span>
                <h2 className="section-title" style={{ marginBlockEnd: "0.5rem" }}>
                  Get the NAMH ASTRO App on Android &amp; iOS
                </h2>
                <p style={{ maxInlineSize: "38rem", fontSize: "0.9rem" }}>
                  Instant incoming call alerts, offline Kundli vault, one-tap wallet recharge, and
                  private consultation history — engineered for speed and clarity.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <Link href="/account" className="btn btn-purple">
                  <Smartphone size={16} /> Google Play (Android)
                </Link>
                <Link href="/account" className="btn btn-gold">
                  <Smartphone size={16} /> App Store (iOS)
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 25. Multi-Column Footer & Fixed Mobile Bottom Navigation */}
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
