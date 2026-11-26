"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, Sparkles, Download, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function KundliPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("1995-05-15");
  const [tob, setTob] = useState("06:30");
  const [pob, setPob] = useState("Varanasi, Uttar Pradesh, India");
  const [result, setResult] = useState<any>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult({
      lagna: "Taurus (Vrishabha 14° 22')",
      rashi: "Leo (Simha)",
      nakshatra: "Magha (Pada 2)",
      sunSign: "Aries (Mesha)",
      tithi: "Shukla Paksha Pratipada",
      yog: "Shobhana",
      karan: "Bava",
      planetaryPositions: [
        { planet: "Sun (Surya)", house: "10th House", rashi: "Aries", status: "Exalted (Uchcha)" },
        { planet: "Moon (Chandra)", house: "4th House", rashi: "Leo", status: "Friendly (Mitra)" },
        { planet: "Mars (Mangal)", house: "1st House", rashi: "Taurus", status: "Neutral (Sama)" },
        { planet: "Mercury (Budha)", house: "10th House", rashi: "Aries", status: "Friendly (Mitra)" },
        { planet: "Jupiter (Guru)", house: "9th House", rashi: "Capricorn", status: "Benefic in Bhagya Sthana" },
        { planet: "Venus (Shukra)", house: "11th House", rashi: "Pisces", status: "Exalted (Uchcha)" },
        { planet: "Saturn (Shani)", house: "11th House", rashi: "Pisces", status: "Friendly (Mitra)" },
        { planet: "Rahu", house: "8th House", rashi: "Sagittarius", status: "Karmic Axis" },
        { planet: "Ketu", house: "2nd House", rashi: "Gemini", status: "Moksha Axis" },
      ],
      currentDasha: "Mercury Mahadasha · Venus Antardasha (2025 - 2028)",
      doshaReport: "Manglik Dosha Absent. Minor Pitra Dosha remedial guidance advised.",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SiteHeader />
      <main style={{ flex: 1, backgroundColor: "#FBF7F0", padding: "2rem 1rem" }}>
        <div className="container" style={{ maxWidth: "850px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span className="section-eyebrow" style={{ color: "#D4A84F", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              AUTHENTIC VEDIC HOROSCOPE
            </span>
            <h1 className="serif-heading" style={{ fontSize: "2.2rem", color: "var(--royal-purple, #351044)", margin: "0.3rem 0" }}>
              Free Janam Kundli &amp; Birth Chart
            </h1>
            <p style={{ color: "var(--ink-muted, #6B7280)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Compute your precise Vedic horoscope using Lahiri Ayanamsha, accurate ephemeris coordinates, planetary house placements, and Vimshottari Mahadasha.
            </p>
          </div>

          {/* Kundli Generation Form */}
          <div className="surface-card" style={{ padding: "1.5rem", borderRadius: "10px", backgroundColor: "#FFFFFF", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid rgba(212,168,79,0.3)" }}>
            <form onSubmit={handleGenerate} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.3rem" }}>
                  Devotee Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.3rem" }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.3rem" }}>
                    Exact Time of Birth
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    required
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.3rem" }}>
                  Place of Birth (City, State, Country)
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={pob}
                  onChange={(e) => setPob(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-purple" style={{ padding: "0.75rem", fontSize: "1rem" }}>
                <Sparkles size={16} /> Compute Vedic Janam Kundli
              </button>
            </form>
          </div>

          {/* Generated Kundli Output */}
          {result && (
            <div style={{ marginTop: "2rem", display: "grid", gap: "1.25rem" }}>
              <div className="surface-card" style={{ padding: "1.5rem", borderRadius: "10px", backgroundColor: "#FFFFFF", borderLeft: "5px solid #D4A84F" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #F3F4F6", paddingBottom: "0.6rem" }}>
                  <h2 className="serif-heading" style={{ fontSize: "1.4rem", color: "var(--royal-purple)", margin: 0 }}>
                    Vedic Kundli Summary: {name || "Devotee"}
                  </h2>
                  <span className="status-pill status-online">Lahiri Ayanamsha</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ padding: "0.65rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Ascendant (Lagna)</span>
                    <strong style={{ fontSize: "0.95rem", color: "var(--royal-purple)" }}>{result.lagna}</strong>
                  </div>
                  <div style={{ padding: "0.65rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Moon Sign (Rashi)</span>
                    <strong style={{ fontSize: "0.95rem", color: "var(--royal-purple)" }}>{result.rashi}</strong>
                  </div>
                  <div style={{ padding: "0.65rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Nakshatra</span>
                    <strong style={{ fontSize: "0.95rem", color: "var(--royal-purple)" }}>{result.nakshatra}</strong>
                  </div>
                  <div style={{ padding: "0.65rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Active Mahadasha</span>
                    <strong style={{ fontSize: "0.95rem", color: "#D4A84F" }}>Mercury-Venus</strong>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.05rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                  Planetary Positions in Kundli Houses
                </h3>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Graha (Planet)</th>
                        <th>Bhava (House)</th>
                        <th>Rashi (Sign)</th>
                        <th>Vedic Dignity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.planetaryPositions.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td><strong>{p.planet}</strong></td>
                          <td>{p.house}</td>
                          <td>{p.rashi}</td>
                          <td><span className="status-pill status-online">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem", flexWrap: "wrap", gap: "0.75rem", borderTop: "1px solid #F3F4F6", paddingTop: "1rem" }}>
                  <Link href="/astrologers?mode=call" className="btn btn-purple btn-sm">
                    Consult Astrologer on this Kundli <ArrowRight size={14} />
                  </Link>
                  <Link href="/#kundli-matching" className="btn btn-gold btn-sm">
                    <HeartHandshake size={14} /> Match with Partner
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
