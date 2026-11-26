"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Compass, FileText, LayoutGrid, ShieldCheck, Sparkles, Star } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const SAMPLE_PLANETS = [
  { name: "Sun (Surya)", sign: "Scorpio (Vrischika)", degree: "10° 42'", house: "1st House (Ascendant)", status: "Benefic", nakshatra: "Anuradha" },
  { name: "Moon (Chandra)", sign: "Taurus (Vrishabha)", degree: "18° 14'", house: "7th House", status: "Exalted (Uchcha)", nakshatra: "Rohini" },
  { name: "Mars (Mangal)", sign: "Aries (Mesha)", degree: "04° 29'", house: "6th House", status: "Own Sign (Swakshetra)", nakshatra: "Ashwini" },
  { name: "Mercury (Budha)", sign: "Libra (Tula)", degree: "22° 50'", house: "12th House", status: "Neutral", nakshatra: "Vishakha" },
  { name: "Jupiter (Guru)", sign: "Pisces (Meena)", degree: "14° 08'", house: "5th House", status: "Own Sign (Swakshetra)", nakshatra: "Uttara Bhadrapada" },
  { name: "Venus (Shukra)", sign: "Virgo (Kanya)", degree: "28° 35'", house: "11th House", status: "Debilitated (Neecha)", nakshatra: "Chitra" },
  { name: "Saturn (Shani)", sign: "Aquarius (Kumbha)", degree: "12° 18'", house: "4th House", status: "Moolatrikona", nakshatra: "Shatabhisha" },
  { name: "Rahu", sign: "Pisces (Meena)", degree: "08° 44'", house: "5th House", status: "Shadow Planet", nakshatra: "Uttara Bhadrapada" },
  { name: "Ketu", sign: "Virgo (Kanya)", degree: "08° 44'", house: "11th House", status: "Shadow Planet", nakshatra: "Uttara Phalguni" },
];

export default function KundliPage() {
  const [formData, setFormData] = useState({
    name: "Aarav Sharma",
    gender: "Male",
    dob: "1994-11-26",
    tob: "08:45",
    birthPlace: "New Delhi, Delhi, India",
  });
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"planets" | "dasha" | "dosha">("planets");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Free Janam Kundli</span>
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
              <Sparkles size={14} /> Vedic Birth Chart Generator
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Free Janam Kundli &amp; Planetary Analysis
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Generate your accurate Vedic birth chart using high-precision planetary calculations. Discover your Lagna, Rashi, Nakshatra, Mahadasha cycles, and Dosha remedies prepared according to ancient Parashari principles.
            </p>
          </div>
        </section>

        {/* Kundli Form & Content */}
        <section className="container" style={{ marginTop: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            {/* Input Form Card */}
            <div className="surface-card" style={{ padding: "1.75rem", alignSelf: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
                <LayoutGrid size={22} color="#D4A84F" />
                <h2 style={{ fontSize: "1.2rem", color: "#351044", margin: 0, fontFamily: "var(--font-serif, serif)" }}>
                  Enter Birth Details
                </h2>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full birth name"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                    Gender
                  </label>
                  <select
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Time of Birth
                    </label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={formData.tob}
                      onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                    Birthplace (City, State, Country)
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="e.g. New Delhi, Delhi, India"
                  />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem", fontWeight: 600, marginTop: "0.5rem" }}>
                  Generate Janam Kundli <ArrowRight size={16} />
                </button>
              </form>

              <div style={{ marginTop: "1.25rem", padding: "0.75rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)", display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.78rem", color: "#664D1B" }}>
                <ShieldCheck size={18} color="#D4A84F" />
                <span>100% Confidential · Free calculation with instant chart visualization.</span>
              </div>
            </div>

            {/* Generated Chart & Analysis Output */}
            <div className="surface-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#D4A84F", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Lagna Kundli (D1)
                  </span>
                  <h3 style={{ fontSize: "1.3rem", color: "#351044", margin: "0.2rem 0 0", fontFamily: "var(--font-serif, serif)" }}>
                    {formData.name}&apos;s Vedic Chart
                  </h3>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setActiveTab("planets")}
                    className={`btn btn-sm ${activeTab === "planets" ? "btn-purple" : "btn-outline"}`}
                  >
                    Planets
                  </button>
                  <button
                    onClick={() => setActiveTab("dasha")}
                    className={`btn btn-sm ${activeTab === "dasha" ? "btn-purple" : "btn-outline"}`}
                  >
                    Mahadasha
                  </button>
                  <button
                    onClick={() => setActiveTab("dosha")}
                    className={`btn btn-sm ${activeTab === "dosha" ? "btn-purple" : "btn-outline"}`}
                  >
                    Doshas
                  </button>
                </div>
              </div>

              {/* Chart Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ backgroundColor: "#F7F2EC", padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Ascendant (Lagna)</div>
                  <strong style={{ fontSize: "0.95rem", color: "#351044" }}>Scorpio (Vrischika)</strong>
                </div>
                <div style={{ backgroundColor: "#F7F2EC", padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Moon Sign (Rashi)</div>
                  <strong style={{ fontSize: "0.95rem", color: "#351044" }}>Taurus (Vrishabha)</strong>
                </div>
                <div style={{ backgroundColor: "#F7F2EC", padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Birth Nakshatra</div>
                  <strong style={{ fontSize: "0.95rem", color: "#351044" }}>Rohini (Pada 3)</strong>
                </div>
                <div style={{ backgroundColor: "#F7F2EC", padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Current Dasha</div>
                  <strong style={{ fontSize: "0.95rem", color: "#351044" }}>Jupiter - Saturn</strong>
                </div>
              </div>

              {activeTab === "planets" && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#351044", color: "#FFFFFF", textAlign: "left" }}>
                        <th style={{ padding: "0.6rem 0.75rem" }}>Planet</th>
                        <th style={{ padding: "0.6rem 0.75rem" }}>Rashi / Sign</th>
                        <th style={{ padding: "0.6rem 0.75rem" }}>Degree</th>
                        <th style={{ padding: "0.6rem 0.75rem" }}>House</th>
                        <th style={{ padding: "0.6rem 0.75rem" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_PLANETS.map((p, idx) => (
                        <tr key={p.name} style={{ backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FBF7F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                          <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600, color: "#351044" }}>{p.name}</td>
                          <td style={{ padding: "0.55rem 0.75rem" }}>{p.sign}</td>
                          <td style={{ padding: "0.55rem 0.75rem", fontFamily: "monospace" }}>{p.degree}</td>
                          <td style={{ padding: "0.55rem 0.75rem" }}>{p.house}</td>
                          <td style={{ padding: "0.55rem 0.75rem", color: p.status.includes("Exalted") || p.status.includes("Own") ? "#2E7D32" : "#351044" }}>
                            {p.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "dasha" && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "#351044", margin: 0 }}>Vimshottari Mahadasha Timeline (120 Years Cycle)</h4>
                  <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <strong style={{ color: "#351044" }}>Current: Jupiter (Guru) Mahadasha</strong>
                      <span className="status-pill" style={{ backgroundColor: "#2E7D32", color: "#FFF" }}>Active (2018 - 2034)</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                      Jupiter rules your 5th and 2nd houses, conferring wisdom, spiritual growth, educational elevation, and progeny blessings.
                    </p>
                  </div>
                  <div style={{ padding: "0.85rem", backgroundColor: "#F7F5FA", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <strong style={{ color: "#351044" }}>Upcoming: Saturn (Shani) Mahadasha</strong>
                      <span style={{ fontSize: "0.75rem", color: "#666" }}>2034 - 2053 (19 Years)</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                      Saturn placed in its own sign in the 4th House brings property consolidation, domestic stability, and career maturity.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "dosha" && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ padding: "0.85rem", backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: "8px" }}>
                    <strong style={{ color: "#22543D", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CheckCircle2 size={16} /> Manglik Dosha: Nil (No Dosha Found)
                    </strong>
                    <p style={{ fontSize: "0.8rem", color: "#276749", margin: "0.3rem 0 0" }}>
                      Mars is placed in the 6th house from Lagna and Moon, fully nullifying Mangal Dosha for marriage compatibility.
                    </p>
                  </div>
                  <div style={{ padding: "0.85rem", backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: "8px" }}>
                    <strong style={{ color: "#22543D", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CheckCircle2 size={16} /> Kalsarpa Dosha: Absent
                    </strong>
                    <p style={{ fontSize: "0.8rem", color: "#276749", margin: "0.3rem 0 0" }}>
                      Planets are distributed on both sides of the Rahu-Ketu nodal axis. No obstructive Kalsarpa Yoga is formed.
                    </p>
                  </div>
                  <div style={{ padding: "0.85rem", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px" }}>
                    <strong style={{ color: "#92400E" }}>Sade Sati Phase: None (Free)</strong>
                    <p style={{ fontSize: "0.8rem", color: "#78350F", margin: "0.3rem 0 0" }}>
                      Transit Saturn in Aquarius is currently in the 10th house from your natal Moon in Taurus. You are free from Shani Sade Sati.
                    </p>
                  </div>
                </div>
              )}

              {/* Consultation CTA */}
              <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", borderRadius: "10px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem", color: "#FFFFFF", fontSize: "1.05rem" }}>Want deeper Kundli analysis?</h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>Consult with India&apos;s verified Vedic astrologers via private Chat or Audio Call.</p>
                </div>
                <Link href="/astrologers" className="btn btn-gold btn-sm" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
                  Talk to Astrologer <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
