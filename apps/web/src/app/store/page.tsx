"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Award,
  ChevronRight,
  ShoppingCart,
  Star,
  ExternalLink
} from "lucide-react";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  detailedDescription?: string;
  regularPricePaise: number;
  salePricePaise: number;
  stockQuantity: number;
  coverImageUrl: string;
  material?: string;
  origin?: string;
  isFeatured?: boolean;
  category?: { name: string; slug: string };
  rating?: number;
  reviewsCount?: number;
}

const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "pcat-all", name: "All Items", slug: "all", description: "All consecrated spiritual items" },
  { id: "pcat-1", name: "Rudraksha", slug: "rudraksha", description: "Authentic Nepali & Indonesian beads" },
  { id: "pcat-2", name: "Gemstones", slug: "gemstones", description: "Govt Lab-certified Jyotish gemstones" },
  { id: "pcat-3", name: "Gemstone Rings", slug: "gemstone-rings", description: "Pure silver & gold planetary rings" },
  { id: "pcat-4", name: "Spiritual Bracelets", slug: "spiritual-bracelets", description: "Healing crystal wrist energy malas" },
  { id: "pcat-5", name: "Rudraksha Mala", slug: "rudraksha-mala", description: "108+1 japa & meditation malas" },
  { id: "pcat-6", name: "Crystal Products", slug: "crystal-products", description: "Sphatik, amethyst & quartz pyamids" },
  { id: "pcat-7", name: "Yantra", slug: "yantra", description: "Sacred copper & gold geometrical plates" },
  { id: "pcat-8", name: "Kavach", slug: "kavach", description: "Protective talismans and energized pendants" },
  { id: "pcat-9", name: "Puja Samagri", slug: "puja-samagri", description: "Pure cow ghee, havan herbs & gangajal" },
  { id: "pcat-10", name: "Religious Idols", slug: "religious-idols", description: "Ashtadhatu & brass consecrated murtis" },
  { id: "pcat-11", name: "Spiritual Books", slug: "spiritual-books", description: "Vedic scriptures & astrology classics" },
  { id: "pcat-12", name: "Incense and Dhoop", slug: "incense-and-dhoop", description: "Natural organic agarbatti & guggul" },
  { id: "pcat-13", name: "Brass Puja Accessories", slug: "brass-puja-accessories", description: "Panchpatra, shankha stand & thalis" },
  { id: "pcat-14", name: "Diya and Lamps", slug: "diya-and-lamps", description: "Akhand jyot deepams & brass lamps" },
  { id: "pcat-15", name: "Spiritual Gift Hampers", slug: "spiritual-gift-hampers", description: "Festive celebration collections" },
  { id: "pcat-16", name: "Festival Products", slug: "festival-products", description: "Diwali, Navratri & seasonal essentials" }
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: "prod-01",
    name: "Original 5 Mukhi Nepali Rudraksha Mala (108+1 Beads)",
    slug: "5-mukhi-nepali-rudraksha-mala",
    sku: "RUD-5M-NEP-108",
    shortDescription: "Authentic, high-vibrational collector Nepal beads strung in pure silver capping. Lab certified with X-ray certificate.",
    detailedDescription: "Consecrated during Pradosham at Kashi. Promotes mental focus, cardiovascular equilibrium, stress reduction, and spiritual depth.",
    regularPricePaise: 450000,
    salePricePaise: 350000,
    stockQuantity: 18,
    coverImageUrl: "/images/store-rudraksha.svg",
    material: "Natural Nepali Elaeocarpus Ganitrus & 925 Pure Silver",
    origin: "Nepal",
    isFeatured: true,
    category: { name: "Rudraksha Mala", slug: "rudraksha-mala" },
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: "prod-02",
    name: "Natural Yellow Sapphire (Pukhraj) 5.25 Carat - Ceylon Untreated",
    slug: "natural-yellow-sapphire-ceylon",
    sku: "GEM-PUK-CEY-525",
    shortDescription: "100% Natural, unheated, eye-clean Ceylon Jupiter gemstone. Complete with IGI / GTL Govt Laboratory Certificate.",
    detailedDescription: "Auspicious for academic excellence, wisdom, marital harmony, and financial prosperity. Consecrated with Brihaspati Beej Mantra.",
    regularPricePaise: 3850000,
    salePricePaise: 3200000,
    stockQuantity: 5,
    coverImageUrl: "/images/store-gemstone.jpg",
    material: "Natural Corundum",
    origin: "Ratnapura, Sri Lanka",
    isFeatured: true,
    category: { name: "Gemstones", slug: "gemstones" },
    rating: 5.0,
    reviewsCount: 88
  },
  {
    id: "prod-03",
    name: "Energized 3D Meru Sri Yantra in Pure Panchdhatu",
    slug: "energized-meru-sri-yantra",
    sku: "YAN-SRI-MERU-01",
    shortDescription: "Geometric pyramidal Sri Chakra sculpted per Vedic Tantra scriptures. Plated in 24K gold foil with protective acrylic casing.",
    detailedDescription: "Invocates Goddess Mahalakshmi and Sri Lalita Tripurasundari into residence and commercial spaces. Radiates positive cosmic vastu energy.",
    regularPricePaise: 650000,
    salePricePaise: 499900,
    stockQuantity: 12,
    coverImageUrl: "/images/puja-grah-shanti.svg",
    material: "Panchdhatu with 24K Gold Plating",
    origin: "Varanasi, India",
    isFeatured: true,
    category: { name: "Yantra", slug: "yantra" },
    rating: 4.8,
    reviewsCount: 64
  },
  {
    id: "prod-04",
    name: "Natural 1 Mukhi Round Kaju/Half Moon Nepali Rudraksha",
    slug: "1-mukhi-nepali-rudraksha",
    sku: "RUD-1M-NEP-KJU",
    shortDescription: "The supreme manifestation of Lord Shiva. Consecrated collector bead encased in a solid silver Om pendant.",
    detailedDescription: "Extremely rare collector bead bringing enlightenment, supreme detachment, inner tranquility and resolution of all major life obstacles.",
    regularPricePaise: 2500000,
    salePricePaise: 1899900,
    stockQuantity: 4,
    coverImageUrl: "/images/store-rudraksha.svg",
    material: "Wild Nepali Rudraksha & Silver",
    origin: "Nepal",
    isFeatured: true,
    category: { name: "Rudraksha", slug: "rudraksha" },
    rating: 4.95,
    reviewsCount: 52
  },
  {
    id: "prod-05",
    name: "Natural Blue Sapphire (Neelam) 4.15 Carat - Ceylon Certified",
    slug: "natural-blue-sapphire-ceylon",
    sku: "GEM-NEL-CEY-415",
    shortDescription: "Royal deep cornflower blue Saturn gemstone. Certified untreated with zero glass filling or thermal enhancements.",
    detailedDescription: "Rapidly rewards hard work, provides discipline, protects against hidden adversaries, and accelerates professional breakthroughs.",
    regularPricePaise: 5500000,
    salePricePaise: 4500000,
    stockQuantity: 3,
    coverImageUrl: "/images/store-gemstone.jpg",
    material: "Natural Untreated Corundum",
    origin: "Sri Lanka",
    isFeatured: false,
    category: { name: "Gemstones", slug: "gemstones" },
    rating: 4.9,
    reviewsCount: 39
  },
  {
    id: "prod-06",
    name: "Sacred Ashtadhatu Consecrated Brass Laddu Gopal Murti",
    slug: "ashtadhatu-laddu-gopal-murti",
    sku: "IDL-GOP-ASH-03",
    shortDescription: "Hand-carved holy idol of Baal Krishna made from traditional eight-metal alloy (Ashtadhatu). Consecrated in Vrindavan.",
    detailedDescription: "Brings pure unconditional love, joyful peace, and maternal fulfillment to the household. Comes with traditional poshak and flute.",
    regularPricePaise: 350000,
    salePricePaise: 280000,
    stockQuantity: 15,
    coverImageUrl: "/images/banner-1.jpg",
    material: "Ashtadhatu (8 Sacred Metals)",
    origin: "Vrindavan, India",
    isFeatured: false,
    category: { name: "Religious Idols", slug: "religious-idols" },
    rating: 4.85,
    reviewsCount: 77
  }
];

export default function AstroStorePage() {
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [cartCount, setCartCount] = useState<number>(0);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Load live data & cart count
  useEffect(() => {
    async function loadStore() {
      try {
        const catRes = await fetch("http://127.0.0.1:4000/api/v1/store/categories");
        if (catRes.ok) {
          const cData = await catRes.json();
          if (cData.success && cData.data && cData.data.length > 0) {
            setCategories([{ id: "pcat-all", name: "All Items", slug: "all", description: "All" }, ...cData.data]);
          }
        }

        const prodRes = await fetch("http://127.0.0.1:4000/api/v1/store/products");
        if (prodRes.ok) {
          const pData = await prodRes.json();
          if (pData.success && pData.data && pData.data.length > 0) {
            setProducts(pData.data);
          }
        }

        // Check customer cart if token exists
        const token = typeof window !== "undefined" ? localStorage.getItem("namh_access_token") : null;
        if (token) {
          const cartRes = await fetch("http://127.0.0.1:4000/api/v1/store/cart", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (cartRes.ok) {
            const crData = await cartRes.json();
            if (crData.success && crData.data) {
              setCartCount(crData.data.itemCount || crData.data.items?.length || 0);
            }
          }
        }
      } catch (e) {
        // Fallback to high quality demo data
      }
    }
    loadStore();
  }, []);

  const handleAddToCart = async (product: Product) => {
    setAddedProductId(product.id);
    setCartCount((prev) => prev + 1);

    // Save item to localStorage cart for offline/demo robustness
    try {
      const stored = localStorage.getItem("namh_local_cart");
      const list = stored ? JSON.parse(stored) : [];
      const existing = list.find((it: any) => it.productId === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        list.push({
          productId: product.id,
          name: product.name,
          priceInr: (product.salePricePaise || product.regularPricePaise) / 100,
          quantity: 1,
          coverImageUrl: product.coverImageUrl
        });
      }
      localStorage.setItem("namh_local_cart", JSON.stringify(list));

      const token = localStorage.getItem("namh_access_token");
      if (token) {
        await fetch("http://127.0.0.1:4000/api/v1/store/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
      }
    } catch (e) {
      // Ignore
    }

    setTimeout(() => setAddedProductId(null), 2000);
  };

  // Filter and sort
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        p.category?.slug === selectedCategory ||
        p.slug.includes(selectedCategory);
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.origin?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.salePricePaise || a.regularPricePaise;
      const priceB = b.salePricePaise || b.regularPricePaise;
      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div style={{ backgroundColor: "#14031D", minHeight: "100vh", color: "#FFF9F0" }}>
      <SiteHeader />

      {/* Hero Banner */}
      <section
        style={{
          background: "radial-gradient(ellipse at 50% 25%, #461159 0%, #20062C 65%, #0F0116 100%)",
          borderBottom: "1px solid rgba(212, 168, 79, 0.25)",
          padding: "3.5rem 1rem 2.8rem"
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto", textAlign: "center" }}>
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
            <ShieldCheck size={15} color="#D4A84F" /> 100% Certified Jyotish Remedies &amp; Consecrated Treasures
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
            NAMH Vedic Astro Store
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
            Explore our curated catalog of authentic Nepali Rudrakshas, unheated Ceylon Jyotish gemstones with government laboratory certification, consecrated Panchdhatu yantras, and pure Vedic havan samagri. Every item is energized per traditional shastras.
          </p>

          {/* Search, Filter Bar and Floating Cart Trigger */}
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 168, 79, 0.3)",
              borderRadius: "14px",
              padding: "0.55rem",
              backdropFilter: "blur(12px)"
            }}
          >
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <Search size={18} color="#D4A84F" style={{ position: "absolute", left: "0.85rem" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rudraksha mukhis, Ceylon gemstones, Sri Yantras..."
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

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                background: "rgba(26, 5, 36, 0.8)",
                border: "1px solid rgba(212, 168, 79, 0.4)",
                borderRadius: "8px",
                padding: "0.6rem 0.85rem",
                color: "#FFF9F0",
                fontSize: "0.85rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <Link
              href="/cart"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                borderRadius: "8px",
                padding: "0.6rem 1.1rem",
                color: "#1A0524",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                boxShadow: "0 4px 12px rgba(212, 168, 79, 0.35)",
                flexShrink: 0
              }}
            >
              <ShoppingCart size={17} />
              <span>Cart ({cartCount})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Storefront Body */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1rem" }}>
        {/* 16 Category Badges Ribbon */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={18} color="#D4A84F" /> 16 Vedic Remedy &amp; Samagri Categories
            </h2>
            <span style={{ fontSize: "0.82rem", color: "rgba(255, 249, 240, 0.6)" }}>
              {filteredProducts.length} Authenticated Products
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

        {/* Product Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "1.75rem"
          }}
        >
          {filteredProducts.map((product) => {
            const salePrice = (product.salePricePaise || product.regularPricePaise) / 100;
            const regularPrice = product.regularPricePaise ? product.regularPricePaise / 100 : null;
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                style={{
                  background: "linear-gradient(180deg, rgba(50, 12, 68, 0.7) 0%, rgba(24, 4, 34, 0.9) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.28)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                  transition: "transform 0.2s ease, border-color 0.2s ease"
                }}
              >
                {/* Product Image Box */}
                <div style={{ position: "relative", height: "220px", background: "#250833", overflow: "hidden" }}>
                  <img
                    src={product.coverImageUrl || "/images/store-rudraksha.svg"}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(20,3,29,0.85) 100%)"
                    }}
                  />

                  {/* Certified & Origin Badges */}
                  <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <span
                      style={{
                        background: "rgba(16, 185, 129, 0.9)",
                        color: "#FFFFFF",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <ShieldCheck size={12} /> LAB CERTIFIED
                    </span>
                    {product.origin && (
                      <span
                        style={{
                          background: "rgba(26, 5, 36, 0.85)",
                          border: "1px solid rgba(212, 168, 79, 0.4)",
                          color: "#F2C96B",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 600
                        }}
                      >
                        Origin: {product.origin}
                      </span>
                    )}
                  </div>

                  {product.stockQuantity <= 5 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        right: "0.75rem",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "#FFFFFF",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 700
                      }}
                    >
                      Only {product.stockQuantity} Left!
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                    <Star size={14} color="#F2C96B" fill="#F2C96B" />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F2C96B" }}>
                      {product.rating || 4.9}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.5)" }}>
                      ({product.reviewsCount || 42} reviews)
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#FFF9F0",
                      margin: "0 0 0.5rem",
                      lineHeight: 1.25
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      color: "rgba(255, 249, 240, 0.7)",
                      fontSize: "0.82rem",
                      lineHeight: 1.45,
                      margin: "0 0 1rem"
                    }}
                  >
                    {product.shortDescription}
                  </p>

                  {/* Material & Authenticity */}
                  {product.material && (
                    <div style={{ fontSize: "0.76rem", color: "rgba(255, 249, 240, 0.6)", marginBottom: "1rem" }}>
                      <strong>Material:</strong> {product.material}
                    </div>
                  )}

                  {/* Pricing & Add to Cart */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid rgba(212, 168, 79, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#D4A84F" }}>
                        ₹{salePrice.toLocaleString("en-IN")}
                      </div>
                      {regularPrice && regularPrice > salePrice && (
                        <div style={{ fontSize: "0.82rem", color: "rgba(255, 249, 240, 0.4)", textDecoration: "line-through" }}>
                          MRP: ₹{regularPrice.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        background: isJustAdded
                          ? "#10B981"
                          : "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.65rem 1rem",
                        color: "#1A0524",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        transition: "all 0.2s"
                      }}
                    >
                      {isJustAdded ? (
                        <>
                          <CheckCircle size={15} color="#1A0524" /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={15} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
