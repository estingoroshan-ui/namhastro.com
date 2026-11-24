"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  PhoneCall,
  Star,
  Video,
} from "lucide-react";
import type { AstrologerCardData } from "@/data/marketplace";

export function AstrologerCard({ astrologer }: { astrologer: AstrologerCardData }) {
  const [favourite, setFavourite] = useState(false);

  const statusClass =
    astrologer.status === "ONLINE"
      ? "status-pill status-online"
      : astrologer.status === "BUSY"
        ? "status-pill status-busy"
        : "status-pill status-offline";

  return (
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
              onClick={() => setFavourite((v) => !v)}
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
            {astrologer.specialisations.join(" · ")}
          </p>

          <p style={{ fontSize: "0.74rem", color: "var(--ink-subtle)", marginBlockStart: "0.15rem" }}>
            {astrologer.languages.join(", ")} · {astrologer.experienceYears} yrs exp
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
        <Link
          href={`/consultation/chat?astrologer=${astrologer.slug}`}
          className="btn btn-purple btn-sm"
          style={{ paddingInline: "0.45rem" }}
        >
          <MessageCircle size={13} /> Chat
        </Link>
        <Link
          href={`/consultation/call?mode=audio&astrologer=${astrologer.slug}`}
          className="btn btn-outline btn-sm"
          style={{ paddingInline: "0.45rem" }}
        >
          <PhoneCall size={13} /> Call
        </Link>
        <Link
          href={`/consultation/call?mode=video&astrologer=${astrologer.slug}`}
          className="btn btn-outline btn-sm"
          style={{ paddingInline: "0.45rem" }}
        >
          <Video size={13} /> Video
        </Link>
      </div>
    </article>
  );
}
