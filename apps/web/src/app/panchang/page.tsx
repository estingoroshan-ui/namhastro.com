"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Clock, Compass, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const TODAY_ALMANAC = {
  dateFormatted: "Thursday, November 26, 2026",
  vikramSamvat: "Vikram Samvat 2083 (Krodhi Nama)",
  shakaSamvat: "Shaka Samvat 1948 (Parthiva)",
  ayana: "Dakshinayana (Southern Solstice)",
  ritu: "Hemant Ritu (Pre-Winter)",
  tithi: "Shukla Paksha Chaturdashi (14th Lunar Day) — upto 02:44 PM",
  nextTithi: "Kartik Purnima (Full Moon) begins at 02:45 PM",
  nakshatra: "Rohini (Ruled by Moon) — upto 06:12 PM",
  nextNakshatra: "Mrigashira (Ruled by Mars) begins at 06:13 PM",
  yoga: "Saubhagya Yoga — upto 11:20 AM, followed by Shobhana Yoga",
  karana: "Gara (02:44 PM), followed by Vanija",
  solarSign: "Scorpio (Vrischika)",
  lunarSign: "Taurus (Vrishabha)",
  sunrise: "06:52 AM IST",
  sunset: "05:24 PM IST",
  moonrise: "04:58 PM IST",
  moonset: "05:40 AM IST (Next Day)",
};

const SHUBH_MUHURATS = [
  { name: "Abhijit Muhurat", time: "11:46 AM – 12:28 PM", note: "Most auspicious time for new ventures, signing contracts, travel" },
  { name: "Brahma Muhurat", time: "05:04 AM – 05:58 AM", note: "Ideal for meditation, mantra japa, and spiritual sadhana" },
  { name: "Amrit Kaal", time: "02:18 PM – 03:54 PM", note: "Best for sacred rituals, puja, and auspicious ceremonies" },
  { name: "Vijaya Muhurat", time: "01:54 PM – 02:36 PM", note: "Ensures victory in litigations, negotiations, and competitions" },
  { name: "Godhuli Muhurat", time: "05:21 PM – 05:48 PM", note: "Peaceful evening transit; auspicious for home lighting and prayers" },
];

const ASHUBH_MUHURATS = [
  { name: "Rahu Kaal", time: "01:28 PM – 02:47 PM", note: "Inauspicious; strictly avoid starting new financial deeds or travel" },
  { name: "Yamaganda", time: "06:52 AM – 08:11 AM", note: "Period ruled by Yama; avoid initiating vital commitments" },
  { name: "Gulika Kaal", time: "09:30 AM – 10:49 AM", note: "Ruled by Saturn's son; actions performed are repeated" },
  { name: "Dur Muhurat", time: "10:22 AM – 11:04 AM & 02:36 PM – 03:18 PM", note: "Inauspicious planetary alignment periods" },
];

export default function PanchangPage() {
  const [selectedCity, setSelectedCity] = useState("New Delhi, India");

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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Vedic Panchang</span>
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
              <Calendar size={14} /> Daily Hindu Vedic Almanac
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Today&apos;s Panchang &amp; Shubh Muhurat
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Precise calculation of Tithi, Vaar, Nakshatra, Yoga, and Karana according to traditional Surya Siddhanta and Drik Ganita ephemeris. Check auspicious Abhijit Muhurat and avoid Rahu Kaal.
            </p>
          </div>
        </section>

        {/* City Filter & Date Banner */}
        <section className="container" style={{ marginTop: "2rem" }}>
          <div className="surface-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", backgroundColor: "#FFF9F0", borderColor: "rgba(212,168,79,0.4)" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#D4A84F", fontWeight: 700, textTransform: "uppercase" }}>Current Vedic Day</span>
              <h2 style={{ fontSize: "1.35rem", color: "#351044", margin: "0.2rem 0 0", fontFamily: "var(--font-serif, serif)" }}>
                {TODAY_ALMANAC.dateFormatted}
              </h2>
              <span style={{ fontSize: "0.82rem", color: "#666" }}>
                {TODAY_ALMANAC.vikramSamvat} · {TODAY_ALMANAC.shakaSamvat}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#351044" }}>Location:</label>
              <select
                className="form-input"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ width: "auto", minWidth: "180px", padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
              >
                <option value="New Delhi, India">New Delhi (IST)</option>
                <option value="Mumbai, India">Mumbai (IST)</option>
                <option value="Bengaluru, India">Bengaluru (IST)</option>
                <option value="Varanasi, India">Varanasi (Kashi)</option>
                <option value="Kolkata, India">Kolkata (IST)</option>
                <option value="London, UK">London (GMT)</option>
                <option value="New York, USA">New York (EST)</option>
              </select>
            </div>
          </div>

          {/* The 5 Pillars of Panchang */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Primary Limbs */}
            <div className="surface-card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.15rem", color: "#351044", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="#D4A84F" /> Five Limbs (Pancha-Anga)
              </h3>
              <dl style={{ display: "grid", gap: "0.85rem", fontSize: "0.88rem", margin: 0 }}>
                <div style={{ paddingBottom: "0.65rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <dt style={{ color: "#777", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>1. Tithi (Lunar Day)</dt>
                  <dd style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "#351044" }}>{TODAY_ALMANAC.tithi}</dd>
                  <small style={{ color: "#888", fontSize: "0.75rem" }}>Next: {TODAY_ALMANAC.nextTithi}</small>
                </div>
                <div style={{ paddingBottom: "0.65rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <dt style={{ color: "#777", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>2. Nakshatra (Lunar Mansion)</dt>
                  <dd style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "#351044" }}>{TODAY_ALMANAC.nakshatra}</dd>
                  <small style={{ color: "#888", fontSize: "0.75rem" }}>Next: {TODAY_ALMANAC.nextNakshatra}</small>
                </div>
                <div style={{ paddingBottom: "0.65rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <dt style={{ color: "#777", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>3. Vaar (Solar Day)</dt>
                  <dd style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "#351044" }}>Guruvaar (Thursday ruled by Brihaspati/Jupiter)</dd>
                </div>
                <div style={{ paddingBottom: "0.65rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <dt style={{ color: "#777", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>4. Yoga (Luni-Solar Distance)</dt>
                  <dd style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "#351044" }}>{TODAY_ALMANAC.yoga}</dd>
                </div>
                <div>
                  <dt style={{ color: "#777", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>5. Karana (Half-Tithi)</dt>
                  <dd style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "#351044" }}>{TODAY_ALMANAC.karana}</dd>
                </div>
              </dl>
            </div>

            {/* Sun & Moon Timings */}
            <div className="surface-card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.15rem", color: "#351044", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sun size={18} color="#D4A84F" /> Solar &amp; Lunar Horizons
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)", textAlign: "center" }}>
                  <Sun size={20} color="#E65100" style={{ margin: "0 auto 0.3rem" }} />
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Sunrise</div>
                  <strong style={{ fontSize: "1.05rem", color: "#351044" }}>{TODAY_ALMANAC.sunrise}</strong>
                </div>
                <div style={{ padding: "0.85rem", backgroundColor: "#FFF9F0", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)", textAlign: "center" }}>
                  <Sun size={20} color="#BF360C" style={{ margin: "0 auto 0.3rem" }} />
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Sunset</div>
                  <strong style={{ fontSize: "1.05rem", color: "#351044" }}>{TODAY_ALMANAC.sunset}</strong>
                </div>
                <div style={{ padding: "0.85rem", backgroundColor: "#F7F5FA", borderRadius: "8px", textAlign: "center" }}>
                  <Moon size={20} color="#351044" style={{ margin: "0 auto 0.3rem" }} />
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Moonrise</div>
                  <strong style={{ fontSize: "1.05rem", color: "#351044" }}>{TODAY_ALMANAC.moonrise}</strong>
                </div>
                <div style={{ padding: "0.85rem", backgroundColor: "#F7F5FA", borderRadius: "8px", textAlign: "center" }}>
                  <Moon size={20} color="#666" style={{ margin: "0 auto 0.3rem" }} />
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>Moonset</div>
                  <strong style={{ fontSize: "1.05rem", color: "#351044" }}>{TODAY_ALMANAC.moonset}</strong>
                </div>
              </div>

              <div style={{ padding: "0.85rem", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#777" }}>Sun Sign (Surya Rashi):</span>
                  <strong style={{ color: "#351044" }}>{TODAY_ALMANAC.solarSign}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#777" }}>Moon Sign (Chandra Rashi):</span>
                  <strong style={{ color: "#351044" }}>{TODAY_ALMANAC.lunarSign}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#777" }}>Season (Ritu):</span>
                  <strong style={{ color: "#351044" }}>{TODAY_ALMANAC.ritu}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Shubh & Ashubh Muhurats Table */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {/* Shubh Muhurats */}
            <div className="surface-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Clock size={18} color="#2E7D32" />
                <h3 style={{ fontSize: "1.15rem", color: "#2E7D32", margin: 0 }}>Shubh Muhurat (Auspicious Timings)</h3>
              </div>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {SHUBH_MUHURATS.map((m) => (
                  <div key={m.name} style={{ padding: "0.85rem", backgroundColor: "#F0FFF4", border: "1px solid #C6F6D5", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong style={{ color: "#22543D", fontSize: "0.92rem" }}>{m.name}</strong>
                      <span style={{ color: "#2E7D32", fontWeight: 700, fontSize: "0.85rem", fontFamily: "monospace" }}>{m.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#276749" }}>{m.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ashubh Muhurats */}
            <div className="surface-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Clock size={18} color="#C53030" />
                <h3 style={{ fontSize: "1.15rem", color: "#C53030", margin: 0 }}>Ashubh Kaal (Inauspicious Timings)</h3>
              </div>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {ASHUBH_MUHURATS.map((m) => (
                  <div key={m.name} style={{ padding: "0.85rem", backgroundColor: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong style={{ color: "#9B2C2C", fontSize: "0.92rem" }}>{m.name}</strong>
                      <span style={{ color: "#C53030", fontWeight: 700, fontSize: "0.85rem", fontFamily: "monospace" }}>{m.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#742A2A" }}>{m.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Consultation Callout */}
          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "linear-gradient(135deg, #351044 0%, #240B32 100%)", borderRadius: "10px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h4 style={{ margin: "0 0 0.3rem", color: "#FFFFFF", fontSize: "1.15rem" }}>Need custom Muhurat calculation for Marriage, Griha Pravesh, or Namkaran?</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>Our verified Vedic pandits calculate personal auspicious lagna matching bride and groom charts.</p>
            </div>
            <Link href="/puja" className="btn btn-gold" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
              Explore Puja &amp; Muhurat <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
