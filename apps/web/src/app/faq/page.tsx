"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Flame,
  HelpCircle,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

interface FAQItem {
  q: string;
  a: string;
  category: "CONSULTATION" | "WALLET" | "KUNDLI" | "PUJA" | "PARTNER";
}

const FAQS: FAQItem[] = [
  {
    category: "CONSULTATION",
    q: "How does private consultation with an astrologer work?",
    a: "You can consult via real-time Chat, Audio Call, or Video Call. Choose an astrologer based on ratings, specialisation, and language, then click 'Start Chat' or 'Call'. The session connects directly inside your browser or mobile app with zero call setup delays. Billing is calculated strictly per minute from the time of connection.",
  },
  {
    category: "CONSULTATION",
    q: "Are my chat conversations and calls private and confidential?",
    a: "Yes, 100%. All communications are encrypted end-to-end using Agora WebRTC protocols. Astrologers never see your phone number or email address, ensuring complete confidentiality. Your Janam Kundli data is only visible to the astrologer for the duration of the consultation.",
  },
  {
    category: "CONSULTATION",
    q: "What happens if a call disconnects due to poor internet?",
    a: "Our server-side billing engine tracks active connection heartbeats. If a disconnect occurs within the first 60 seconds, the session is cancelled and 100% of the reserved amount is instantly returned to your wallet. For longer calls, you are only billed for the exact seconds of connected consultation.",
  },
  {
    category: "WALLET",
    q: "How do I recharge my NAMH ASTRO wallet?",
    a: "Go to 'My Wallet' from your dashboard or top navigation. Select any recharge amount (e.g., ₹100, ₹250, ₹500, ₹1000). You will receive bonus promotional coins on eligible packages. Payments are processed securely via Razorpay supporting UPI, Google Pay, PhonePe, Debit/Credit Cards, and Net Banking.",
  },
  {
    category: "WALLET",
    q: "What is the difference between Real Balance and Promotional Balance?",
    a: "Real balance represents money you deposited via UPI or cards. Promotional balance comprises welcome rewards, referral gifts, and cashbacks granted by NAMH ASTRO. When consulting, our engine automatically consumes promotional coins first, saving you real money!",
  },
  {
    category: "WALLET",
    q: "How do I request a refund if I am unsatisfied with a consultation?",
    a: "We maintain a transparent double-entry financial ledger. If an astrologer failed to respond, provided substandard service, or had technical faults, submit a support ticket via 'Contact Us' or from your consultation history within 7 days. Our audit committee reviews the recording/chat and credits a refund directly to your wallet.",
  },
  {
    category: "KUNDLI",
    q: "How accurate are your Janam Kundli and Horoscope calculations?",
    a: "Our astronomy calculation engine uses high-precision astronomical algorithms based on Chitrapaksha (Lahiri) Ayanamsha, matching Swiss Ephemeris standards. We compute exact planetary longitudes, Bhavas (houses), Vimshottari Mahadasha/Antardasha, Ashtakoot Guna Milan, and daily planetary transits.",
  },
  {
    category: "KUNDLI",
    q: "Can I generate a Kundli if I do not know my exact birth time?",
    a: "Yes. In the Kundli generator, check the 'Birth time unknown' checkbox. The engine will generate a Chandra Kundli (Moon Chart) and Surya Kundli based on your date and place of birth, which astrologers can use to provide accurate insights.",
  },
  {
    category: "PUJA",
    q: "How are Online Pujas performed and how do I participate?",
    a: "Pujas are performed live at consecrated pilgrimage shrines (Kashi, Ujjain, Haridwar, Tirupati) by verified Vedic Pandits. When booking, provide your Gotra and family Sankalp details. You receive a private live stream link on your dashboard and blessed Prasad couriered to your doorstep.",
  },
  {
    category: "PARTNER",
    q: "How do I join NAMH ASTRO as a verified Astrologer or Pandit?",
    a: "Click 'Become an Astrologer' in the navigation bar to register. You will need to submit government photo ID (Aadhaar/PAN), astrology certification or lineage proof, and pass a 2-stage oral interview with our senior astrological board. Once approved, you gain immediate access to our partner app and earnings dashboard.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = activeCategory === "ALL" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "980px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Frequently Asked Questions</span>
          </div>

          <div style={{ textAlign: "center", marginBlockEnd: "2.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                background: "rgba(212, 168, 79, 0.15)",
                border: "1px solid rgba(212, 168, 79, 0.4)",
                color: "#9A7518",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBlockEnd: "0.75rem",
              }}
            >
              <HelpCircle size={14} /> Knowledge Centre
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 700, color: "var(--color-primary)", marginBlockEnd: "0.5rem" }}>
              Frequently Asked Questions
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
              Quick answers about consultations, wallet transactions, Kundli accuracy, and live Pujas.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: "600px", marginInline: "auto", marginBlockEnd: "2rem" }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. refund, billing, kundli, call)..."
              style={{
                width: "100%",
                padding: "0.85rem 1rem 0.85rem 2.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(212, 168, 79, 0.4)",
                fontSize: "0.95rem",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBlockEnd: "2.5rem" }}>
            {[
              { id: "ALL", label: "All Questions" },
              { id: "CONSULTATION", label: "Consultations & Calling" },
              { id: "WALLET", label: "Wallet & Payments" },
              { id: "KUNDLI", label: "Kundli & Horoscope" },
              { id: "PUJA", label: "Online Puja & Prasad" },
              { id: "PARTNER", label: "Astrologer Onboarding" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedIndex(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: activeCategory === cat.id ? "1px solid var(--color-gold)" : "1px solid rgba(53, 16, 68, 0.15)",
                  background: activeCategory === cat.id ? "var(--color-primary)" : "#FFFFFF",
                  color: activeCategory === cat.id ? "#FFFFFF" : "var(--color-primary)",
                  transition: "all 0.2s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", background: "#FFFFFF", borderRadius: "var(--radius-md)" }}>
                <p style={{ color: "var(--color-text-muted)" }}>No questions matched your search query.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "var(--radius-md)",
                      border: isOpen ? "1px solid var(--color-gold)" : "1px solid rgba(212, 168, 79, 0.2)",
                      boxShadow: isOpen ? "0 4px 14px rgba(212, 168, 79, 0.12)" : "var(--shadow-sm)",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <button
                      onClick={() => setExpandedIndex(isOpen ? null : idx)}
                      style={{
                        width: "100%",
                        padding: "1.25rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#351044", fontSize: "1.05rem" }}>
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={20} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                      ) : (
                        <ChevronDown size={20} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 1.5rem 1.25rem 1.5rem",
                          color: "var(--color-text-muted)",
                          fontSize: "0.92rem",
                          lineHeight: 1.6,
                          borderTop: "1px solid rgba(212, 168, 79, 0.1)",
                          paddingTop: "0.9rem",
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still have questions? */}
          <div
            style={{
              marginTop: "3.5rem",
              background: "linear-gradient(135deg, rgba(53, 16, 68, 0.05) 0%, rgba(212, 168, 79, 0.1) 100%)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(212, 168, 79, 0.3)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "#351044", marginBlockEnd: "0.5rem" }}>
              Still have questions?
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBlockEnd: "1.25rem" }}>
              Our dedicated support team is available around the clock to help you.
            </p>
            <Link
              href="/contact"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.5rem",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <PhoneCall size={16} /> Contact Support
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
