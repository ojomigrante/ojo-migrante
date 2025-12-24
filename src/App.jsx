import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  Mail,
  ArrowRight,
  X,
  Plus,
  Minus,
  Check,
} from "lucide-react";

/**
 * Photography Shop – single-file React site
 * - Clean storefront for prints
 * - Search + filters
 * - Product modal
 * - Cart drawer
 * - Stripe Payment Links per product/size/fulfillment
 *
 * Changes in this version:
 * - Removed ALL Instagram references (config + UI)
 * - Removed unused imports (Instagram icon)
 * - Kept email as primary contact
 * - Added small "Email us" CTA in hero for cleaner brand focus
 */

// ---------------------------------------------------------------------------
// Google Drive image helpers
// ---------------------------------------------------------------------------
const driveUrls = (fileId, resourceKey) => {
  const rk = resourceKey ? `&resourcekey=${resourceKey}` : "";
  return [
    `https://drive.google.com/uc?export=view&id=${fileId}${rk}`,
    `https://drive.google.com/uc?export=download&id=${fileId}${rk}`,
    `https://drive.google.com/thumbnail?id=${fileId}${rk}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1600`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view${rk}&authuser=0`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download${rk}&authuser=0`,
  ];
};

// ---------------------------------------------------------------------------
// Brand / site config
// ---------------------------------------------------------------------------
const BRAND = {
  name: "Ojo Migrante",
  tagline: "Limited-edition photographic prints.",
  location: "Boston, MA",
  email: "ojomigrante@gmail.com",
  heroNote:
    "Archival-quality prints • Signed & numbered • Ships in 3-5 business days",

  // Optional fallback link (used only if a product-specific link is missing)
  checkoutUrl: "https://buy.stripe.com/your-payment-link", // optional fallback

  // Logo hosted on Google Drive (must be public)
  logoFileId: "1LRjqEfsH5RDg5hKNhHo8XmoAsAJNUOiU",
  logoResourceKey: null,
};

function SmartImg({ srcs, alt, className }) {
  const [idx, setIdx] = useState(0);
  const src = Array.isArray(srcs) ? srcs[idx] : srcs;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        if (Array.isArray(srcs) && idx < srcs.length - 1) setIdx(idx + 1);
      }}
    />
  );
}

// --- Watermark for previews (only in modal) ---
const WATERMARK_TEXT = `${BRAND.name} • Preview`;

function watermarkDataUrl(text) {
  const safe = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
      <rect width='100%' height='100%' fill='transparent'/>
      <g transform='translate(300 200) rotate(-22)'>
        <text x='0' y='0' text-anchor='middle'
          font-family='ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
          font-size='34'
          fill='white' fill-opacity='0.18'
        >${safe}</text>
      </g>
    </svg>`;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function WatermarkedImg({
  srcs,
  alt,
  className,
  enabled = true,
  text = WATERMARK_TEXT,
}) {
  return (
    <div className="relative h-full w-full">
      <SmartImg srcs={srcs} alt={alt} className={className} />
      {enabled ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: watermarkDataUrl(text),
              backgroundRepeat: "repeat",
              backgroundSize: "420px 280px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="-rotate-12 rounded-2xl border border-white/20 bg-black/20 px-4 py-2 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
              {text}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

// Template (use only if you add new products later)
const CHECKOUT_TEMPLATE = {
  "8×10": { "Print (Flat)": "", "Framed Print": "" },
  "11×14": { "Print (Flat)": "", "Framed Print": "" },
  "16×20": { "Print (Flat)": "", "Framed Print": "" },
};

const PRODUCTS = [
  {
    id: "p1",
    title: "silencio en la sala",
    series: "Street",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p1%20_silencio%20en%20la%20sala_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p1%20_silencio%20en%20la%20sala_.jpg",
    description:
      "Un grupo de estudiantes rehearse in silence, focused en la disciplina del cuerpo y la repetición del gesto. La imagen observa stillness within movement y la atención compartida que construye el espacio.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/5kQfZh42i1Cb1FN9pN6kg00",
        "Framed Print": "https://buy.stripe.com/fZuaEXgP4cgP1FNatR6kg0e",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/8x2cN5gP40y7dovfOb6kg0a",
        "Framed Print": "https://buy.stripe.com/eVq14ncyO94Ddov0Th6kg0b",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/3cI4gz8iy94DfwDdG36kg0d",
        "Framed Print": "https://buy.stripe.com/cNieVdeGW5SracjfOb6kg0c",
      },
    },
  },

  {
    id: "p2",
    title: "en la entrada",
    series: "Landscape",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p2%20_en%20la%20entrada.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p2%20_en%20la%20entrada.jpg",
    description:
      "Two men pause en la entrada of a home, ocupando el threshold entre vida privada y espacio público. The doorway becomes un lugar de conversación, descanso, y tiempo compartido.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/eVqdR9gP41Cb84b59x6kg0f",
        "Framed Print": "https://buy.stripe.com/14AdR98iybcL5W3bxV6kg0h",
      },
      "11×
