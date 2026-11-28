import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  Clock,
  Globe,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AstrologerCard } from "@/components/marketplace/AstrologerCard";
import { ASTROLOGER_SHOWCASE } from "@/data/marketplace";

export function generateStaticParams() {
  return ASTROLOGER_SHOWCASE.map((a) => ({ slug: a.slug }));
}

export default async function AstrologerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const astrologer =
    ASTROLOGER_SHOWCASE.find((a) => a.slug === slug) ?? ASTROLOGER_SHOWCASE[3];
  const similar = ASTROLOGER_SHOWCASE.filter((a) => a.id !== astrologer.id).slice(0, 4);

  const slots = ["10:30 AM", "11:15 AM", "01:00 PM", "04:30 PM", "06:15 PM", "08:00 PM"];

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlockEnd: "6rem" }}>
        <div className="container">
          <Link
            href="/astrologers"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--royal-purple)",
              marginBlockEnd: "1rem",
            }}
          >
            <ArrowLeft size={15} /> Back to Astrologers
          </Link>

          {/* Top Profile Banner */}
          <div
            className="surface-card"
            style={{
              display: "grid",
              gap: "1.5rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))",
              marginBlockEnd: "1.5rem",
              borderColor: "var(--border-gold)",
            }}
          >
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <img
                src={astrologer.photo}
                alt={astrologer.name}
                style={{
                  inlineSize: "9rem",
                  blockSize: "9rem",
                  borderRadius: "var(--radius-md)",
                  objectFit: "cover",
                  border: "3px solid var(--champagne-gold)",
                }}
              />
              <div style={{ flex: "1 1 14rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBlockEnd: "0.4rem" }}>
                  <span className={astrologer.status === "ONLINE" ? "status-pill status-online" : "status-pill status-busy"}>
                    {astrologer.status}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.76rem", fontWeight: 700, color: "var(--online)" }}>
                    <BadgeCheck size={15} /> KYC Verified
                  </span>
                </div>

                <h1 className="serif-heading" style={{ fontSize: "clamp(1.65rem, 1.3rem + 1vw, 2.25rem)", marginBlockEnd: "0.4rem" }}>
                  {astrologer.name}
                </h1>

                <p style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 500, marginBlockEnd: "0.55rem" }}>
                  {astrologer.specialisations.join(" · ")}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Globe size={14} color="#351044" /> {astrologer.languages.join(", ")}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Award size={14} color="#D4A84F" /> {astrologer.experienceYears} Years Experience
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--ink)", fontWeight: 700 }}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" /> {astrologer.rating?.toFixed(1)} ({astrologer.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Instant Actions */}
            <div style={{ backgroundColor: "var(--ivory)", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "0.95rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem" }}>
                Transparent Per-Minute Rates
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBlockEnd: "0.9rem" }}>
                <div className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Chat</span>
                  <strong style={{ display: "block", color: "var(--royal-purple)", fontSize: "1rem" }}>₹{astrologer.chatRateInr}/m</strong>
                </div>
                <div className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Audio</span>
                  <strong style={{ display: "block", color: "var(--royal-purple)", fontSize: "1rem" }}>₹{astrologer.audioRateInr}/m</strong>
                </div>
                <div className="surface-card" style={{ padding: "0.65rem", textAlign: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Video</span>
                  <strong style={{ display: "block", color: "var(--royal-purple)", fontSize: "1rem" }}>₹{astrologer.videoRateInr}/m</strong>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <Link href={`/consultation/chat?astrologer=${astrologer.slug}`} className="btn btn-purple btn-sm">
                  <MessageCircle size={14} /> Chat Now
                </Link>
                <Link href={`/consultation/call?mode=audio&astrologer=${astrologer.slug}`} className="btn btn-gold btn-sm">
                  <PhoneCall size={14} /> Call Now
                </Link>
                <Link href={`/consultation/call?mode=video&astrologer=${astrologer.slug}`} className="btn btn-outline btn-sm">
                  <Video size={14} /> Video
                </Link>
              </div>
            </div>
          </div>

          {/* Bio, Qualifications & Availability */}
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))", marginBlockEnd: "2rem" }}>
            <div className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.45rem", marginBlockEnd: "0.6rem" }}>
                About {astrologer.name}
              </h2>
              <p style={{ marginBlockEnd: "1rem" }}>{astrologer.bio}</p>

              <h3 style={{ fontSize: "0.95rem", marginBlockEnd: "0.5rem", color: "var(--royal-purple)" }}>
                Qualifications &amp; Lineages
              </h3>
              <ul style={{ display: "grid", gap: "0.4rem", fontSize: "0.86rem", marginBlockEnd: "1rem" }}>
                {astrologer.qualifications.map((q) => (
                  <li key={q} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <ShieldCheck size={15} color="#16A34A" /> {q}
                  </li>
                ))}
              </ul>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
                <div style={{ padding: "0.75rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--royal-purple)" }}>
                    {astrologer.completedConsultations.toLocaleString("en-IN")}+
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Consultations</span>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--royal-purple)" }}>
                    {astrologer.experienceYears} Yrs
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Practice</span>
                </div>
                <div style={{ padding: "0.75rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--online)" }}>100%</strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Private</span>
                </div>
              </div>
            </div>

            <div id="availability" className="surface-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBlockEnd: "0.75rem" }}>
                <Calendar size={18} color="#351044" />
                <h2 className="serif-heading" style={{ fontSize: "1.45rem" }}>Availability Calendar</h2>
              </div>
              <p style={{ fontSize: "0.84rem", marginBlockEnd: "1rem" }}>
                Select an upcoming 15-minute or 30-minute consultation slot in IST.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBlockEnd: "1rem" }}>
                {slots.map((slot) => (
                  <Link
                    key={slot}
                    href={`/account?tab=appointments&booked=${encodeURIComponent(astrologer.name)}&slug=${encodeURIComponent(astrologer.slug)}&slot=${encodeURIComponent(slot)}`}
                    className="btn btn-outline btn-sm"
                    style={{ justifyContent: "center" }}
                  >
                    <Clock size={12} /> {slot}
                  </Link>
                ))}
              </div>
              <div style={{ padding: "0.8rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--ivory)", fontSize: "0.8rem" }}>
                <strong>Verified Reviews Policy:</strong> Customer reviews are collected strictly
                after completed sessions and verified against consultation IDs.
              </div>
            </div>
          </div>

          {/* Similar Astrologers */}
          <section>
            <h2 className="section-title" style={{ marginBlockEnd: "1rem" }}>Similar Verified Astrologers</h2>
            <div className="astro-grid">
              {similar.map((a) => (
                <AstrologerCard key={a.id} astrologer={a} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
