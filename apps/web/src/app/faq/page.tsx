"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, ChevronUp, HelpCircle, MessageCircle, PhoneCall, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const FAQ_ITEMS = [
  {
    category: "Consultations & Calling",
    question: "How do paid consultations work on NAMH ASTRO?",
    answer: "You can consult with any verified Vedic astrologer via real-time Live Chat, HD Audio Call, or Video Consultation. Billing is calculated on a transparent per-minute rate. When you click 'Chat' or 'Call', our server checks your wallet balance and reserves the minimum consultation amount. As soon as the astrologer joins, billing begins per second. When the session ends, the exact time is charged and any unused reserved funds are instantly restored to your wallet.",
  },
  {
    category: "Consultations & Calling",
    question: "Will the astrologer see my personal phone number?",
    answer: "Never. Your personal phone number and personal identity are 100% confidential. All audio and video calls run through encrypted Agora WebRTC tunnels using temporary cryptographically signed session tokens. Neither the astrologer nor any third party ever receives your personal contact number.",
  },
  {
    category: "Wallet & Payments",
    question: "How do I recharge my Devotee Wallet?",
    answer: "Go to your Wallet section by clicking 'Wallet' in the top header or visiting /account/wallet. Select a recharge amount (e.g. ₹200, ₹500, ₹1000, ₹2000) and click 'Proceed to Recharge'. You can pay via UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, or Net Banking powered by Razorpay. Your balance updates immediately upon payment verification.",
  },
  {
    category: "Wallet & Payments",
    question: "What happens if a call drops or disconnects prematurely?",
    answer: "If a call disconnects due to network instability within the first 60 seconds, no per-minute fee is billed. Furthermore, if you encounter audio/video line quality issues, you can file a quick 1-click dispute in your dashboard or contact our 24×7 customer care for a prompt 100% refund credit to your wallet.",
  },
  {
    category: "Astrologers & Verification",
    question: "How are astrologers verified on NAMH ASTRO?",
    answer: "Every astrologer must complete our rigorous 4-step accreditation process: 1) Identity and address verification (Aadhaar/PAN/KYC); 2) Academic & Shastric certifications from recognized Jyotish institutes (e.g. Bharatiya Vidya Bhavan, Kashi Vidvat Parishad); 3) Technical interview and live chart analysis assessment by our senior Vedic board; 4) Ongoing quality monitoring and devotee rating audits.",
  },
  {
    category: "Puja & Store",
    question: "How does Online Puja booking work?",
    answer: "When you book a Puja on NAMH ASTRO, our certified Vedic Pandits perform the sacred rituals at renowned pilgrimage shrines (Varanasi, Haridwar, Ujjain, Trimbakeshwar). You provide your Gotra and family names for the personal Sankalp. You receive a live video room link or HD recorded video proof of the consecrated ceremony, followed by dispatch of energized Prasad to your doorstep.",
  },
  {
    category: "Puja & Store",
    question: "Are gemstones and spiritual items certified?",
    answer: "Yes, 100%. Every gemstone sold in the NAMH ASTRO Store includes an independent government-recognized gemological laboratory certificate verifying its natural authenticity, carat weight, clarity, and origin. All Yantras and Rudrakshas undergo traditional Vedic consecration (Prana Pratishtha) before dispatch.",
  },
  {
    category: "Privacy & Account",
    question: "Can I delete my account or birth profile data?",
    answer: "Yes. In accordance with the Digital Personal Data Protection Act 2023, you have full ownership of your data. You can edit or delete your stored birth profiles, Janam Kundli charts, and account details directly in your customer profile settings, or request permanent deletion by emailing support@namhastro.com.",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Consultations & Calling", "Wallet & Payments", "Astrologers & Verification", "Puja & Store", "Privacy & Account"];

  const filteredFaqs = selectedCategory === "All"
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((f) => f.category === selectedCategory);

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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Frequently Asked Questions</span>
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
              <HelpCircle size={14} /> Knowledge Base &amp; Help Centre
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Frequently Asked Questions
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Find instant answers to questions about consultation billing, calling privacy, wallet recharges, refund policies, and astrologer credentials.
            </p>
          </div>
        </section>

        {/* Filter Pills */}
        <section className="container" style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`btn btn-sm ${selectedCategory === c ? "btn-purple" : "btn-outline"}`}
                style={{ borderRadius: "9999px" }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div style={{ maxWidth: "850px", margin: "0 auto", display: "grid", gap: "1rem" }}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={faq.question}
                  className="surface-card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    backgroundColor: isOpen ? "#FFFDF9" : "#FFFFFF",
                    borderColor: isOpen ? "#D4A84F" : "rgba(212,168,79,0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: 0,
                    }}
                  >
                    <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "#351044", fontFamily: "var(--font-serif, serif)" }}>
                      {faq.question}
                    </span>
                    <span style={{ color: "#D4A84F", flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(212,168,79,0.2)", fontSize: "0.9rem", color: "#555", lineHeight: 1.7 }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need More Assistance Banner */}
          <div style={{ maxWidth: "850px", margin: "3rem auto 0", padding: "1.5rem", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h4 style={{ margin: "0 0 0.25rem", color: "#351044", fontSize: "1.05rem" }}>Still have a specific question?</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>Our support team is available 24×7 via live chat and phone.</p>
            </div>
            <Link href="/contact" className="btn btn-purple btn-sm" style={{ textDecoration: "none" }}>
              Contact 24×7 Support <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
