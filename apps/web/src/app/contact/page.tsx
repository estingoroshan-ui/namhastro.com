"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Consultation Support",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Contact &amp; 24×7 Support</span>
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
              <Sparkles size={14} /> Devotee Helpdesk &amp; Care
            </span>
            <h1 className="serif-heading" style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              We Are Here for You 24×7
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Whether you need assistance with an ongoing consultation, wallet recharge, order delivery, or astrologer onboarding, our support desk is ready to help with an average response time under 15 minutes.
            </p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="container" style={{ marginTop: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            {/* Contact Channels */}
            <div>
              <h2 style={{ fontSize: "1.4rem", color: "#351044", marginBottom: "1rem", fontFamily: "var(--font-serif, serif)" }}>
                Get in Touch Directly
              </h2>
              <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Our customer care and operational coordinators are available 24 hours a day, 7 days a week, including all Vedic festivals and national holidays.
              </p>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div className="surface-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={18} color="#D4A84F" />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#351044", fontSize: "0.95rem" }}>Official Support Email</strong>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>support@namhastro.com</span>
                    <div style={{ fontSize: "0.75rem", color: "#2E7D32", marginTop: "0.2rem" }}>SLA: Within 15 minutes response</div>
                  </div>
                </div>

                <div className="surface-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={18} color="#D4A84F" />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#351044", fontSize: "0.95rem" }}>Phone &amp; WhatsApp Care</strong>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>+91 98110 01122 · Toll-Free 24×7</span>
                    <div style={{ fontSize: "0.75rem", color: "#2E7D32", marginTop: "0.2rem" }}>Live devotion &amp; payment assistance</div>
                  </div>
                </div>

                <div className="surface-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={18} color="#D4A84F" />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#351044", fontSize: "0.95rem" }}>Corporate Headquarters</strong>
                    <span style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.4, display: "block" }}>
                      NAMH ASTRO Technologies Private Limited<br />
                      Connaught Place, Central Delhi, New Delhi – 110001, India
                    </span>
                  </div>
                </div>

                <div className="surface-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#FFF9F0", border: "1px solid rgba(212,168,79,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock size={18} color="#D4A84F" />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#351044", fontSize: "0.95rem" }}>Operational Hours</strong>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>24 Hours · 365 Days Uninterrupted Live Service</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Request Form */}
            <div className="surface-card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.4rem", color: "#351044", marginBottom: "0.5rem", fontFamily: "var(--font-serif, serif)" }}>
                Submit a Support Ticket
              </h2>
              <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Fill out the details below and our senior support executive will attend to your request immediately.
              </p>

              {submitted ? (
                <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: "10px" }}>
                  <CheckCircle2 size={44} color="#2E7D32" style={{ margin: "0 auto 0.75rem" }} />
                  <h3 style={{ color: "#22543D", margin: "0 0 0.5rem" }}>Ticket Dispatched Successfully!</h3>
                  <p style={{ color: "#276749", fontSize: "0.88rem", margin: "0 0 1rem" }}>
                    Ticket Reference <strong>#TKT-{Math.floor(100000 + Math.random() * 900000)}</strong> has been opened. Our support lead has been notified via WhatsApp &amp; Email.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-purple btn-sm">
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Aarav Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Issue Category / Department
                    </label>
                    <select
                      className="form-input"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="Consultation Support">Consultation Quality / Connection Issue</option>
                      <option value="Wallet & Recharge">Wallet Recharge / Payment Status</option>
                      <option value="Refund & Ledger">Refund Request / Balance Adjustment</option>
                      <option value="Puja Booking">Online Puja / Sankalp Coordination</option>
                      <option value="Astro Store Order">Astro Store Order / Gemstone Delivery</option>
                      <option value="Astrologer Partner Onboarding">Astrologer / Pandit Onboarding</option>
                      <option value="General Feedback">General Devotee Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Message / Describe Your Concern
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="form-input"
                      placeholder="Please provide details, order/session ID if applicable..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-gold" style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem", fontWeight: 600 }}>
                    <Send size={16} /> Submit Support Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
