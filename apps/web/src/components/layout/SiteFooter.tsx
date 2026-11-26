import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid" style={{ marginBlockEnd: "2.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBlockEnd: "0.9rem" }}>
              <NamhAstroLogo size={42} />
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 700, color: "#FFFFFF" }}>
                  NAMH ASTRO
                </div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#F2C96B", textTransform: "uppercase" }}>
                  Sacred Vedic Wisdom
                </div>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.86rem", marginBlockEnd: "1rem" }}>
              NAMH ASTRO is India&apos;s trusted Vedic astrology consultation marketplace connecting
              seekers with verified astrologers via private chat, audio calls, video sessions,
              Janam Kundli, online Puja, and authentic spiritual products.
            </p>
            <div style={{ display: "grid", gap: "0.45rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.85)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <Mail size={14} color="#F2C96B" /> support@namhastro.com
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <Phone size={14} color="#F2C96B" /> 24×7 Customer Care
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <MapPin size={14} color="#F2C96B" /> namhastro.com · India
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ color: "#F2C96B", fontSize: "0.95rem", marginBlockEnd: "0.85rem" }}>
              Consultations
            </h3>
            <ul style={{ display: "grid", gap: "0.5rem", fontSize: "0.84rem" }}>
              <li><Link href="/astrologers?mode=chat">Chat with Astrologer</Link></li>
              <li><Link href="/astrologers?mode=call">Talk to Astrologer</Link></li>
              <li><Link href="/astrologers?mode=video">Video Consultation</Link></li>
              <li><Link href="/consultation/chat">Live Chat Room</Link></li>
              <li><Link href="/consultation/call">Audio &amp; Video Room</Link></li>
              <li><Link href="/#live-astrologers">Live Astrologer Sessions</Link></li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#F2C96B", fontSize: "0.95rem", marginBlockEnd: "0.85rem" }}>
              Vedic Services
            </h3>
            <ul style={{ display: "grid", gap: "0.5rem", fontSize: "0.84rem" }}>
              <li><Link href="/kundli">Free Janam Kundli</Link></li>
              <li><Link href="/#kundli-matching">Kundli Matching (Guna Milan)</Link></li>
              <li><Link href="/horoscope">Daily Horoscope</Link></li>
              <li><Link href="/panchang">Today&apos;s Panchang &amp; Muhurat</Link></li>
              <li><Link href="/puja">Online Puja Booking</Link></li>
              <li><Link href="/store">NAMH Astro Store</Link></li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#F2C96B", fontSize: "0.95rem", marginBlockEnd: "0.85rem" }}>
              Company &amp; Portals
            </h3>
            <ul style={{ display: "grid", gap: "0.5rem", fontSize: "0.84rem" }}>
              <li><Link href="/about">About NAMH ASTRO</Link></li>
              <li><Link href="/account">Customer Dashboard</Link></li>
              <li><Link href="/account/wallet">My Wallet &amp; Recharge</Link></li>
              <li><Link href="/partner">Astrologer Partner Portal</Link></li>
              <li><Link href="/pandit">Pandit Portal</Link></li>
              <li><Link href="/admin">Super Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#F2C96B", fontSize: "0.95rem", marginBlockEnd: "0.85rem" }}>
              Trust &amp; Support
            </h3>
            <ul style={{ display: "grid", gap: "0.5rem", fontSize: "0.84rem" }}>
              <li><Link href="/contact">Contact &amp; 24x7 Support</Link></li>
              <li><Link href="/faq">Frequently Asked Questions</Link></li>
              <li><Link href="/privacy">Privacy &amp; Data Protection</Link></li>
              <li><Link href="/refund-policy">Refund &amp; Cancellation Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            padding: "1rem 1.15rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212, 168, 79, 0.28)",
            marginBlockEnd: "1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.65rem",
          }}
        >
          <ShieldCheck size={18} color="#F2C96B" style={{ flexShrink: 0, marginBlockStart: "0.15rem" }} />
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem" }}>
            <strong>Spiritual Guidance Disclaimer:</strong> Astrology, Kundli analysis, Horoscopes,
            and Puja rituals offered on NAMH ASTRO are traditional spiritual guidance services and
            are not scientifically proven predictions or a substitute for professional medical,
            legal, or financial advice.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "0.75rem",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.68)",
          }}
        >
          <span>© {new Date().getFullYear()} NAMH ASTRO (namhastro.com). All rights reserved.</span>
          <span>100% Confidential · Server-Verified Billing · Verified Vedic Scholars</span>
        </div>
      </div>
    </footer>
  );
}
