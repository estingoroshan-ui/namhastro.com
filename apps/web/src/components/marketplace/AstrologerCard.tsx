"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Video,
  Wallet,
  X,
} from "lucide-react";
import type { AstrologerCardData } from "@/data/marketplace";
import { useAuth } from "@/context/AuthContext";

export function AstrologerCard({ astrologer }: { astrologer: AstrologerCardData }) {
  const router = useRouter();
  const { user, token, openLoginModal } = useAuth();
  const [favourite, setFavourite] = useState(false);
  const [confirmModal, setConfirmModal] = useState<"chat" | "call" | "video" | null>(null);

  const statusClass =
    astrologer.status === "ONLINE"
      ? "status-pill status-online"
      : astrologer.status === "BUSY"
        ? "status-pill status-busy"
        : "status-pill status-offline";

  const handleActionClick = (e: React.MouseEvent, type: "chat" | "call" | "video") => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
    } else {
      setConfirmModal(type);
    }
  };

  const handleToggleFavourite = async () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setFavourite((v) => !v);
    if (token) {
      fetch(`http://127.0.0.1:4000/api/v1/customer/favourites/${astrologer.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const getRate = () => {
    if (confirmModal === "video") return astrologer.videoRateInr;
    if (confirmModal === "call") return astrologer.audioRateInr;
    return astrologer.chatRateInr;
  };

  const proceedToConsultation = () => {
    if (!confirmModal) return;
    const dest =
      confirmModal === "chat"
        ? `/consultation/chat?astrologer=${astrologer.slug}`
        : `/consultation/call?mode=${confirmModal === "call" ? "audio" : "video"}&astrologer=${astrologer.slug}`;
    setConfirmModal(null);
    router.push(dest);
  };

  return (
    <>
      <article className="astro-card">
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href={`/astrologer/${astrologer.slug}`} style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={astrologer.photo}
              alt={astrologer.name}
              width={68}
              height={68}
              style={{
                inlineSize: "4.25rem",
                blockSize: "4.25rem",
                borderRadius: "9999px",
                objectFit: "cover",
                border:
                  astrologer.status === "ONLINE"
                    ? "2.5px solid var(--online)"
                    : "2.5px solid var(--champagne-gold)",
              }}
            />
            {astrologer.verified ? (
              <span
                title="KYC Verified Astrologer"
                style={{
                  position: "absolute",
                  insetBlockEnd: "-2px",
                  insetInlineEnd: "-2px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "1px",
                }}
              >
                <BadgeCheck size={16} color="#16A34A" fill="#EAF9EF" />
              </span>
            ) : null}
          </Link>

          <div style={{ flex: 1, minInlineSize: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.35rem" }}>
              <Link
                href={`/astrologer/${astrologer.slug}`}
                style={{
                  fontWeight: 700,
                  fontSize: "0.93rem",
                  color: "var(--ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {astrologer.name}
              </Link>
              <button
                type="button"
                onClick={handleToggleFavourite}
                aria-label={favourite ? "Remove from favourites" : "Add to favourites"}
                style={{
                  border: 0,
                  background: "transparent",
                  padding: "0.15rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Heart
                  size={16}
                  color={favourite ? "#DC2626" : "#7C6F86"}
                  fill={favourite ? "#DC2626" : "none"}
                />
              </button>
            </div>

            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--ink-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBlockStart: "0.15rem",
              }}
            >
              {astrologer.specialisations.slice(0, 3).join(" · ")}
            </p>

            <p style={{ fontSize: "0.74rem", color: "var(--ink-subtle)", marginBlockStart: "0.15rem" }}>
              {astrologer.languages.slice(0, 3).join(", ")} · {astrologer.experienceYears} yrs exp
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.45rem",
                marginBlockStart: "0.35rem",
              }}
            >
              <span className={statusClass}>
                <span
                  style={{
                    inlineSize: "6px",
                    blockSize: "6px",
                    borderRadius: "9999px",
                    backgroundColor: "currentColor",
                  }}
                />
                {astrologer.status}
              </span>

              {astrologer.rating ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  {astrologer.rating.toFixed(1)}
                  <span style={{ color: "var(--ink-subtle)", fontWeight: 500 }}>
                    ({astrologer.reviewCount})
                  </span>
                </span>
              ) : null}

              {astrologer.waitMinutes && astrologer.waitMinutes > 0 ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    fontSize: "0.7rem",
                    color: "var(--busy)",
                    fontWeight: 600,
                  }}
                >
                  <Clock size={11} /> ~{astrologer.waitMinutes}m wait
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBlock: "0.45rem",
            borderBlock: "1px solid var(--border)",
            fontSize: "0.78rem",
          }}
        >
          <span>
            <strong style={{ color: "var(--royal-purple)", fontSize: "0.92rem" }}>
              ₹{astrologer.chatRateInr}
            </strong>
            <span style={{ color: "var(--ink-subtle)" }}>/min Chat</span>
          </span>
          <Link
            href={`/astrologer/${astrologer.slug}#availability`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.74rem",
              fontWeight: 600,
              color: "#9A6E1E",
            }}
          >
            <Calendar size={12} /> Book Slot
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
          <button
            type="button"
            onClick={(e) => handleActionClick(e, "chat")}
            className="btn btn-purple btn-sm"
            style={{ paddingInline: "0.45rem" }}
          >
            <MessageCircle size={13} /> Chat
          </button>
          <button
            type="button"
            onClick={(e) => handleActionClick(e, "call")}
            className="btn btn-outline btn-sm"
            style={{ paddingInline: "0.45rem" }}
          >
            <PhoneCall size={13} /> Call
          </button>
          <button
            type="button"
            onClick={(e) => handleActionClick(e, "video")}
            className="btn btn-outline btn-sm"
            style={{ paddingInline: "0.45rem" }}
          >
            <Video size={13} /> Video
          </button>
        </div>
      </article>

      {/* Section 10: Consultation Pre-Booking Confirmation Screen */}
      {confirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Consultation Session"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            backgroundColor: "rgba(36, 11, 50, 0.75)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal(null);
          }}
        >
          <div
            style={{
              inlineSize: "100%",
              maxInlineSize: "26rem",
              backgroundColor: "#FFFFFF",
              borderRadius: "1.25rem",
              overflow: "hidden",
              border: "1px solid var(--border-gold)",
              boxShadow: "0 20px 40px -10px rgba(36, 11, 50, 0.4)",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--royal-purple) 0%, var(--deep-plum) 100%)",
                color: "#FFFFFF",
                padding: "1.25rem 1.25rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", color: "#F8D677", fontWeight: 700, textTransform: "uppercase" }}>
                  Consultation Confirmation
                </span>
                <h3 className="serif-heading" style={{ color: "#FFFFFF", fontSize: "1.25rem", marginTop: "0.2rem" }}>
                  {confirmModal === "chat" ? "Live Chat" : confirmModal === "call" ? "Audio Call" : "HD Video Call"} with {astrologer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{ background: "rgba(255,255,255,0.2)", border: 0, borderRadius: "9999px", color: "#fff", padding: "0.3rem", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "1.25rem", display: "grid", gap: "0.85rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <img
                  src={astrologer.photo}
                  alt={astrologer.name}
                  width={56}
                  height={56}
                  style={{ borderRadius: "9999px", objectFit: "cover", border: "2px solid var(--champagne-gold)" }}
                />
                <div>
                  <strong style={{ display: "block", fontSize: "0.94rem", color: "var(--ink)" }}>{astrologer.name}</strong>
                  <span style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>
                    {astrologer.specialisations.slice(0, 2).join(", ")}
                  </span>
                  <div style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600, marginTop: "0.15rem" }}>
                    ✓ 100% KYC Verified Vedic Scholar
                  </div>
                </div>
              </div>

              {/* Pricing & Duration breakdown */}
              <div style={{ backgroundColor: "var(--ivory)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "var(--ink-muted)" }}>Consultation Rate</span>
                  <strong style={{ color: "var(--royal-purple)" }}>₹{getRate()} / min</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
                  <span style={{ color: "var(--ink-muted)" }}>Your Wallet Balance</span>
                  <strong style={{ color: "var(--ink)" }}>₹{user?.wallet ? user.wallet.totalBalanceInr.toFixed(2) : "1.00"}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", paddingTop: "0.35rem", borderTop: "1px dashed var(--border)" }}>
                  <span style={{ color: "var(--ink-muted)" }}>Welcome Promotional Credit</span>
                  <strong style={{ color: "#16A34A" }}>Active (₹1 / min applied)</strong>
                </div>
              </div>

              {/* Consultation terms note */}
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", fontSize: "0.72rem", color: "var(--ink-subtle)" }}>
                <ShieldCheck size={14} color="#16A34A" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  Billing begins only after the astrologer accepts your session. Sessions are confidential and private.
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={proceedToConsultation}
                  className="btn btn-purple btn-sm"
                >
                  Proceed to {confirmModal === "chat" ? "Chat" : "Call"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
