"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CreditCard, Download, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { DEFAULT_RECHARGE_PACKAGES_INR } from "@namhastro/shared";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function CustomerWalletPage() {
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [notice, setNotice] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Math.max(50, Number(customAmount) || 0) : amount;
  const gstAmount = Math.round(effectiveAmount * 0.18);
  const payableTotal = effectiveAmount + gstAmount;

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlockEnd: "5.5rem" }}>
        <div className="container" style={{ maxInlineSize: "68rem" }}>
          <Link href="/account" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600, color: "var(--royal-purple)", fontSize: "0.85rem", marginBlockEnd: "1rem" }}>
            <ArrowLeft size={15} /> Back to Customer Dashboard
          </Link>

          {/* Segregated Wallet Balances */}
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))", marginBlockEnd: "1.5rem" }}>
            <div className="surface-card" style={{ background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 100%)", color: "#FFFFFF", borderColor: "var(--champagne-gold)" }}>
              <span style={{ fontSize: "0.76rem", color: "#F2C96B", fontWeight: 600 }}>Paid Consultation Balance</span>
              <strong style={{ display: "block", fontSize: "1.95rem", marginBlockStart: "0.25rem" }}>₹0.00</strong>
            </div>
            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Promotional Credits</span>
              <strong style={{ display: "block", fontSize: "1.65rem", color: "var(--royal-purple)", marginBlockStart: "0.25rem" }}>₹0.00</strong>
            </div>
            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Refund Balance</span>
              <strong style={{ display: "block", fontSize: "1.65rem", color: "var(--online)", marginBlockStart: "0.25rem" }}>₹0.00</strong>
            </div>
          </div>

          {/* Recharge Builder */}
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))", marginBlockEnd: "1.5rem" }}>
            <div className="surface-card">
              <h1 className="serif-heading" style={{ fontSize: "1.6rem", color: "var(--royal-purple)", marginBlockEnd: "0.5rem" }}>
                Add Money to Wallet
              </h1>
              <p style={{ fontSize: "0.84rem", marginBlockEnd: "1rem" }}>
                Select an admin-configured recharge pack or enter a custom amount in INR.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.55rem", marginBlockEnd: "0.9rem" }}>
                {DEFAULT_RECHARGE_PACKAGES_INR.map((pack) => (
                  <button
                    key={pack}
                    type="button"
                    onClick={() => {
                      setAmount(pack);
                      setCustomAmount("");
                    }}
                    className={!customAmount && amount === pack ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
                  >
                    ₹{pack.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}>
                Or Custom Amount (₹)
              </label>
              <input
                type="number"
                min={50}
                className="form-input"
                placeholder="Enter custom amount e.g. 750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={{ marginBlockEnd: "1rem" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
                {(["UPI", "CARD", "NETBANKING"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={method === m ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
                  >
                    {m === "UPI" ? <Smartphone size={13} /> : <CreditCard size={13} />} {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-card" style={{ backgroundColor: "var(--ivory)", borderColor: "var(--border-gold)" }}>
              <h2 className="serif-heading" style={{ fontSize: "1.4rem", color: "var(--royal-purple)", marginBlockEnd: "0.85rem" }}>
                Order Summary &amp; GST
              </h2>
              <dl style={{ display: "grid", gap: "0.6rem", fontSize: "0.88rem", marginBlockEnd: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt>Consultation Credits</dt>
                  <dd style={{ fontWeight: 700 }}>₹{effectiveAmount.toLocaleString("en-IN")}.00</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt>GST (18%)</dt>
                  <dd style={{ fontWeight: 700 }}>₹{gstAmount.toLocaleString("en-IN")}.00</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBlockStart: "0.6rem", borderBlockStart: "1px solid var(--border)", fontSize: "1rem", color: "var(--royal-purple)" }}>
                  <dt style={{ fontWeight: 700 }}>Total Payable</dt>
                  <dd style={{ fontWeight: 800 }}>₹{payableTotal.toLocaleString("en-IN")}.00</dd>
                </div>
              </dl>

              <button
                type="button"
                className="btn btn-purple"
                style={{ inlineSize: "100%", marginBlockEnd: "0.75rem" }}
                onClick={() =>
                  setNotice(
                    "Razorpay live/test credentials are pending (Step 5). Wallet balance is never credited without verified payment signature and webhook confirmation."
                  )
                }
              >
                <Wallet size={16} /> Proceed to Razorpay Checkout ({method})
              </button>

              {notice ? (
                <p style={{ fontSize: "0.78rem", color: "var(--royal-purple)", fontWeight: 600, marginBlockEnd: "0.6rem" }}>
                  {notice}
                </p>
              ) : null}

              <p style={{ fontSize: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                <ShieldCheck size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                Server-verified immutable ledger. Consultation credits are non-transferable and compliant with Indian payment guidelines.
              </p>
            </div>
          </div>

          {/* Immutable Transaction Ledger */}
          <div className="surface-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.85rem" }}>
              <h2 className="serif-heading" style={{ fontSize: "1.4rem" }}>Transaction History &amp; GST Invoices</h2>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-subtle)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Download size={14} /> PDF Invoices enabled on paid orders
              </span>
            </div>
            <div className="table-scroll">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", paddingBlock: "1.5rem" }}>
                      No financial transactions recorded yet. Verified Razorpay recharges and consultation debits appear here automatically.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
