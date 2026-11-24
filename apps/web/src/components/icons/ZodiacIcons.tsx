import React from "react";

export function NamhAstroLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="namhGold" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F6D77E" />
          <stop offset="55%" stopColor="#D4A84F" />
          <stop offset="100%" stopColor="#B87314" />
        </linearGradient>
      </defs>
      {/* Lotus Petals */}
      <path
        d="M32 6C36 14 40 20 32 28C24 20 28 14 32 6Z"
        fill="url(#namhGold)"
        opacity="0.92"
      />
      <path
        d="M14 14C21 17 26 21 26 30C18 28 14 22 14 14Z"
        fill="url(#namhGold)"
        opacity="0.78"
      />
      <path
        d="M50 14C43 17 38 21 38 30C46 28 50 22 50 14Z"
        fill="url(#namhGold)"
        opacity="0.78"
      />
      <path
        d="M7 34C15 30 22 31 27 38C19 42 12 41 7 34Z"
        fill="url(#namhGold)"
        opacity="0.72"
      />
      <path
        d="M57 34C49 30 42 31 37 38C45 42 52 41 57 34Z"
        fill="url(#namhGold)"
        opacity="0.72"
      />
      <path
        d="M14 52C20 45 27 43 32 47C37 43 44 45 50 52C42 56 22 56 14 52Z"
        fill="url(#namhGold)"
        opacity="0.88"
      />
      {/* Sacred Center Halo */}
      <circle cx="32" cy="34" r="14" fill="#FFF9F0" stroke="url(#namhGold)" strokeWidth="2.2" />
      <circle cx="32" cy="34" r="10.5" fill="#351044" />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fill="#F6D77E"
        fontSize="14"
        fontWeight="700"
        fontFamily="serif"
      >
        ॐ
      </text>
    </svg>
  );
}

export function ZodiacIllustration({ sign }: { sign: string }) {
  const paths: Record<string, React.ReactNode> = {
    aries: (
      <path d="M12 20c0-6 4-10 8-10s4 4 4 10m0-10c0-6 4-10 8-10s4 4 4 10M24 20v14" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" />
    ),
    taurus: (
      <>
        <circle cx="24" cy="27" r="7.5" stroke="#351044" strokeWidth="2.2" />
        <path d="M15 12c2 5 5.5 7.5 9 7.5s7-2.5 9-7.5" stroke="#D4A84F" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
    gemini: (
      <path d="M14 13c6 2.5 14 2.5 20 0M14 35c6-2.5 14-2.5 20 0M19 14.5v19M29 14.5v19" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" />
    ),
    cancer: (
      <>
        <circle cx="17" cy="18" r="4" stroke="#351044" strokeWidth="2.2" />
        <circle cx="31" cy="30" r="4" stroke="#351044" strokeWidth="2.2" />
        <path d="M21 15c6-2 12 1 14 7M27 33c-6 2-12-1-14-7" stroke="#D4A84F" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
    leo: (
      <>
        <circle cx="17" cy="28" r="4" stroke="#351044" strokeWidth="2.2" />
        <path d="M20 25c0-7 4-12 9-12 4.5 0 7 3.5 5 8-1.5 3.5-4.5 7-2 10 1.5 2 4 1.5 5-0.5" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
    virgo: (
      <path d="M12 15v17m0-12c2-4 5-5 6-1v13m0-12c2-4 5-5 6-1v13m0-12c2-4 5.5-5 7-1 1.5 4-1 11-5 15m3-11c4 0 6 3 4 7-1.5 3-5 5-8 6" stroke="#351044" strokeWidth="2" strokeLinecap="round" />
    ),
    libra: (
      <path d="M12 31h24M12 26h7a5 5 0 0 1 10 0h7" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" />
    ),
    scorpio: (
      <path d="M11 16v15m0-11c2-4 5-4 6 0v11m0-11c2-4 5-4 6 0v11c0 3 2.5 4.5 5 4.5h6m-3-3 3 3-3 3" stroke="#351044" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    ),
    sagittarius: (
      <path d="M15 33 33 15m-9 0h9v9M17 23l8 8" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    capricorn: (
      <path d="M12 16l4 15 4-11c2-4 6-4 7 1v7c0 4 3 6 6 5s4-4 2-6-5-1-6 2" stroke="#351044" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    ),
    aquarius: (
      <path d="M11 21l4-4 4 4 5-4 5 4 4-4 4 4M11 29l4-4 4 4 5-4 5 4 4-4 4 4" stroke="#351044" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    ),
    pisces: (
      <path d="M15 13c4 6 4 16 0 22M33 13c-4 6-4 16 0 22M13 24h22" stroke="#351044" strokeWidth="2.2" strokeLinecap="round" />
    ),
  };

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#FFF9F0" stroke="#D4A84F" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="18.5" stroke="#D4A84F" strokeWidth="0.7" strokeDasharray="2 2.5" opacity="0.75" />
      {paths[sign] ?? paths.aries}
    </svg>
  );
}
