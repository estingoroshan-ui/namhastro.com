export interface HeroBannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  offerTag: string;
  offerHeadline: string;
  offerNote: string;
  highlights: string[];
}

export const HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: "verified-astrologers",
    eyebrow: "India's Premium Vedic Astrology Marketplace",
    title: "Get Personal Guidance from Verified Astrologers",
    subtitle:
      "Connect privately via live chat, audio call, or HD video consultation with rigorously screened Vedic scholars.",
    ctaLabel: "Consult Now",
    ctaHref: "/astrologers",
    image: "/images/banner-1.jpg",
    offerTag: "New Member Welcome",
    offerHeadline: "First Consultation Offer",
    offerNote: "Introductory rate configured by Admin before live launch",
    highlights: ["Verified Astrologers", "Chat · Audio · Video", "100% Confidential"],
  },
  {
    id: "love-marriage",
    eyebrow: "Love, Marriage & Compatibility",
    title: "Clarity for Relationships, Marriage & Family Harmony",
    subtitle:
      "Consult specialists in Ashtakoot Kundli Matching, Manglik analysis, and timing of marriage.",
    ctaLabel: "Explore Marriage Experts",
    ctaHref: "/astrologers?speciality=Marriage+Consultation",
    image: "/images/banner-2.svg",
    offerTag: "Relationship Guidance",
    offerHeadline: "Vedic Compatibility & Remedies",
    offerNote: "Birth-chart verified insights with full privacy",
    highlights: ["36-Guna Matching", "Dasha Timing Analysis", "Private Consultations"],
  },
  {
    id: "career-business",
    eyebrow: "Career, Finance & Business Growth",
    title: "Strategic Vedic Insights for Career & Business Decisions",
    subtitle:
      "Evaluate job transitions, business partnerships, auspicious launch dates, and planetary transits.",
    ctaLabel: "Talk to Career Astrologers",
    ctaHref: "/astrologers?speciality=Career+Consultation",
    image: "/images/banner-3.svg",
    offerTag: "Executive Guidance",
    offerHeadline: "Career & Muhurat Planning",
    offerNote: "Transparent per-minute billing with server-locked rates",
    highlights: ["Vedic & KP Systems", "Vastu for Office", "Instant Audio & Video"],
  },
  {
    id: "kundli-matching",
    eyebrow: "Traditional Vedic Calculations",
    title: "Generate Your Free Janam Kundli & Guna Milan",
    subtitle:
      "Prepare Lagna, Navamsa, planetary degrees, Nakshatra, and Vimshottari Dasha charts effortlessly.",
    ctaLabel: "Generate Free Kundli",
    ctaHref: "/kundli",
    image: "/images/banner-4.svg",
    offerTag: "Complimentary Tool",
    offerHeadline: "Detailed Birth Chart",
    offerNote: "Powered by deterministic ephemeris integration in Step 9",
    highlights: ["Lagna & Navamsa", "Vimshottari Dasha", "PDF Report Ready"],
  },
  {
    id: "online-puja",
    eyebrow: "Sacred Temple & Online Rituals",
    title: "Book Authentic Online Puja & Temple Sankalp",
    subtitle:
      "Participate in Grah Shanti, Rudrabhishek, and Festival Pujas conducted by verified temple Pandits.",
    ctaLabel: "Explore Puja Services",
    ctaHref: "/puja",
    image: "/images/banner-5.svg",
    offerTag: "Sacred Rituals",
    offerHeadline: "Sankalp · Live Darshan · Prasad",
    offerNote: "Completion video & tracked Prasad delivery",
    highlights: ["Verified Pandits", "Personalised Sankalp", "Prasad Tracking"],
  },
];

export interface AstrologerCardData {
  id: string;
  slug: string;
  name: string;
  photo: string;
  status: "ONLINE" | "BUSY" | "OFFLINE";
  verified: boolean;
  specialisations: string[];
  languages: string[];
  experienceYears: number;
  rating: number | null;
  reviewCount: number;
  completedConsultations: number;
  chatRateInr: number;
  audioRateInr: number;
  videoRateInr: number;
  waitMinutes: number | null;
  bio: string;
  qualifications: string[];
  categoryTags: ("online" | "top-rated" | "trending")[];
}

export const ASTROLOGER_SHOWCASE: AstrologerCardData[] = [
  {
    id: "ast-1",
    slug: "acharya-raghavendra-sharma",
    name: "Acharya Raghavendra Sharma",
    photo: "/images/astro-1.svg",
    status: "ONLINE",
    verified: true,
    specialisations: ["Vedic Astrology", "Marriage Consultation", "Prashna Kundli"],
    languages: ["Hindi", "English", "Sanskrit"],
    experienceYears: 22,
    rating: 4.9,
    reviewCount: 412,
    completedConsultations: 1840,
    chatRateInr: 35,
    audioRateInr: 45,
    videoRateInr: 75,
    waitMinutes: 0,
    bio: "Traditional Jyotish Acharya trained in Varanasi with over two decades guiding families on Parashari horoscopy, marriage timing, and spiritual remedies.",
    qualifications: ["Jyotish Acharya, Sampurnanand Sanskrit University", "Vedic Muhurat Specialist"],
    categoryTags: ["online", "top-rated", "trending"],
  },
  {
    id: "ast-2",
    slug: "dr-meera-kulkarni",
    name: "Dr. Meera Kulkarni",
    photo: "/images/astro-2.svg",
    status: "ONLINE",
    verified: true,
    specialisations: ["Tarot Reading", "Relationship Guidance", "Vedic Astrology"],
    languages: ["English", "Hindi", "Marathi"],
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 298,
    completedConsultations: 1290,
    chatRateInr: 30,
    audioRateInr: 40,
    videoRateInr: 65,
    waitMinutes: 0,
    bio: "Compassionate Vedic astrologer and Tarot counselor specializing in relationship clarity, emotional alignment, and career transitions.",
    qualifications: ["Ph.D. in Indian Philosophy", "Certified Tarot & Vedic Counselor"],
    categoryTags: ["online", "top-rated", "trending"],
  },
  {
    id: "ast-3",
    slug: "pandit-devendra-joshi",
    name: "Pandit Devendra Joshi",
    photo: "/images/astro-3.svg",
    status: "BUSY",
    verified: true,
    specialisations: ["Numerology", "Vastu Shastra", "Business Guidance"],
    languages: ["Hindi", "English", "Gujarati"],
    experienceYears: 17,
    rating: 4.8,
    reviewCount: 215,
    completedConsultations: 980,
    chatRateInr: 28,
    audioRateInr: 38,
    videoRateInr: 60,
    waitMinutes: 6,
    bio: "Specialist in residential and commercial Vastu Shastra, Chaldean numerology, and auspicious business naming.",
    qualifications: ["Master of Vastu Shastra", "Senior Numerology Practitioner"],
    categoryTags: ["top-rated", "trending"],
  },
  {
    id: "ast-4",
    slug: "acharya-ananya-trivedi",
    name: "Acharya Ananya Trivedi",
    photo: "/images/astro-4.jpg",
    status: "ONLINE",
    verified: true,
    specialisations: ["KP Astrology", "Marriage Consultation", "Career Consultation"],
    languages: ["English", "Hindi", "Bengali"],
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 340,
    completedConsultations: 1510,
    chatRateInr: 32,
    audioRateInr: 42,
    videoRateInr: 70,
    waitMinutes: 0,
    bio: "Krishnamurti Paddhati (KP) specialist known for precise sub-lord analysis in career milestones, overseas education, and marriage compatibility.",
    qualifications: ["KP Jyotish Visharad", "Gold Medalist in Vedic Astrology"],
    categoryTags: ["online", "top-rated"],
  },
  {
    id: "ast-5",
    slug: "shastri-vishwanath-dubey",
    name: "Shastri Vishwanath Dubey",
    photo: "/images/astro-5.svg",
    status: "ONLINE",
    verified: true,
    specialisations: ["Lal Kitab", "Palmistry", "Spiritual Guidance"],
    languages: ["Hindi", "Bhojpuri"],
    experienceYears: 26,
    rating: 4.8,
    reviewCount: 510,
    completedConsultations: 2420,
    chatRateInr: 25,
    audioRateInr: 35,
    videoRateInr: 55,
    waitMinutes: 0,
    bio: "Renowned Lal Kitab and Samudrika Shastra (Palmistry) scholar offering practical, ethical remedies rooted in traditional scripture.",
    qualifications: ["Jyotish Shastri", "Lal Kitab & Palmistry Researcher"],
    categoryTags: ["online", "trending"],
  },
  {
    id: "ast-6",
    slug: "acharya-siddharth-verma",
    name: "Acharya Siddharth Verma",
    photo: "/images/astro-6.svg",
    status: "BUSY",
    verified: true,
    specialisations: ["Nadi Astrology", "Career Consultation", "Business Guidance"],
    languages: ["English", "Hindi", "Punjabi"],
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 184,
    completedConsultations: 790,
    chatRateInr: 24,
    audioRateInr: 32,
    videoRateInr: 50,
    waitMinutes: 4,
    bio: "Modern Bhrigu Nadi and Vedic astrologer helping founders, professionals, and students navigate pivotal life cycles.",
    qualifications: ["Bhrigu Nadi Diploma", "Vedic Jyotish Ratna"],
    categoryTags: ["trending"],
  },
];

export const ZODIAC_SIGNS = [
  { id: "aries", name: "Aries", hindi: "मेष", dates: "Mar 21 – Apr 19", element: "Fire", guidance: "Favorable day for decisive professional initiatives; maintain calm in family discussions." },
  { id: "taurus", name: "Taurus", hindi: "वृषभ", dates: "Apr 20 – May 20", element: "Earth", guidance: "Steady financial focus pays off; evening brings warmth and meaningful conversations." },
  { id: "gemini", name: "Gemini", hindi: "मिथुन", dates: "May 21 – Jun 20", element: "Air", guidance: "Communication opens new collaborative doors; avoid rushing contractual commitments." },
  { id: "cancer", name: "Cancer", hindi: "कर्क", dates: "Jun 21 – Jul 22", element: "Water", guidance: "Trust your intuition in domestic decisions and prioritize mindful rest." },
  { id: "leo", name: "Leo", hindi: "सिंह", dates: "Jul 23 – Aug 22", element: "Fire", guidance: "Leadership visibility rises; mentor peers with generosity and patience." },
  { id: "virgo", name: "Virgo", hindi: "कन्या", dates: "Aug 23 – Sep 22", element: "Earth", guidance: "Methodical planning resolves pending responsibilities smoothly." },
  { id: "libra", name: "Libra", hindi: "तुला", dates: "Sep 23 – Oct 22", element: "Air", guidance: "Balanced diplomacy strengthens partnerships and creative endeavors." },
  { id: "scorpio", name: "Scorpio", hindi: "वृश्चिक", dates: "Oct 23 – Nov 21", element: "Water", guidance: "Deep research yields clarity; keep long-term strategic plans confidential." },
  { id: "sagittarius", name: "Sagittarius", hindi: "धनु", dates: "Nov 22 – Dec 21", element: "Fire", guidance: "Learning, travel planning, and spiritual study bring renewed optimism." },
  { id: "capricorn", name: "Capricorn", hindi: "मकर", dates: "Dec 22 – Jan 19", element: "Earth", guidance: "Disciplined execution earns senior recognition; review long-term savings." },
  { id: "aquarius", name: "Aquarius", hindi: "कुंभ", dates: "Jan 20 – Feb 18", element: "Air", guidance: "Innovative ideas flourish in team settings; stay grounded in practical timelines." },
  { id: "pisces", name: "Pisces", hindi: "मीन", dates: "Feb 19 – Mar 20", element: "Water", guidance: "Spiritual reflection and artistic focus bring inner peace and clarity." },
] as const;

export const PUJA_SERVICES = [
  {
    id: "puja-1",
    title: "Navagraha Grah Shanti Puja",
    temple: "Kashi Vishwanath Corridor Partner",
    category: "Grah Shanti",
    priceInr: 2100,
    image: "/images/puja-grah-shanti.svg",
    duration: "90 mins · Live Sankalp + Prasad",
  },
  {
    id: "puja-2",
    title: "Mahamrityunjaya Jaap & Havan",
    temple: "Ujjain Sacred Temple Pandit Panel",
    category: "Havan & Anushthan",
    priceInr: 3100,
    image: "/images/banner-5.svg",
    duration: "2 hrs · Video Proof + Prasad",
  },
  {
    id: "puja-3",
    title: "Vivah Badha Nivaran & Mangal Puja",
    temple: "Mangalnath Temple Tradition",
    category: "Personalized Puja",
    priceInr: 2500,
    image: "/images/puja-grah-shanti.svg",
    duration: "75 mins · Sankalp + Samagri",
  },
  {
    id: "puja-4",
    title: "Lakshmi Narayan Prosperity Puja",
    temple: "Haridwar Vedic Pathshala",
    category: "Festival & Online Puja",
    priceInr: 1800,
    image: "/images/banner-5.svg",
    duration: "60 mins · Live Stream Link",
  },
] as const;

export const STORE_PRODUCTS = [
  {
    id: "prod-1",
    name: "5 Mukhi Certified Nepali Rudraksha Mala",
    category: "Rudraksha",
    priceInr: 1499,
    mrpInr: 2100,
    badge: "Lab Certified",
    image: "/images/store-rudraksha.svg",
  },
  {
    id: "prod-2",
    name: "Natural Ceylon Yellow Sapphire (Pukhraj)",
    category: "Gemstones",
    priceInr: 18500,
    mrpInr: 22000,
    badge: "IGI / GTL Certificate",
    image: "/images/store-gemstone.jpg",
  },
  {
    id: "prod-3",
    name: "Energised Copper Shri Yantra Plate",
    category: "Yantra",
    priceInr: 1250,
    mrpInr: 1650,
    badge: "Vedic Prana Pratishtha",
    image: "/images/store-yantra.svg",
  },
  {
    id: "prod-4",
    name: "Amethyst & Citrine Harmony Bracelet",
    category: "Bracelets",
    priceInr: 899,
    mrpInr: 1299,
    badge: "Natural Crystal",
    image: "/images/store-bracelet.svg",
  },
] as const;

export const PERSONALISED_REPORTS = [
  { title: "Detailed 5-Year Career & Finance Report", pages: "35+ Pages PDF", priceInr: 499, delivery: "24 Hours" },
  { title: "Complete Marriage & Compatibility Dossier", pages: "42+ Pages PDF", priceInr: 599, delivery: "24 Hours" },
  { title: "Annual Varshphal & Dasha Transit Guide", pages: "28+ Pages PDF", priceInr: 399, delivery: "12 Hours" },
  { title: "Manglik & Kaal Sarp Dosha Analysis", pages: "20+ Pages PDF", priceInr: 299, delivery: "12 Hours" },
] as const;
