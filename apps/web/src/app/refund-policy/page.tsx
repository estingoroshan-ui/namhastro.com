"use client";

import Link from "next/link";
import { ArrowLeftRight, Clock, HelpCircle, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function RefundPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "2.5rem 4rem" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBlockEnd: "1.5rem" }}>
            <Link href="/" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span>Refund &amp; Cancellation Policy</span>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem",
              border: "1px solid rgba(212, 168, 79, 0.25)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBlockEnd: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(53, 16, 68, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#351044" }}>
                <RefreshCw size={22} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "#351044", margin: 0 }}>
                  Refund &amp; Cancellation Policy
                </h1>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Transparent, automated double-entry ledger refund rules for NAMH ASTRO
                </span>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBlock: "1.5rem",
              }}
            >
              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                <div style={{ fontWeight: 600, color: "#16a34a", fontSize: "0.95rem", marginBlockEnd: "0.25rem" }}>
                  Instant Automated Refund
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  If a call disconnects or astrologer leaves within the first 60 seconds.
                </div>
              </div>

              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", background: "rgba(212, 168, 79, 0.08)", border: "1px solid rgba(212, 168, 79, 0.3)" }}>
                <div style={{ fontWeight: 600, color: "#9A7518", fontSize: "0.95rem", marginBlockEnd: "0.25rem" }}>
                  7-Day Dispute Window
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Submit quality complaints within 7 calendar days of consultation completion.
                </div>
              </div>

              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", background: "rgba(53, 16, 68, 0.05)", border: "1px solid rgba(53, 16, 68, 0.15)" }}>
                <div style={{ fontWeight: 600, color: "#351044", fontSize: "0.95rem", marginBlockEnd: "0.25rem" }}>
                  Bank Source Reversal
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Unused real wallet balances refundable to original payment source (5-7 days).
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: "1.75rem", color: "#444", fontSize: "0.92rem", lineHeight: 1.65, marginTop: "1rem" }}>
              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  1. Consultation Refunds (Chat / Audio / Video)
                </h2>
                <p>
                  At NAMH ASTRO, your satisfaction is protected by real-time server-side session tracking:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.4rem" }}>
                  <li>
                    <strong>Immediate Connection Failures:</strong> If you are unable to connect with the astrologer due to a technical glitch, server error, or astrologer unavailability, 100% of the reserved coins are immediately released back into your wallet.
                  </li>
                  <li>
                    <strong>Calls Under 60 Seconds:</strong> If an audio or video call disconnects within 60 seconds of joining, the call is marked as cancelled and no charge is levied.
                  </li>
                  <li>
                    <strong>Poor Call Quality or Silence:</strong> If an astrologer remained unresponsive, had unintelligible audio, or behaved inappropriately, raise a dispute from your consultation history or email support@namhastro.com. Upon verification by our QA team, a 100% wallet credit will be issued.
                  </li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  2. Wallet Recharges &amp; Source Bank Reversals
                </h2>
                <p>
                  Money deposited into your NAMH ASTRO wallet via UPI, credit/debit card, or net banking remains valid indefinitely.
                  If you wish to withdraw unspent real deposit balance back to your original bank account:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.4rem" }}>
                  <li>Submit a withdrawal request to support@namhastro.com quoting your registered mobile number and transaction ID.</li>
                  <li>Promotional or bonus balances granted as platform gifts are strictly non-refundable and cannot be cashed out.</li>
                  <li>Approved bank reversals are processed via Razorpay and take between 5 to 7 business days to reflect on your card or bank statement.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  3. Online Puja Cancellations
                </h2>
                <p>
                  Because personalized Pujas involve purchasing sacred samagri, reserving priests, and scheduling auspicious Muhurats:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.4rem" }}>
                  <li><strong>More than 24 hours prior to Puja:</strong> 100% refund to NAMH ASTRO wallet.</li>
                  <li><strong>Less than 24 hours prior to Puja:</strong> Cancellations cannot be processed as temple arrangements and samagri are finalized; however, you can reschedule to a future Muhurat at zero penalty.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  4. Astro Store Physical Products
                </h2>
                <p>
                  Rudrakshas, Yantras, and energized gemstones are inspected and lab-certified before dispatch. If you receive
                  a damaged, defective, or incorrect item:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "grid", gap: "0.4rem" }}>
                  <li>Report the defect within 48 hours of parcel delivery with unboxing photos or video to support@namhastro.com.</li>
                  <li>We will dispatch a free courier pickup and issue an immediate replacement or full wallet refund.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#351044", marginBlockEnd: "0.5rem" }}>
                  5. Dispute Resolution Process
                </h2>
                <p>
                  To initiate a refund request, simply email <strong>support@namhastro.com</strong> or fill out our 
                  <Link href="/contact" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 600 }}> Contact Support Form</Link>.
                  Our customer dispute desk reviews and resolves all claims within 24 business hours.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
