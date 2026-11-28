"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

export function AuthModal() {
  const { loginModalOpen, closeLoginModal, sendOtp, verifyOtp, loginWithPassword, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<"otp" | "password" | "register">("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  if (!loginModalOpen) return null;

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
      const code = res.debugOtp || "123456";
      setDebugOtp(code);
      setOtp(code);
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
    const res = await verifyOtp(phone, otp, fullName || undefined, {
      dateOfBirth: dateOfBirth || undefined,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Incorrect OTP. Please check and try again.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Invalid email or password.");
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await registerWithEmail({
      fullName,
      email,
      password,
      phone: phone || undefined,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const demoPhone = "9988776655";
    setPhone(demoPhone);
    const sendRes = await sendOtp(demoPhone);
    if (sendRes.success && sendRes.debugOtp) {
      await verifyOtp(demoPhone, sendRes.debugOtp, "Rohan Sharma");
    } else {
      setError("Demo authentication service unreachable.");
    }
    setLoading(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NAMH ASTRO Authentication"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(36, 11, 50, 0.75)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div
        style={{
          inlineSize: "100%",
          maxInlineSize: "28rem",
          backgroundColor: "#FFFFFF",
          borderRadius: "1.25rem",
          boxShadow: "0 25px 50px -12px rgba(36, 11, 50, 0.45)",
          border: "1px solid var(--border-gold)",
          overflow: "hidden",
          position: "relative",
          animation: "fadeIn 200ms ease",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--royal-purple) 0%, var(--deep-plum) 100%)",
            color: "#FFFFFF",
            padding: "1.5rem 1.5rem 1.25rem",
            position: "relative",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.15)",
              border: 0,
              borderRadius: "9999px",
              color: "#FFFFFF",
              padding: "0.4rem",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>

          <Link
            href="/"
            onClick={closeLoginModal}
            style={{ display: "inline-block", marginBlockEnd: "0.5rem", textDecoration: "none" }}
            aria-label="NAMH ASTRO Home"
          >
            <NamhAstroLogo size={48} />
          </Link>
          <h3
            className="serif-heading"
            style={{ color: "#FFFFFF", fontSize: "1.35rem", marginBlockEnd: "0.25rem" }}
          >
            Welcome to NAMH ASTRO
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.82rem" }}>
            Connect with 100% Verified Vedic Astrologers
          </p>

          <div
            style={{
              marginTop: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(212, 168, 79, 0.25)",
              border: "1px solid var(--champagne-gold)",
              color: "#F8D677",
              fontSize: "0.74rem",
              fontWeight: 600,
            }}
          >
            <Sparkles size={12} /> ₹1/min First Consultation Offer
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                borderRadius: "var(--radius-sm)",
                padding: "0.6rem 0.85rem",
                fontSize: "0.82rem",
                marginBlockEnd: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.4rem",
              backgroundColor: "var(--ivory)",
              padding: "0.25rem",
              borderRadius: "var(--radius-sm)",
              marginBlockEnd: "1.25rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("otp");
                setStep("input");
                setError(null);
              }}
              style={{
                padding: "0.45rem",
                borderRadius: "var(--radius-xs)",
                border: 0,
                backgroundColor: mode === "otp" ? "var(--royal-purple)" : "transparent",
                color: mode === "otp" ? "#FFFFFF" : "var(--ink-muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              style={{
                padding: "0.45rem",
                borderRadius: "var(--radius-xs)",
                border: 0,
                backgroundColor: mode !== "otp" ? "var(--royal-purple)" : "transparent",
                color: mode !== "otp" ? "#FFFFFF" : "var(--ink-muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Email &amp; Password
            </button>
          </div>

          {/* Form Content: Mobile OTP */}
          {mode === "otp" && (
            <>
              {step === "input" ? (
                <form onSubmit={handleSendOtp} style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="auth-phone-input"
                      style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}
                    >
                      Enter Mobile Number
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        style={{
                          display: "grid",
                          placeItems: "center",
                          paddingInline: "0.75rem",
                          backgroundColor: "var(--ivory)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        +91
                      </span>
                      <input
                        id="auth-phone-input"
                        type="tel"
                        className="form-input"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-fullname-input"
                      style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}
                    >
                      Your Full Name <span style={{ color: "var(--ink-subtle)", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      id="auth-fullname-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tarun Dhiman"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auth-dob-input"
                      style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}
                    >
                      Date of Birth <span style={{ color: "var(--ink-subtle)", fontWeight: 400 }}>(optional · for Janam Kundli)</span>
                    </label>
                    <input
                      id="auth-dob-input"
                      type="date"
                      className="form-input"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-purple" disabled={loading} style={{ inlineSize: "100%" }}>
                    {loading ? "Generating OTP..." : "Get OTP Code"} <ArrowRight size={16} />
                  </button>

                  <div style={{ textAlign: "center", marginBlockStart: "0.25rem" }}>
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      style={{
                        background: "transparent",
                        border: "1px dashed var(--champagne-gold)",
                        color: "var(--royal-purple)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.45rem 1rem",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ⚡ 1-Click Test Customer Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.84rem", color: "var(--ink-muted)", marginBlockEnd: "0.25rem" }}>
                      Enter 6-digit OTP sent to:
                    </p>
                    <strong style={{ fontSize: "0.96rem", color: "var(--royal-purple)" }}>
                      {phone.startsWith("+") ? phone : `+91 ${phone}`}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setStep("input")}
                      style={{ display: "block", margin: "0.25rem auto 0", border: 0, background: "transparent", color: "var(--champagne-gold)", fontSize: "0.76rem", cursor: "pointer", fontWeight: 600 }}
                    >
                      Change Number
                    </button>
                  </div>

                  <div
                    style={{
                      backgroundColor: "rgba(212, 168, 79, 0.12)",
                      border: "1px solid var(--champagne-gold)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.6rem 0.85rem",
                      textAlign: "center",
                      color: "var(--royal-purple)",
                    }}
                  >
                    <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>
                      Verification Code:
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "3px", color: "var(--royal-purple)", margin: "0.15rem 0" }}>
                      {otp || debugOtp || "123456"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600 }}>
                      ✓ Code auto-filled for instant verification
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      style={{ textAlign: "center", fontSize: "1.25rem", letterSpacing: "4px", fontWeight: 700 }}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-gold" disabled={loading} style={{ inlineSize: "100%" }}>
                    {loading ? "Verifying..." : "Verify & Start Consultation"} <CheckCircle2 size={16} />
                  </button>
                </form>
              )}
            </>
          )}

          {/* Form Content: Password Login */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="auth-email-input"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}
                >
                  Email Address or Mobile Number
                </label>
                <input
                  id="auth-email-input"
                  type="text"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password-input"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.35rem" }}
                >
                  Password
                </label>
                <input
                  id="auth-password-input"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-purple" disabled={loading} style={{ inlineSize: "100%" }}>
                {loading ? "Signing in..." : "Login to Account"} <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  style={{ border: 0, background: "transparent", color: "var(--royal-purple)", fontWeight: 700, cursor: "pointer" }}
                >
                  Register Here
                </button>
              </div>
            </form>
          )}

          {/* Form Content: Email Registration */}
          {mode === "register" && (
            <form onSubmit={handleEmailRegister} style={{ display: "grid", gap: "0.85rem" }}>
              <div>
                <label
                  htmlFor="reg-name-input"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.25rem" }}
                >
                  Full Name
                </label>
                <input
                  id="reg-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Anjali Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email-input"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.25rem" }}
                >
                  Email Address
                </label>
                <input
                  id="reg-email-input"
                  type="email"
                  className="form-input"
                  placeholder="anjali@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reg-pass-input"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBlockEnd: "0.25rem" }}
                >
                  Password (min 6 characters)
                </label>
                <input
                  id="reg-pass-input"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-purple" disabled={loading} style={{ inlineSize: "100%", marginBlockStart: "0.35rem" }}>
                {loading ? "Registering..." : "Create Account"} <CheckCircle2 size={16} />
              </button>

              <div style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  style={{ border: 0, background: "transparent", color: "var(--royal-purple)", fontWeight: 700, cursor: "pointer" }}
                >
                  Login Here
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Trust Footnote */}
          <div
            style={{
              marginBlockStart: "1.25rem",
              paddingBlockStart: "0.85rem",
              borderBlockStart: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.74rem",
              color: "var(--ink-subtle)",
            }}
          >
            <ShieldCheck size={14} color="#16A34A" /> 100% Confidential · Strict Vedic Privacy
          </div>
        </div>
      </div>
    </div>
  );
}
