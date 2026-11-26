"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  Flame,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Video,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  X,
  Package,
  Plus,
  Users,
  Search,
  ExternalLink,
  Truck
} from "lucide-react";

interface PujaCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface PujaPackage {
  id: string;
  packageName: string;
  pricePaise: number;
  description: string;
  maxParticipants: number;
}

interface PujaAddOn {
  id: string;
  name: string;
  pricePaise: number;
  description: string;
}

interface PujaService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription?: string;
  primaryDeity?: string;
  durationMinutes: number;
  regularPricePaise: number;
  discountedPricePaise: number;
  coverImageUrl: string;
  benefits?: string[];
  temple?: { name: string; city: string; state: string };
  category?: { name: string; slug: string };
  packages?: PujaPackage[];
  addOns?: PujaAddOn[];
}

const DEFAULT_CATEGORIES: PujaCategory[] = [
  { id: "c1", name: "All Pujas", slug: "all", description: "Explore all sacred Vedic rituals" },
  { id: "c2", name: "Maha Mrityunjaya Puja", slug: "maha-mrityunjaya-puja", description: "Health, longevity and liberation from untimely fear" },
  { id: "c3", name: "Rudrabhishek", slug: "rudrabhishek", description: "Sacred bathing of Shiva Lingam with Vedic mantras" },
  { id: "c4", name: "Lakshmi Ganesh Puja", slug: "lakshmi-ganesh-puja", description: "Prosperity, business growth and removal of obstacles" },
  { id: "c5", name: "Satyanarayan Katha", slug: "satyanarayan-katha", description: "Traditional narrative prayer to Lord Vishnu for family harmony" },
  { id: "c6", name: "Navagraha Shanti Puja", slug: "navagraha-shanti-puja", description: "Pacification of all nine planetary deities" },
  { id: "c7", name: "Ganesh Puja", slug: "ganesh-puja", description: "Vighnaharta invocation before all auspicious beginnings" },
  { id: "c8", name: "Hanuman Puja", slug: "hanuman-puja", description: "Strength, protection and courage against negative influences" },
  { id: "c9", name: "Durga Puja", slug: "durga-puja", description: "Shakti invocation for triumph over obstacles and spiritual energy" },
  { id: "c10", name: "Saraswati Puja", slug: "saraswati-puja", description: "Knowledge, arts, education and academic success" },
  { id: "c11", name: "Vishnu Puja", slug: "vishnu-puja", description: "Peace, preservation and virtue in domestic life" },
  { id: "c12", name: "Shiva Puja", slug: "shiva-puja", description: "Pradosham and Shivaratri deep meditation rites" },
  { id: "c13", name: "Pitra Shanti Puja", slug: "pitra-shanti-puja", description: "Ancestral peace and resolution of Pitra Dosha" },
  { id: "c14", name: "Traditional Manglik Shanti", slug: "traditional-manglik-shanti-puja", description: "Vedic pacification for marital bliss" },
  { id: "c15", name: "Traditional Kaal Sarp Shanti", slug: "traditional-kaal-sarp-shanti-puja", description: "Rahu-Ketu planetary alignment pacification" },
  { id: "c16", name: "Griha Pravesh", slug: "griha-pravesh", description: "Auspicious housewarming and Vastu Shanti homa" },
  { id: "c17", name: "Business Opening Puja", slug: "business-opening-puja", description: "Commercial enterprise invocation with Kubera rites" },
  { id: "c18", name: "Marriage Rituals", slug: "marriage-rituals", description: "Vedic Vivah pre-wedding and wedding sanctifications" },
  { id: "c19", name: "Namkaran Sanskar", slug: "namkaran-sanskar", description: "Nakshatra-based sacred baby naming rites" },
  { id: "c20", name: "Mundan Sanskar", slug: "mundan-sanskar", description: "First haircut Vedic purification ceremony" },
  { id: "c21", name: "Havan and Yagya", slug: "havan-and-yagya", description: "Targeted sacred fire rituals for peace and purity" },
  { id: "c22", name: "Festival Special Puja", slug: "festival-special-puja", description: "Seasonal celebrations and divine tithi rituals" },
  { id: "c23", name: "Custom Puja Services", slug: "custom-puja-services", description: "Tailored ritual programs curated by senior Acharyas" }
];

const DEMO_PUJA_SERVICES: PujaService[] = [
  {
    id: "srv-01",
    name: "Kashi Vishwanath Maha Rudrabhishek with Bilva Patra",
    slug: "kashi-vishwanath-rudrabhishek",
    shortDescription: "Sacred abhishekam of Shiva Lingam performed with holy Ganga jal, panchamrit, and 1008 bilva leaves.",
    detailedDescription: "Conducted directly at sacred Varanasi with verified Vedic Acharyas. Includes live video broadcast, personalized gotra sankalp recitation, and direct courier dispatch of consecrated Rudraksha prasad, dry fruits, and sacred bhasma.",
    primaryDeity: "Lord Shiva",
    durationMinutes: 90,
    regularPricePaise: 510000,
    discountedPricePaise: 420000,
    coverImageUrl: "/images/banner-1.jpg",
    benefits: ["Relief from chronic ailments & negativity", "Navagraha dosha pacification", "Family peace and spiritual elevation"],
    temple: { name: "Kashi Vishwanath Temple", city: "Varanasi", state: "Uttar Pradesh" },
    category: { name: "Rudrabhishek", slug: "rudrabhishek" },
    packages: [
      { id: "p1", packageName: "Samuhik Rudrabhishek", pricePaise: 210000, description: "Group sankalp with name, gotra and family blessings.", maxParticipants: 2 },
      { id: "p2", packageName: "Individual Family Abhishekam", pricePaise: 420000, description: "Exclusive family ritual with dedicated priest, live video stream and prasad dispatch.", maxParticipants: 6 },
      { id: "p3", packageName: "Sampoorna 1008 Bilva Archana", pricePaise: 750000, description: "Highest Vedic archana with silver bilva leaf and cow ghee homa.", maxParticipants: 8 }
    ],
    addOns: [
      { id: "a1", name: "Silver Bilva Leaf Prasad", pricePaise: 110000, description: "Pure 925 silver energized bilva leaf dispatched with prasad" },
      { id: "a2", name: "108 Shiva Sahasranama Chanting", pricePaise: 50100, description: "Special recitation of 1008 holy names during abhishek" }
    ]
  },
  {
    id: "srv-02",
    name: "Maha Mrityunjaya Jaap & Amrit Havan",
    slug: "maha-mrityunjaya-jaap",
    shortDescription: "11,000 sacred Vedic Mahamrityunjaya mantras chanted by 5 Vedic Brahmins for longevity, health, and peace.",
    detailedDescription: "Performed at the holy banks of Haridwar. Dedicated to overcoming severe illnesses, physical afflictions, and sudden adversities.",
    primaryDeity: "Lord Shiva",
    durationMinutes: 120,
    regularPricePaise: 1100000,
    discountedPricePaise: 850000,
    coverImageUrl: "/images/banner-5.svg",
    benefits: ["Divine protection from sudden accidents & disease", "Restores vitality and mental tranquility", "Pitra and planetary obstacle neutralization"],
    temple: { name: "Har Ki Pauri Mandir", city: "Haridwar", state: "Uttarakhand" },
    category: { name: "Maha Mrityunjaya Puja", slug: "maha-mrityunjaya-puja" },
    packages: [
      { id: "p4", packageName: "5,100 Mantra Jaap", pricePaise: 510000, description: "3 Brahmins chanting with Amrit Havan", maxParticipants: 4 },
      { id: "p5", packageName: "11,000 Maha Jaap & Havan", pricePaise: 850000, description: "5 Brahmins chanting with complete Ahuti samagri and live broadcast", maxParticipants: 8 }
    ],
    addOns: [
      { id: "a3", name: "Energized Maha Mrityunjaya Yantra", pricePaise: 150000, description: "Copper gold-plated consecrated yantra" }
    ]
  },
  {
    id: "srv-03",
    name: "Lakshmi-Kubera Dhan Prapti & Vyapar Vriddhi Homa",
    slug: "lakshmi-kubera-puja",
    shortDescription: "Auspicious invocation of Goddess Mahalakshmi and Lord Kubera for abundance, business expansion, and debt relief.",
    detailedDescription: "Performed on auspicious Fridays and Shukla Paksha tithis with lotus flowers, pure cow ghee, and Sri Suktam path.",
    primaryDeity: "Goddess Lakshmi & Lord Kubera",
    durationMinutes: 75,
    regularPricePaise: 650000,
    discountedPricePaise: 510000,
    coverImageUrl: "/images/puja-grah-shanti.svg",
    benefits: ["Removal of business blocks & stagnation", "Attracts financial growth and prosperity", "Clears debt burdens and stabilizes assets"],
    temple: { name: "Mahalakshmi Temple", city: "Kolhapur", state: "Maharashtra" },
    category: { name: "Lakshmi Ganesh Puja", slug: "lakshmi-ganesh-puja" },
    packages: [
      { id: "p6", packageName: "Standard Sri Suktam Puja", pricePaise: 310000, description: "Sri Suktam recitation with lotus offering", maxParticipants: 3 },
      { id: "p7", packageName: "Sampoorna Kubera Lakshmi Homa", pricePaise: 510000, description: "108 Ahutis of pure cow ghee with energized Gomati Chakra prasad", maxParticipants: 6 }
    ],
    addOns: [
      { id: "a4", name: "11 Consecrated Gomati Chakras", pricePaise: 75000, description: "Blessed for business cash box and home vault" }
    ]
  },
  {
    id: "srv-04",
    name: "Navagraha Shanti & Dosha Nivaran Mahayagya",
    slug: "navagraha-shanti-puja",
    shortDescription: "Balancing all nine grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) to remove planetary hurdles.",
    detailedDescription: "Vedic samidha sticks (Arka, Palash, Khadir, Apamarga, Peepal, Udumbara, Shami, Durva, Kusha) offered with planetary beej mantras.",
    primaryDeity: "Navagraha Mandalam",
    durationMinutes: 105,
    regularPricePaise: 750000,
    discountedPricePaise: 550000,
    coverImageUrl: "/images/puja-grah-shanti.svg",
    benefits: ["Neutralizes Sade Sati, Dhaiya and Rahu Mahadasha", "Brings career stability and mental harmony", "Protects marriage from Mars (Mangal) affliction"],
    temple: { name: "Navagraha Temple", city: "Ujjain", state: "Madhya Pradesh" },
    category: { name: "Navagraha Shanti Puja", slug: "navagraha-shanti-puja" },
    packages: [
      { id: "p8", packageName: "Individual Navagraha Pacification", pricePaise: 550000, description: "Full planetary homa with personalized kundli alignment", maxParticipants: 4 }
    ],
    addOns: [
      { id: "a5", name: "Navaratna Consecrated Ring/Pendant", pricePaise: 250000, description: "Authentic 9 gemstones energized in yagya" }
    ]
  }
];

export default function PujaMarketplacePage() {
  const [categories, setCategories] = useState<PujaCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<"ALL" | "ONLINE" | "TEMPLE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<PujaService[]>(DEMO_PUJA_SERVICES);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<PujaService | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PujaPackage | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [devoteeName, setDevoteeName] = useState("");
  const [gotra, setGotra] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [rashi, setRashi] = useState("");
  const [sankalpWish, setSankalpWish] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("08:00 AM - 09:30 AM");
  const [isLiveOnline, setIsLiveOnline] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);

  // Fetch live categories and services if backend is responsive
  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch("http://127.0.0.1:4000/api/v1/puja/categories");
        if (catRes.ok) {
          const data = await catRes.json();
          if (data.success && data.data && data.data.length > 0) {
            setCategories([{ id: "c-all", name: "All Pujas", slug: "all", description: "All categories" }, ...data.data]);
          }
        }

        const srvRes = await fetch("http://127.0.0.1:4000/api/v1/puja/services");
        if (srvRes.ok) {
          const sData = await srvRes.json();
          if (sData.success && sData.data && sData.data.items && sData.data.items.length > 0) {
            setServices(sData.data.items);
          }
        }
      } catch (e) {
        // Fall back gracefully to high-fidelity demo dataset
      }
    }
    loadData();
  }, []);

  const openBookingModal = (service: PujaService) => {
    setSelectedService(service);
    setSelectedPackage(service.packages && service.packages.length > 0 ? service.packages[0] : null);
    setSelectedAddOns([]);
    setBookingConfirmed(null);
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  // Calculation of Subtotal, GST & Total
  const basePaise = selectedPackage
    ? selectedPackage.pricePaise
    : selectedService
    ? selectedService.discountedPricePaise || selectedService.regularPricePaise
    : 0;

  const addOnsPaise = selectedService?.addOns
    ? selectedService.addOns
        .filter((a) => selectedAddOns.includes(a.id))
        .reduce((sum, a) => sum + a.pricePaise, 0)
    : 0;

  const subtotalInr = (basePaise + addOnsPaise) / 100;
  const gstInr = Math.round(subtotalInr * 0.18 * 100) / 100;
  const totalInr = subtotalInr + gstInr;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName.trim()) {
      alert("Please enter primary devotee name for sacred Sankalp.");
      return;
    }

    setIsSubmitting(true);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const mockRef = `NA-PUJA-${dateStr}-${randomSuffix}`;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("namh_access_token") : null;
      if (token && selectedService) {
        const res = await fetch("http://127.0.0.1:4000/api/v1/puja/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            pujaServiceId: selectedService.id,
            packageId: selectedPackage?.id,
            scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString(),
            timeSlot,
            sankalpName: devoteeName,
            gotra: gotra || "Kashyapa",
            birthDetails: { nakshatra, rashi },
            sankalpWish,
            isLiveOnline,
            participants: [{ fullName: devoteeName, relationship: "Self", gotra }],
            addOnIds: selectedAddOns
          })
        });

        if (res.ok) {
          const bData = await res.json();
          setBookingConfirmed(bData.data);
          setIsSubmitting(false);
          return;
        }
      }

      // Offline / Demo fallback confirmation
      setBookingConfirmed({
        bookingNumber: mockRef,
        status: "CONFIRMED",
        sankalpName: devoteeName,
        serviceName: selectedService?.name,
        scheduledDate: scheduledDate || "Tomorrow (Auspicious Muhurat)",
        timeSlot,
        totalInr,
        isLiveOnline,
        agoraChannel: `puja_${mockRef.toLowerCase().replace(/-/g, "_")}`
      });
    } catch (err) {
      setBookingConfirmed({
        bookingNumber: mockRef,
        status: "CONFIRMED",
        sankalpName: devoteeName,
        serviceName: selectedService?.name,
        totalInr,
        isLiveOnline
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesCategory =
      selectedCategory === "all" ||
      s.category?.slug === selectedCategory ||
      s.slug.includes(selectedCategory);
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.primaryDeity?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "#1A0524", minHeight: "100vh", color: "#FFF9F0" }}>
      <SiteHeader />

      {/* Hero Section */}
      <section
        style={{
          background: "radial-gradient(ellipse at 50% 20%, #4E1864 0%, #2A083B 60%, #15031F 100%)",
          borderBottom: "1px solid rgba(212, 168, 79, 0.25)",
          padding: "3.5rem 1rem 3rem"
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(212, 168, 79, 0.12)",
              border: "1px solid #D4A84F",
              borderRadius: "9999px",
              padding: "0.35rem 1rem",
              fontSize: "0.85rem",
              color: "#F2C96B",
              marginBottom: "1rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}
          >
            <Sparkles size={14} color="#D4A84F" /> Authentic Vedic Rituals &amp; Temple Pujas
          </div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 700,
              color: "#FFF9F0",
              margin: "0 0 1rem",
              lineHeight: 1.15
            }}
          >
            Sacred Online Puja &amp; Temple Anushthan
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "0 auto 2rem",
              color: "rgba(255, 249, 240, 0.8)",
              fontSize: "1.05rem",
              lineHeight: 1.6
            }}
          >
            Participate in authentic Vedic rituals performed by verified senior priests from holy pilgrimage shrines including Kashi Vishwanath, Ujjain Mahakal, Haridwar, and Trimbakeshwar. Receive personalized Sankalp with live Agora video stream and consecrated Prasad at your doorstep.
          </p>

          {/* Quick Search & Mode Bar */}
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              display: "flex",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 168, 79, 0.3)",
              borderRadius: "14px",
              padding: "0.5rem",
              backdropFilter: "blur(12px)"
            }}
          >
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <Search size={18} color="#D4A84F" style={{ position: "absolute", left: "0.85rem" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by deity, puja name, or temple..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: "0.7rem 0.7rem 0.7rem 2.6rem",
                  color: "#FFF9F0",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["ALL", "ONLINE", "TEMPLE"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: modeFilter === m ? "#D4A84F" : "rgba(255, 255, 255, 0.08)",
                    color: modeFilter === m ? "#1A0524" : "#FFF9F0",
                    transition: "all 0.2s ease"
                  }}
                >
                  {m === "ALL" ? "All Modes" : m === "ONLINE" ? "Live Online" : "At Temple"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1rem" }}>
        {/* Categories Horizontal Carousel */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Flame size={18} color="#D4A84F" /> 22 Auspicious Puja Categories
            </h2>
            <span style={{ fontSize: "0.82rem", color: "rgba(255, 249, 240, 0.6)" }}>
              {filteredServices.length} Ritual Services Available
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              overflowX: "auto",
              paddingBottom: "0.75rem",
              scrollbarWidth: "thin"
            }}
          >
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "0.55rem 1.1rem",
                  borderRadius: "9999px",
                  fontSize: "0.85rem",
                  fontWeight: selectedCategory === c.slug ? 700 : 500,
                  border: selectedCategory === c.slug ? "1px solid #D4A84F" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: selectedCategory === c.slug ? "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)" : "rgba(255, 255, 255, 0.04)",
                  color: selectedCategory === c.slug ? "#1A0524" : "#FFF9F0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Puja Service Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.75rem"
          }}
        >
          {filteredServices.map((service) => {
            const displayPrice = (service.discountedPricePaise || service.regularPricePaise) / 100;
            const originalPrice = service.regularPricePaise ? service.regularPricePaise / 100 : null;

            return (
              <div
                key={service.id}
                style={{
                  background: "linear-gradient(180deg, rgba(62, 17, 82, 0.65) 0%, rgba(32, 7, 46, 0.85) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.28)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)"
                }}
              >
                {/* Header Image */}
                <div style={{ position: "relative", height: "180px", background: "#2E0B3B", overflow: "hidden" }}>
                  <img
                    src={service.coverImageUrl || "/images/banner-1.jpg"}
                    alt={service.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(26,5,36,0.85) 100%)"
                    }}
                  />
                  {service.temple && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        left: "0.75rem",
                        background: "rgba(26, 5, 36, 0.85)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(212, 168, 79, 0.5)",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        color: "#F2C96B",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <MapPin size={12} color="#D4A84F" /> {service.temple.name}, {service.temple.city}
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "rgba(16, 185, 129, 0.9)",
                      color: "#FFFFFF",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem"
                    }}
                  >
                    <Video size={12} /> LIVE STREAM AVAILABLE
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "#FFF9F0",
                      margin: "0 0 0.5rem",
                      lineHeight: 1.25
                    }}
                  >
                    {service.name}
                  </h3>

                  <p
                    style={{
                      color: "rgba(255, 249, 240, 0.75)",
                      fontSize: "0.88rem",
                      lineHeight: 1.5,
                      margin: "0 0 1rem"
                    }}
                  >
                    {service.shortDescription}
                  </p>

                  {/* Highlights / Benefits */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {(service.benefits || ["Conducted by verified Vedic Acharya", "Live Sankalp with Gotra recitation", "Doorstep consecrated prasad dispatch"]).map((b, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.82rem", color: "#F2C96B" }}>
                        <CheckCircle size={14} color="#D4A84F" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Bar: Price & CTA */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(212, 168, 79, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Dakshina from
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.45rem" }}>
                        <span style={{ fontSize: "1.45rem", fontWeight: 700, color: "#D4A84F" }}>
                          ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {originalPrice && originalPrice > displayPrice && (
                          <span style={{ fontSize: "0.9rem", color: "rgba(255, 249, 240, 0.4)", textDecoration: "line-through" }}>
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(service)}
                      style={{
                        background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "0.7rem 1.25rem",
                        color: "#1A0524",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        boxShadow: "0 4px 12px rgba(212, 168, 79, 0.3)",
                        transition: "transform 0.2s ease"
                      }}
                    >
                      Book Sankalp <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {selectedService && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 2, 14, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
        >
          <div
            style={{
              background: "#240833",
              border: "1px solid #D4A84F",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(212, 168, 79, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(212, 168, 79, 0.05)"
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#F2C96B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  Sacred Puja Booking &amp; Sankalp Form
                </span>
                <h3 style={{ margin: "0.2rem 0 0", color: "#FFF9F0", fontSize: "1.3rem", fontWeight: 700 }}>
                  {selectedService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FFF9F0",
                  cursor: "pointer",
                  padding: "0.25rem"
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            {bookingConfirmed ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "2px solid #10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem"
                  }}
                >
                  <CheckCircle size={36} color="#10B981" />
                </div>
                <h3 style={{ fontSize: "1.6rem", color: "#F2C96B", margin: "0 0 0.5rem" }}>
                  Har Har Mahadev! Puja Booked
                </h3>
                <p style={{ color: "rgba(255, 249, 240, 0.8)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
                  Your sacred ritual request has been accepted. A certified Acharya is assigned to perform your sankalp.
                </p>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px dashed rgba(212, 168, 79, 0.4)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    maxWidth: "460px",
                    margin: "0 auto 2rem",
                    textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Booking Reference:</span>
                    <strong style={{ color: "#D4A84F", fontSize: "0.95rem" }}>{bookingConfirmed.bookingNumber}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Sankalp Devotee:</span>
                    <span style={{ color: "#FFF9F0", fontSize: "0.9rem" }}>{bookingConfirmed.sankalpName}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Ritual Timing:</span>
                    <span style={{ color: "#FFF9F0", fontSize: "0.9rem" }}>{timeSlot}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Total Paid (incl. 18% GST):</span>
                    <strong style={{ color: "#10B981", fontSize: "1.05rem" }}>₹{totalInr.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <button
                    onClick={() => setSelectedService(null)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      padding: "0.65rem 1.5rem",
                      color: "#FFF9F0",
                      cursor: "pointer",
                      fontSize: "0.9rem"
                    }}
                  >
                    Close Window
                  </button>
                  <Link
                    href="/account"
                    style={{
                      background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                      borderRadius: "8px",
                      padding: "0.65rem 1.5rem",
                      color: "#1A0524",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem"
                    }}
                  >
                    View in Devotee Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* 1. Package Selection */}
                {selectedService.packages && selectedService.packages.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#F2C96B", marginBottom: "0.5rem" }}>
                      1. Select Ritual Package
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                      {selectedService.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          style={{
                            border: selectedPackage?.id === pkg.id ? "2px solid #D4A84F" : "1px solid rgba(255, 255, 255, 0.15)",
                            background: selectedPackage?.id === pkg.id ? "rgba(212, 168, 79, 0.1)" : "rgba(255, 255, 255, 0.03)",
                            borderRadius: "10px",
                            padding: "0.85rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#FFF9F0" }}>{pkg.packageName}</div>
                          <div style={{ color: "#D4A84F", fontWeight: 700, fontSize: "1.1rem", margin: "0.25rem 0" }}>
                            ₹{(pkg.pricePaise / 100).toLocaleString("en-IN")}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)", lineHeight: 1.35 }}>
                            {pkg.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Add-Ons Selection */}
                {selectedService.addOns && selectedService.addOns.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#F2C96B", marginBottom: "0.5rem" }}>
                      2. Sacred Add-ons (Optional)
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {selectedService.addOns.map((addon) => (
                        <label
                          key={addon.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: selectedAddOns.includes(addon.id) ? "1px solid #D4A84F" : "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "8px",
                            padding: "0.6rem 0.85rem",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <input
                              type="checkbox"
                              checked={selectedAddOns.includes(addon.id)}
                              onChange={() => toggleAddOn(addon.id)}
                              style={{ accentColor: "#D4A84F" }}
                            />
                            <div>
                              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#FFF9F0" }}>{addon.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)" }}>{addon.description}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F2C96B" }}>
                            +₹{(addon.pricePaise / 100).toLocaleString("en-IN")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Devotee Sankalp Information */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#F2C96B", marginBottom: "0.5rem" }}>
                    3. Devotee &amp; Sankalp Details
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.7)" }}>Devotee Full Name *</span>
                      <input
                        type="text"
                        required
                        value={devoteeName}
                        onChange={(e) => setDevoteeName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          padding: "0.55rem 0.75rem",
                          color: "#FFF9F0",
                          fontSize: "0.88rem",
                          marginTop: "0.2rem"
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.7)" }}>Gotra (if known)</span>
                      <input
                        type="text"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        placeholder="e.g. Kashyapa / Bharadwaj"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          padding: "0.55rem 0.75rem",
                          color: "#FFF9F0",
                          fontSize: "0.88rem",
                          marginTop: "0.2rem"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.6rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.7)" }}>Janma Nakshatra</span>
                      <input
                        type="text"
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        placeholder="e.g. Rohini / Ashwini"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          padding: "0.55rem 0.75rem",
                          color: "#FFF9F0",
                          fontSize: "0.88rem",
                          marginTop: "0.2rem"
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.7)" }}>Zodiac (Rashi)</span>
                      <input
                        type="text"
                        value={rashi}
                        onChange={(e) => setRashi(e.target.value)}
                        placeholder="e.g. Mesha / Vrishabha"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          padding: "0.55rem 0.75rem",
                          color: "#FFF9F0",
                          fontSize: "0.88rem",
                          marginTop: "0.2rem"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "0.6rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.7)" }}>Sankalp Wish / Prayer Intent</span>
                    <input
                      type="text"
                      value={sankalpWish}
                      onChange={(e) => setSankalpWish(e.target.value)}
                      placeholder="e.g. Family health, career advancement, and liberation from hurdles"
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        padding: "0.55rem 0.75rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                </div>

                {/* 4. Prasad Delivery Address */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#F2C96B", marginBottom: "0.5rem" }}>
                    4. Doorstep Prasad Shipping Address
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
                    <input
                      type="text"
                      placeholder="Street Address, Flat / House No."
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        padding: "0.55rem 0.75rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        padding: "0.55rem 0.75rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem"
                      }}
                    />
                  </div>
                </div>

                {/* 5. Live Agora Option */}
                <div
                  style={{
                    background: "rgba(212, 168, 79, 0.07)",
                    border: "1px solid rgba(212, 168, 79, 0.3)",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Video size={20} color="#D4A84F" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#FFF9F0" }}>Join via Live Video Room</div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>Interactive 2-way video stream with priest during Sankalp</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLiveOnline}
                    onChange={(e) => setIsLiveOnline(e.target.checked)}
                    style={{ accentColor: "#D4A84F", transform: "scale(1.2)" }}
                  />
                </div>

                {/* Financial Summary & GST Breakdown */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "1rem",
                    fontSize: "0.88rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", color: "rgba(255, 249, 240, 0.7)" }}>
                    <span>Ritual Subtotal:</span>
                    <span>₹{subtotalInr.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", color: "rgba(255, 249, 240, 0.7)" }}>
                    <span>Govt GST (18%):</span>
                    <span>₹{gstInr.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", color: "rgba(255, 249, 240, 0.7)" }}>
                    <span>Prasad Shipping:</span>
                    <span style={{ color: "#10B981" }}>FREE</span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid rgba(212, 168, 79, 0.3)",
                      marginTop: "0.5rem",
                      paddingTop: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 700,
                      fontSize: "1.1rem"
                    }}
                  >
                    <span style={{ color: "#FFF9F0" }}>Total Amount:</span>
                    <span style={{ color: "#D4A84F" }}>₹{totalInr.toFixed(2)}</span>
                  </div>
                </div>

                {/* Confirm CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.85rem",
                    color: "#1A0524",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(212, 168, 79, 0.4)"
                  }}
                >
                  {isSubmitting ? "Generating Sacred Booking..." : `Confirm & Pay ₹${totalInr.toFixed(2)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
