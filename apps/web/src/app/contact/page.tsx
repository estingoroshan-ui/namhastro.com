"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    category: "CONSULTATION_ISSUE",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "1140px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Contact &amp; 24x7 Support</span>
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
              <Sparkles size={14} /> 24Ã—7 Devotee Assistance
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: 700, color: "var(--color-primary)", marginBlockEnd: "0.5rem" }}>
              How May We Serve You?
            </h1>
            <p style={{ color: "var(--color-text-muted)", maxWidth: "600px", marginInline: "auto", fontSize: "0.95rem" }}>
              Our dedicated customer resolution team is on standby 24 hours a day, 7 days a week to assist you with consultations, wallet recharges, refunds, or technical questions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            {/* Contact Details & Channels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  background: "#FFFFFF",
                  padding: "1.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.2)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "#351044", marginBlockEnd: "1.25rem" }}>
                  Quick Help Channels
                </h2>

                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", flexShrink: 0 }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#351044", fontSize: "0.95rem" }}>Customer Support Email</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Response within 15 minutes</div>
                      <a href="mailto:support@namhastro.com" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
                        support@namhastro.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", flexShrink: 0 }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#351044", fontSize: "0.95rem" }}>Toll-Free Helpline</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>24x7 Inbound Support</div>
                      <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                        +91 1800-NAMH-ASTRO (+91 1800-626-4278)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044", flexShrink: 0 }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#351044", fontSize: "0.95rem" }}>Headquarters &amp; Ashram Office</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                        NAMH ASTRO Technologies Private Limited<br />
                        Kailash Vedic Complex, MG Road, Bengaluru, Karnataka, 560001, India
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Officer Notice (IT Rules compliance) */}
              <div
                style={{
                  background: "rgba(212, 168, 79, 0.06)",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(212, 168, 79, 0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#9A7518", fontWeight: 600, fontSize: "0.9rem", marginBlockEnd: "0.5rem" }}>
                  <ShieldCheck size={18} /> Statutory Grievance Redressal
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBlockEnd: "0.5rem" }}>
                  In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020:
                </p>
                <div style={{ fontSize: "0.82rem", color: "#351044" }}>
                  <strong>Grievance Officer:</strong> Acharya V. Sharma<br />
                  <strong>Designation:</strong> Head of Consumer Trust &amp; Astrological Ethics<br />
                  <strong>Grievance Email:</strong> grievance@namhastro.com<br />
                  <strong>Turnaround Time:</strong> Acknowledged within 24 hours, resolved within 7 business days.
                </div>
              </div>
            </div>

            {/* Support Request Form */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "2rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(212, 168, 79, 0.2)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "#351044", marginBlockEnd: "0.5rem" }}>
                Send Us a Message
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBlockEnd: "1.5rem" }}>
                Submit your query below. A ticket will automatically be created in our enterprise support system.
              </p>

              {submitted ? (
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2rem",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={48} color="#16a34a" style={{ marginInline: "auto", marginBlockEnd: "1rem" }} />
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#16a34a", marginBlockEnd: "0.5rem" }}>
                    Support Ticket Created!
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBlockEnd: "1.5rem" }}>
                    Your ticket reference has been logged. Our priority response team will email you at <strong>{formData.email}</strong> within 15 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ fullName: "", email: "", phone: "", category: "CONSULTATION_ISSUE", subject: "", message: "" });
                    }}
                    className="btn-primary"
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "var(--radius-sm)" }}
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Rameshwar Kumar"
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(53, 16, 68, 0.2)",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(53, 16, 68, 0.2)",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(53, 16, 68, 0.2)",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(53, 16, 68, 0.2)",
                          fontSize: "0.9rem",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <option value="CONSULTATION_ISSUE">Consultation Call / Chat Issue</option>
                        <option value="WALLET_PAYMENT">Wallet Recharge or Razorpay</option>
                        <option value="REFUND_REQUEST">Refund / Ledger Dispute</option>
                        <option value="PUJA_ORDER">Online Puja or Store Order</option>
                        <option value="ASTROLOGER_PARTNER">Astrologer / Pandit Onboarding</option>
                        <option value="FEEDBACK_OTHER">General Feedback or Suggestion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief overview of your issue"
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(53, 16, 68, 0.2)",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                      Detailed Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include consultation ID, transaction reference, or specific error message..."
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(53, 16, 68, 0.2)",
                        fontSize: "0.9rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    <Send size={16} /> {submitting ? "Sending Ticket..." : "Submit Support Ticket"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
