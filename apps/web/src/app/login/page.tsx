"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { user, sendOtp, verifyOtp, loginWithPassword, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<"OTP" | "PASSWORD" | "REGISTER">("OTP");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setOtpSent(true);
        if (res.debugOtp) {
          setDebugOtp(res.debugOtp);
        }
      } else {
        setError(res.message || "Failed to send OTP. Please check your phone number.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp, fullName || undefined);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.error || "Invalid OTP code. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerWithEmail({
        fullName,
        email,
        password,
        phone: phone || undefined,
      });
      if (res.success) {
        setSuccessMsg("Registration successful! Redirecting to your dashboard...");
        setTimeout(() => router.push(redirectUrl), 1000);
      } else {
        setError(res.error || "Registration failed. Email or phone may already be registered.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem 2rem",
        border: "1px solid rgba(212, 168, 79, 0.3)",
        boxShadow: "0 8px 30px rgba(53, 16, 68, 0.08)",
      }}
    >
      <div style={{ textAlign: "center", marginBlockEnd: "1.75rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.8rem",
            borderRadius: "999px",
            background: "rgba(212, 168, 79, 0.15)",
            border: "1px solid rgba(212, 168, 79, 0.35)",
            color: "#9A7518",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBlockEnd: "0.75rem",
          }}
        >
          <Sparkles size={13} /> Sacred Access
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "#351044", margin: "0 0 0.35rem 0" }}>
          {mode === "REGISTER" ? "Create Devotee Account" : "Devotee Sign In"}
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
          {mode === "REGISTER"
            ? "Receive ₹100 complimentary promotional balance on signup"
            : "Access your birth profiles, wallet balance, and consultation history"}
        </p>
      </div>

      {/* Mode Switcher */}
      <div
        style={{
          display: "flex",
          borderRadius: "var(--radius-sm)",
          background: "rgba(53, 16, 68, 0.05)",
          padding: "0.25rem",
          marginBlockEnd: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMode("OTP");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "var(--radius-xs)",
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            background: mode === "OTP" ? "#FFFFFF" : "transparent",
            color: mode === "OTP" ? "#351044" : "var(--color-text-muted)",
            boxShadow: mode === "OTP" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("PASSWORD");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "var(--radius-xs)",
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            background: mode === "PASSWORD" ? "#FFFFFF" : "transparent",
            color: mode === "PASSWORD" ? "#351044" : "var(--color-text-muted)",
            boxShadow: mode === "PASSWORD" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("REGISTER");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "var(--radius-xs)",
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            background: mode === "REGISTER" ? "#FFFFFF" : "transparent",
            color: mode === "REGISTER" ? "#351044" : "var(--color-text-muted)",
            boxShadow: mode === "REGISTER" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          New User
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#b91c1c",
            fontSize: "0.85rem",
            marginBlockEnd: "1.25rem",
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            color: "#15803d",
            fontSize: "0.85rem",
            marginBlockEnd: "1.25rem",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* MODE 1: OTP AUTH */}
      {mode === "OTP" && (
        <>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                  Mobile Phone Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{
                      width: "100%",
                      padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(53, 16, 68, 0.2)",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {loading ? "Sending OTP..." : "Get Verification Code"} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: "1rem" }}>
              {debugOtp && (
                <div
                  style={{
                    padding: "0.6rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(212, 168, 79, 0.12)",
                    border: "1px solid rgba(212, 168, 79, 0.4)",
                    color: "#9A7518",
                    fontSize: "0.82rem",
                  }}
                >
                  <strong>Test Simulation OTP:</strong> {debugOtp}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                  Enter 6-Digit OTP sent to {phone}
                </label>
                <div style={{ position: "relative" }}>
                  <KeyRound size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={{
                      width: "100%",
                      padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(53, 16, 68, 0.2)",
                      fontSize: "1.1rem",
                      letterSpacing: "0.2em",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
                  Your Name (Optional for first-time signups)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-gold)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Change mobile number
              </button>
            </form>
          )}
        </>
      )}

      {/* MODE 2: PASSWORD AUTH */}
      {mode === "PASSWORD" && (
        <form onSubmit={handlePasswordLogin} style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Email Address or Phone
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In with Password"}
          </button>
        </form>
      )}

      {/* MODE 3: REGISTER */}
      {mode === "REGISTER" && (
        <form onSubmit={handleRegister} style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Full Name *
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rameshwar Kumar"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Email Address *
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Mobile Phone
            </label>
            <div style={{ position: "relative" }}>
              <Phone size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#351044", marginBlockEnd: "0.35rem" }}>
              Create Password (min 6 characters) *
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                style={{
                  width: "100%",
                  padding: "0.75rem 0.85rem 0.75rem 2.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(53, 16, 68, 0.2)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Claim ₹100 Bonus & Register"}
          </button>
        </form>
      )}

      {/* Security Note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          marginTop: "1.75rem",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
        }}
      >
        <ShieldCheck size={16} color="#16a34a" /> 256-Bit SSL Encrypted Â· 100% Confidential
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <main style={{ flex: 1, paddingBlock: "3rem 4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="container" style={{ maxWidth: "460px" }}>
          <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
