"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Lock, Mail, Phone, ShieldCheck, Sparkles, User } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";

export default function LoginPage() {
  const router = useRouter();
  const { user, sendOtp, verifyOtp, loginWithPassword, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<"otp" | "password" | "register">("otp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // If already logged in, show redirect card
  if (user) {
    return (
      <>
        <SiteHeader />
        <main style={{ minHeight: "80vh", backgroundColor: "#FDFBF7", display: "grid", placeItems: "center", padding: "2rem 1rem" }}>
          <div className="surface-card" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem", textAlign: "center" }}>
            <CheckCircle2 size={50} color="#2E7D32" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.5rem", color: "#351044", marginBottom: "0.5rem", fontFamily: "var(--font-serif, serif)" }}>
              Welcome back, {user.fullName}!
            </h2>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              You are currently authenticated as a verified devotee.
            </p>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <Link href="/account" className="btn btn-purple" style={{ textDecoration: "none" }}>
                Go to Customer Dashboard <ArrowRight size={15} />
              </Link>
              <Link href="/" className="btn btn-outline" style={{ textDecoration: "none" }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      setStep("otp");
      if (res.debugOtp) setDebugOtp(res.debugOtp);
    } else {
      setError(res.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);
    const res = await verifyOtp(phone, otp, fullName || undefined);
    setLoading(false);
    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Incorrect OTP. Please check and try again.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Invalid email or password.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerWithEmail({ fullName, email, password, phone: phone || undefined });
    setLoading(false);
    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    const demoPhone = "9988776655";
    setPhone(demoPhone);
    const sendRes = await sendOtp(demoPhone);
    if (sendRes.success && sendRes.debugOtp) {
      const vRes = await verifyOtp(demoPhone, sendRes.debugOtp, "Rohan Sharma");
      if (vRes.success) {
        router.push("/account");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: "85vh", backgroundColor: "#FDFBF7", paddingBottom: "4rem" }}>
        {/* Navigation Breadcrumb & Back Bar */}
        <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(212,168,79,0.25)", padding: "0.85rem 0" }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
              <Link href="/" style={{ color: "#351044", fontWeight: 600, textDecoration: "none" }}>Home</Link>
              <ChevronRight size={14} color="#D4A84F" />
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>Devotee Login</span>
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

        {/* Auth Form Card */}
        <section className="container" style={{ marginTop: "2.5rem", display: "grid", placeItems: "center" }}>
          <div
            className="surface-card"
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "0",
              overflow: "hidden",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(53,16,68,0.08)",
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #351044 0%, #240B32 100%)",
                color: "#FFFFFF",
                padding: "2rem 1.5rem",
                textAlign: "center",
              }}
            >
              <Link href="/" style={{ display: "inline-block", marginBottom: "0.75rem", textDecoration: "none" }}>
                <NamhAstroLogo size={48} />
              </Link>
              <h1 style={{ fontSize: "1.45rem", color: "#FFFFFF", margin: "0 0 0.3rem", fontFamily: "var(--font-serif, serif)" }}>
                Devotee Sign In
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.84rem", margin: 0 }}>
                Access Janam Kundli, Devotee Wallet &amp; Consultations
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(212,168,79,0.25)" }}>
              <button
                type="button"
                onClick={() => { setMode("otp"); setStep("phone"); setError(null); }}
                style={{
                  padding: "0.75rem",
                  border: "none",
                  backgroundColor: mode === "otp" ? "#FFFFFF" : "#F7F5FA",
                  color: mode === "otp" ? "#351044" : "#777",
                  fontWeight: mode === "otp" ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  borderBottom: mode === "otp" ? "2px solid #D4A84F" : "none",
                }}
              >
                OTP Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("password"); setError(null); }}
                style={{
                  padding: "0.75rem",
                  border: "none",
                  backgroundColor: mode === "password" ? "#FFFFFF" : "#F7F5FA",
                  color: mode === "password" ? "#351044" : "#777",
                  fontWeight: mode === "password" ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  borderBottom: mode === "password" ? "2px solid #D4A84F" : "none",
                }}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                style={{
                  padding: "0.75rem",
                  border: "none",
                  backgroundColor: mode === "register" ? "#FFFFFF" : "#F7F5FA",
                  color: mode === "register" ? "#351044" : "#777",
                  fontWeight: mode === "register" ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  borderBottom: mode === "register" ? "2px solid #D4A84F" : "none",
                }}
              >
                New Account
              </button>
            </div>

            <div style={{ padding: "1.75rem" }}>
              {error && (
                <div style={{ padding: "0.75rem", backgroundColor: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "8px", color: "#C53030", fontSize: "0.84rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              {/* Mode: OTP */}
              {mode === "otp" && step === "phone" && (
                <form onSubmit={handleSendOtp} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Mobile Number
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{ padding: "0.55rem 0.75rem", backgroundColor: "#F7F5FA", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.9rem", color: "#555", fontWeight: 600 }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Full Name (Optional for first-time login)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: "100%", padding: "0.75rem", fontWeight: 600 }}>
                    {loading ? "Sending OTP..." : "Get Verification Code"}
                  </button>
                </form>
              )}

              {/* Mode: OTP Verification */}
              {mode === "otp" && step === "otp" && (
                <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "#666" }}>
                      OTP sent to +91 {phone}
                    </span>
                    {debugOtp && (
                      <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: "#2E7D32", fontWeight: 600, backgroundColor: "#F0FFF4", padding: "0.3rem", borderRadius: "4px" }}>
                        Demo Auto-fill OTP: {debugOtp}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="form-input"
                      style={{ textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.4em", fontWeight: 700 }}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-purple" style={{ width: "100%", padding: "0.75rem", fontWeight: 600 }}>
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    style={{ background: "transparent", border: "none", color: "#D4A84F", fontSize: "0.82rem", cursor: "pointer", textAlign: "center" }}
                  >
                    ← Change Phone Number
                  </button>
                </form>
              )}

              {/* Mode: Password */}
              {mode === "password" && (
                <form onSubmit={handlePasswordLogin} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="devotee@namhastro.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-purple" style={{ width: "100%", padding: "0.75rem", fontWeight: 600 }}>
                    {loading ? "Authenticating..." : "Sign In with Password"}
                  </button>
                </form>
              )}

              {/* Mode: Register */}
              {mode === "register" && (
                <form onSubmit={handleRegister} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBottom: "0.3rem" }}>
                      Choose Password
                    </label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: "100%", padding: "0.75rem", fontWeight: 600 }}>
                    {loading ? "Creating Account..." : "Create Devotee Account"}
                  </button>
                </form>
              )}

              {/* Quick Demo Login Option */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.08)", textAlign: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "0.5rem" }}>
                  Instant Verification for Testing:
                </span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="btn btn-outline btn-sm"
                  style={{ width: "100%", fontSize: "0.82rem" }}
                >
                  ⚡ One-Click Demo Devotee Login (+91 9988776655)
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
