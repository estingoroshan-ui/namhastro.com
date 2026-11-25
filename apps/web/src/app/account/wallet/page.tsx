"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface RechargePackageItem {
  id: string;
  code: string;
  name: string;
  amountInr: number;
  bonusInr: number;
  totalCreditInr: number;
  isPopular: boolean;
  badgeText?: string;
}

interface WalletBalanceData {
  currency: string;
  paidBalanceInr: number;
  promoBalanceInr: number;
  totalBalanceInr: number;
}

interface TransactionItem {
  id: string;
  idempotencyKey: string;
  type: string;
  amountInr: string;
  balanceAfterInr: string;
  referenceType?: string;
  description: string;
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerGstin?: string | null;
  sacCode: string;
  taxableAmountInr: string;
  cgstInr: string;
  sgstInr: string;
  totalAmountInr: string;
  issuedAt: string;
}

export default function CustomerWalletPage() {
  const { user, token, openLoginModal } = useAuth();
  const [packages, setPackages] = useState<RechargePackageItem[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>("");
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [customerGstin, setCustomerGstin] = useState<string>("");

  const [walletBalance, setWalletBalance] = useState<WalletBalanceData>({
    currency: "INR",
    paidBalanceInr: 0,
    promoBalanceInr: 0,
    totalBalanceInr: 0,
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch recharge packages
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/wallet/packages`);
        const json = await res.json();
        if (json.success && json.data) {
          setPackages(json.data);
          const popular = json.data.find((p: RechargePackageItem) => p.isPopular) || json.data[2] || json.data[0];
          if (popular) {
            setSelectedPackId(popular.id);
            setAmount(popular.amountInr);
          }
        }
      } catch (err) {
        console.warn("Could not load recharge packages:", err);
      }
    }
    loadPackages();
  }, []);

  // Fetch balance, transactions, and invoices
  const fetchWalletData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [balRes, txRes, invRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/wallet/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [balJson, txJson, invJson] = await Promise.all([balRes.json(), txRes.json(), invRes.json()]);

      if (balJson.success && balJson.data) {
        setWalletBalance(balJson.data);
      }
      if (txJson.success && txJson.data?.transactions) {
        setTransactions(txJson.data.transactions);
      }
      if (invJson.success && invJson.data) {
        setInvoices(invJson.data);
      }
    } catch (err) {
      console.warn("Could not load wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWalletData();
    }
  }, [token]);

  const effectiveAmount = customAmount ? Math.max(50, Number(customAmount) || 0) : amount;
  const gstAmount = Math.round(effectiveAmount * 0.18);
  const payableTotal = effectiveAmount + gstAmount;

  // Selected package bonus calculation
  const selectedPackage = packages.find((p) => p.id === selectedPackId && !customAmount);
  const bonusCredit = selectedPackage ? selectedPackage.bonusInr : 0;

  // Initiate Razorpay recharge
  const handleRecharge = async () => {
    if (!token) {
      openLoginModal();
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // 1. Create order on backend
      const res = await fetch(`${API_BASE}/api/v1/wallet/recharge/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountInr: effectiveAmount,
          rechargePackageId: selectedPackage?.id,
          customerGstin: customerGstin || undefined,
        }),
      });

      const orderJson = await res.json();
      if (!orderJson.success) {
        setErrorMsg(orderJson.message || "Failed to initialize recharge order.");
        setLoading(false);
        return;
      }

      const orderData = orderJson.data;

      // 2. Open Razorpay Checkout or fallback to simulation
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amountPaise,
        currency: "INR",
        name: "NAMH ASTRO",
        description: `Wallet Recharge: ₹${orderData.walletCreditInr} + ₹${orderData.gstInr} GST`,
        image: "/images/branding/namh-logo-symbol.svg",
        order_id: orderData.gatewayOrderId.startsWith("order_sim_") ? undefined : orderData.gatewayOrderId,
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone,
        },
        theme: {
          color: "#351044",
        },
        handler: async function (response: any) {
          // 3. Verify on backend
          await verifyPaymentOnServer(
            orderData.gatewayOrderId,
            response.razorpay_payment_id || `pay_sim_${Date.now()}`,
            response.razorpay_signature || "simulated_valid_test_signature"
          );
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (typeof (window as any).Razorpay !== "undefined" && !orderData.gatewayOrderId.startsWith("order_sim_")) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Simulated test checkout for instant local verification
        const simPaymentId = `pay_sim_${Date.now()}`;
        const simSignature = "simulated_valid_test_signature";
        await verifyPaymentOnServer(orderData.gatewayOrderId, simPaymentId, simSignature);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during recharge.");
      setLoading(false);
    }
  };

  const verifyPaymentOnServer = async (gatewayOrderId: string, gatewayPaymentId: string, gatewaySignature: string) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/api/v1/wallet/recharge/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        setSuccessMsg(`Wallet successfully recharged! ₹${effectiveAmount} credited. Invoice generated.`);
        await fetchWalletData();
      } else {
        setErrorMsg(verifyJson.message || "Payment verification failed.");
      }
    } catch (err: any) {
      setErrorMsg("Verification request error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlockEnd: "5.5rem" }}>
        <div className="container" style={{ maxInlineSize: "72rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
            <Link
              href="/account"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontWeight: 600,
                color: "var(--royal-purple)",
                fontSize: "0.85rem",
              }}
            >
              <ArrowLeft size={15} /> Back to Customer Dashboard
            </Link>
            {token ? (
              <button
                type="button"
                onClick={fetchWalletData}
                disabled={loading}
                className="btn btn-outline btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh Balance
              </button>
            ) : null}
          </div>

          {/* Feedback Alerts */}
          {successMsg ? (
            <div
              style={{
                backgroundColor: "#DCFCE7",
                border: "1px solid #16A34A",
                color: "#166534",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBlockEnd: "1rem",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          ) : null}

          {errorMsg ? (
            <div
              style={{
                backgroundColor: "#FEE2E2",
                border: "1px solid #EF4444",
                color: "#991B1B",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBlockEnd: "1rem",
                fontSize: "0.88rem",
              }}
            >
              {errorMsg}
            </div>
          ) : null}

          {/* Segregated Wallet Balances */}
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
              marginBlockEnd: "1.5rem",
            }}
          >
            <div
              className="surface-card"
              style={{
                background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 100%)",
                color: "#FFFFFF",
                borderColor: "var(--champagne-gold)",
              }}
            >
              <span style={{ fontSize: "0.76rem", color: "#F2C96B", fontWeight: 600 }}>Total Available Balance</span>
              <strong style={{ display: "block", fontSize: "2rem", marginBlockStart: "0.25rem" }}>
                ₹{walletBalance.totalBalanceInr.toFixed(2)}
              </strong>
            </div>

            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Paid Balance (Withdrawable/Usable)</span>
              <strong
                style={{
                  display: "block",
                  fontSize: "1.65rem",
                  color: "var(--royal-purple)",
                  marginBlockStart: "0.25rem",
                }}
              >
                ₹{walletBalance.paidBalanceInr.toFixed(2)}
              </strong>
            </div>

            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Promotional Bonus Credits</span>
              <strong
                style={{
                  display: "block",
                  fontSize: "1.65rem",
                  color: "var(--saffron)",
                  marginBlockStart: "0.25rem",
                }}
              >
                ₹{walletBalance.promoBalanceInr.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Recharge Builder */}
          <div
            style={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
              marginBlockEnd: "1.5rem",
            }}
          >
            <div className="surface-card">
              <h1
                className="serif-heading"
                style={{ fontSize: "1.5rem", color: "var(--royal-purple)", marginBlockEnd: "0.5rem" }}
              >
                Select Recharge Package
              </h1>
              <p style={{ fontSize: "0.84rem", marginBlockEnd: "1rem" }}>
                Official packs include promotional bonus credits and immediate GST tax invoicing.
              </p>

              {/* Package Cards Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))",
                  gap: "0.6rem",
                  marginBlockEnd: "1.2rem",
                }}
              >
                {packages.map((pack) => {
                  const isSelected = selectedPackId === pack.id && !customAmount;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => {
                        setSelectedPackId(pack.id);
                        setAmount(pack.amountInr);
                        setCustomAmount("");
                      }}
                      className="surface-card"
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        cursor: "pointer",
                        border: isSelected ? "2px solid var(--royal-purple)" : "1px solid var(--border)",
                        backgroundColor: isSelected ? "var(--ivory)" : "#FFFFFF",
                        position: "relative",
                      }}
                    >
                      {pack.badgeText ? (
                        <span
                          style={{
                            position: "absolute",
                            top: "-0.5rem",
                            right: "0.5rem",
                            backgroundColor: "var(--saffron)",
                            color: "#FFFFFF",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.4rem",
                            borderRadius: "1rem",
                          }}
                        >
                          {pack.badgeText}
                        </span>
                      ) : null}
                      <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--royal-purple)" }}>
                        ₹{pack.amountInr}
                      </strong>
                      {pack.bonusInr > 0 ? (
                        <span style={{ fontSize: "0.7rem", color: "#16A34A", fontWeight: 600 }}>
                          + ₹{pack.bonusInr} Extra
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "var(--ink-subtle)" }}>Starter Pack</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}>
                Or Enter Custom Amount (₹)
              </label>
              <input
                type="number"
                min={50}
                className="form-input"
                placeholder="Enter custom amount e.g. 750"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedPackId("");
                }}
                style={{ marginBlockEnd: "1rem" }}
              />

              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}>
                Business GSTIN (Optional for Tax Credit)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                style={{ marginBlockEnd: "1rem" }}
              />

              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}>
                Preferred Payment Method
              </label>
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

            {/* Order Summary & GST Breakdown */}
            <div
              className="surface-card"
              style={{ backgroundColor: "var(--ivory)", borderColor: "var(--champagne-gold)" }}
            >
              <h2
                className="serif-heading"
                style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBlockEnd: "0.85rem" }}
              >
                Order Summary &amp; GST Breakdown
              </h2>
              <dl style={{ display: "grid", gap: "0.6rem", fontSize: "0.88rem", marginBlockEnd: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt>Consultation Wallet Credit</dt>
                  <dd style={{ fontWeight: 700 }}>₹{effectiveAmount.toLocaleString("en-IN")}.00</dd>
                </div>
                {bonusCredit > 0 ? (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16A34A" }}>
                    <dt>Promotional Bonus (Free)</dt>
                    <dd style={{ fontWeight: 700 }}>+ ₹{bonusCredit.toLocaleString("en-IN")}.00</dd>
                  </div>
                ) : null}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <dt>GST (18% - SAC 998399)</dt>
                  <dd style={{ fontWeight: 700 }}>₹{gstAmount.toLocaleString("en-IN")}.00</dd>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBlockStart: "0.6rem",
                    borderBlockStart: "1px solid var(--border)",
                    fontSize: "1.05rem",
                    color: "var(--royal-purple)",
                  }}
                >
                  <dt style={{ fontWeight: 700 }}>Total Payable</dt>
                  <dd style={{ fontWeight: 800 }}>₹{payableTotal.toLocaleString("en-IN")}.00</dd>
                </div>
              </dl>

              <button
                type="button"
                className="btn btn-purple"
                style={{ inlineSize: "100%", marginBlockEnd: "0.75rem" }}
                disabled={loading || effectiveAmount < 50}
                onClick={handleRecharge}
              >
                <Wallet size={16} />{" "}
                {loading
                  ? "Processing..."
                  : `Pay ₹${payableTotal.toLocaleString("en-IN")} via Razorpay (${method})`}
              </button>

              <p style={{ fontSize: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                <ShieldCheck size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                Instant double-entry ledger settlement. 100% secure Razorpay payment gateway with official GST tax
                invoice.
              </p>
            </div>
          </div>

          {/* Immutable Transaction Ledger & Invoices */}
          <div className="surface-card" style={{ marginBlockEnd: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBlockEnd: "0.85rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h2 className="serif-heading" style={{ fontSize: "1.3rem" }}>
                Wallet Transaction Ledger
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-subtle)" }}>
                Double-entry financial accounting records
              </span>
            </div>
            <div className="table-scroll">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount (₹)</th>
                    <th>Balance After (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", paddingBlock: "1.5rem" }}>
                        No financial transactions recorded yet. Verified Razorpay recharges and consultation debits
                        appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {new Date(tx.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "0.3rem",
                              backgroundColor:
                                tx.type === "WALLET_RECHARGE" || tx.type === "PROMO_CREDIT" ? "#DCFCE7" : "#FEE2E2",
                              color:
                                tx.type === "WALLET_RECHARGE" || tx.type === "PROMO_CREDIT" ? "#166534" : "#991B1B",
                            }}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>{tx.description}</td>
                        <td
                          style={{
                            fontWeight: 700,
                            color:
                              tx.type === "WALLET_RECHARGE" || tx.type === "PROMO_CREDIT" ? "#16A34A" : "var(--ink)",
                          }}
                        >
                          {tx.type === "WALLET_RECHARGE" || tx.type === "PROMO_CREDIT" ? "+" : "-"}₹{tx.amountInr}
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{tx.balanceAfterInr}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST Invoices Section */}
          <div className="surface-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBlockEnd: "0.85rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h2 className="serif-heading" style={{ fontSize: "1.3rem" }}>
                GST Tax Invoices
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-subtle)" }}>
                Compliant with Indian GST regulations (SAC 998399)
              </span>
            </div>
            <div className="table-scroll">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Issued Date</th>
                    <th>Customer Name</th>
                    <th>Taxable (₹)</th>
                    <th>CGST (9%)</th>
                    <th>SGST (9%)</th>
                    <th>Total (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", paddingBlock: "1.5rem" }}>
                        No tax invoices generated yet. Invoices are automatically generated upon successful wallet
                        recharges.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 700, color: "var(--royal-purple)" }}>{inv.invoiceNumber}</td>
                        <td style={{ fontSize: "0.8rem" }}>{new Date(inv.issuedAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ fontSize: "0.82rem" }}>{inv.customerName}</td>
                        <td>₹{inv.taxableAmountInr}</td>
                        <td>₹{inv.cgstInr}</td>
                        <td>₹{inv.sgstInr}</td>
                        <td style={{ fontWeight: 700, color: "var(--royal-purple)" }}>₹{inv.totalAmountInr}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setViewInvoice(inv)}
                            className="btn btn-outline btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.5rem" }}
                          >
                            <FileText size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        {viewInvoice ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
          >
            <div
              className="surface-card"
              style={{
                inlineSize: "100%",
                maxInlineSize: "32rem",
                backgroundColor: "#FFFFFF",
                borderColor: "var(--champagne-gold)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBlockEnd: "1rem",
                  borderBlockEnd: "1px solid var(--border)",
                  paddingBlockEnd: "0.5rem",
                }}
              >
                <h3 className="serif-heading" style={{ fontSize: "1.2rem", color: "var(--royal-purple)" }}>
                  Tax Invoice: {viewInvoice.invoiceNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => setViewInvoice(null)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: "0.15rem 0.4rem" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: "0.85rem", display: "grid", gap: "0.5rem", marginBlockEnd: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>Service Provider:</span>
                  <span style={{ fontWeight: 600 }}>NAMH ASTRO Private Limited</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>Customer Name:</span>
                  <span style={{ fontWeight: 600 }}>{viewInvoice.customerName}</span>
                </div>
                {viewInvoice.customerGstin ? (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Customer GSTIN:</span>
                    <span style={{ fontWeight: 600 }}>{viewInvoice.customerGstin}</span>
                  </div>
                ) : null}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>SAC Code:</span>
                  <span style={{ fontWeight: 600 }}>{viewInvoice.sacCode} (Consulting Services)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>Taxable Value:</span>
                  <span style={{ fontWeight: 600 }}>₹{viewInvoice.taxableAmountInr}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>Central GST (CGST 9%):</span>
                  <span style={{ fontWeight: 600 }}>₹{viewInvoice.cgstInr}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-subtle)" }}>State GST (SGST 9%):</span>
                  <span style={{ fontWeight: 600 }}>₹{viewInvoice.sgstInr}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBlockStart: "0.5rem",
                    borderBlockStart: "1px solid var(--border)",
                    fontSize: "1rem",
                    color: "var(--royal-purple)",
                    fontWeight: 700,
                  }}
                >
                  <span>Total Amount Paid:</span>
                  <span>₹{viewInvoice.totalAmountInr}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-purple btn-sm"
                style={{ inlineSize: "100%" }}
              >
                <Download size={13} /> Print / Save Tax Invoice
              </button>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
