"use client";

import Link from "next/link";
import { Sun, Moon, Clock, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PanchangPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SiteHeader />
      <main style={{ flex: 1, backgroundColor: "#FBF7F0", padding: "2rem 1rem" }}>
        <div className="container" style={{ maxWidth: "850px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span className="section-eyebrow" style={{ color: "#D4A84F", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              VEDIC TIMEKEEPING &amp; EPHEMERIS
            </span>
            <h1 className="serif-heading" style={{ fontSize: "2.2rem", color: "var(--royal-purple, #351044)", margin: "0.3rem 0" }}>
              Today&apos;s Panchang &amp; Shubh Muhurat
            </h1>
            <p style={{ color: "var(--ink-muted, #6B7280)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
              Accurate five-fold Vedic almanac calculations: Tithi, Vaar, Nakshatra, Yoga, and Karana, alongside auspicious and inauspicious time windows.
            </p>
          </div>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Today's Vedic Attributes Card */}
            <div className="surface-card" style={{ padding: "1.5rem", borderRadius: "10px", backgroundColor: "#FFFFFF", borderLeft: "5px solid #D4A84F", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.35rem", color: "var(--royal-purple)", margin: 0 }}>
                  Vedic Calendar Coordinates (Varanasi / IST)
                </h2>
                <span className="status-pill status-online">Vikram Samvat 2083</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Tithi</span>
                  <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>Shukla Paksha Dashami (upto 04:12 PM)</strong>
                </div>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Nakshatra</span>
                  <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>Rohini (upto 07:35 PM)</strong>
                </div>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Yoga</span>
                  <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>Harshana</strong>
                </div>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Karana</span>
                  <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>Garija</strong>
                </div>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Sunrise &amp; Sunset</span>
                  <strong style={{ fontSize: "1rem", color: "#D4A84F" }}>06:34 AM · 05:28 PM</strong>
                </div>
                <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Moonrise</span>
                  <strong style={{ fontSize: "1rem", color: "#D4A84F" }}>01:15 PM</strong>
                </div>
              </div>
            </div>

            {/* Shubh Muhurat vs Inauspicious Periods */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1rem" }}>
              <div className="surface-card" style={{ padding: "1.25rem", borderRadius: "8px", backgroundColor: "#FFFFFF", borderTop: "4px solid #10B981" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#059669", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={16} /> Auspicious Windows (Shubh Muhurat)
                </h3>
                <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span>Abhijit Muhurat:</span>
                    <strong>11:46 AM – 12:28 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span>Amrit Kaal:</span>
                    <strong>03:10 PM – 04:45 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span>Brahma Muhurat:</span>
                    <strong>04:52 AM – 05:43 AM</strong>
                  </div>
                </div>
              </div>

              <div className="surface-card" style={{ padding: "1.25rem", borderRadius: "8px", backgroundColor: "#FFFFFF", borderTop: "4px solid #DC2626" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#DC2626", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Clock size={16} /> Inauspicious Windows (Ashubh Kaal)
                </h3>
                <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span>Rahu Kaal:</span>
                    <strong style={{ color: "#DC2626" }}>01:30 PM – 02:52 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span>Yamaganda:</span>
                    <strong>06:34 AM – 07:56 AM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0" }}>
                    <span>Gulika Kaal:</span>
                    <strong>09:18 AM – 10:40 AM</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/astrologers?mode=call" className="btn btn-purple">
                Consult Astrologer for Personalized Muhurat <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
