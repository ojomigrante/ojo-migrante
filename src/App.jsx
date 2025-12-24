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
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/6oU9ATfL0cgP70731p6kg0j",
        "Framed Print": "https://buy.stripe.com/5kQ3cvcyO5Sr0BJ0Th6kg0g",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/28E4gz8iybcLfwDfOb6kg0i",
        "Framed Print": "https://buy.stripe.com/00wcN5dCS4On7076dB6kg0k",
      },
    },
  },

  {
    id: "p3",
    title: "sombra detenida",
    series: "Portrait",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p3%20_sombre%20detenida_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p3%20_sombre%20detenida_.jpg",
    description:
      "A child stands en la entrada de un local cerrado, paused between light and shadow. The street se hace en una sala de espera, where time passes and no pasa nada.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/4gM3cvfL0a8Hesz9pN6kg0l",
        "Framed Print": "https://buy.stripe.com/fZu8wP2Ye5SrfwD7hF6kg0o",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/aFaeVdeGWcgP2JR31p6kg0m",
        "Framed Print": "https://buy.stripe.com/3cI7sLaqG80zckr8lJ6kg0p",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/00w7sLgP43KjeszgSf6kg0n",
        "Framed Print": "https://buy.stripe.com/8x27sL42i94D84b59x6kg0q",
      },
    },
  },

  {
    id: "p4",
    title: "bajo observación",
    series: "Black & White",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p4%20_bajo%20observacion_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p4%20_bajo%20observacion_.jpg",
    description:
      "Police officers pasen inside a patrol car, paused and observing as la vida continúa alrededor.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/6oUfZhfL0ft1ckr45t6kg0r",
        "Framed Print": "https://buy.stripe.com/14A00jeGW0y7ckreK76kg0u",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/9B6fZh42ieoX5W39pN6kg0s",
        "Framed Print": "https://buy.stripe.com/cNi28r56ma8Hesz31p6kg0v",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/6oU14naqG0y7eszcBZ6kg0t",
        "Framed Print": "https://buy.stripe.com/bJeaEX56m3Kj0BJdG36kg0w",
      },
    },
  },

  {
    id: "p5",
    title: "peso justo",
    series: "Black & White",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p5%20_peso%20justo_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p5%20_peso%20justo_.jpg",
    description:
      "A street vendor pesa fruta en una balanza improvisada, while a passerby moves through the frame.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/cNi14ngP4ft184bgSf6kg0x",
        "Framed Print": "https://buy.stripe.com/aFa3cvdCS3Kj2JR6dB6kg0A",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/8x27sL7eu94D1FN31p6kg0y",
        "Framed Print": "https://buy.stripe.com/bJe9ATfL02Gf4RZ0Th6kg0B",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/8x200jeGW4Onesz8lJ6kg0z",
        "Framed Print": "https://buy.stripe.com/aFa9AT56m1Cb0BJ6dB6kg0C",
      },
    },
  },

  {
    id: "p6",
    title: "antes del proximo destino",
    series: "Street",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p6%20_antes%20del%20proximo%20destino_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p6%20_antes%20del%20proximo%20destino_.jpg",
    description:
      "A man works dentro un carro between routes and work. The body folds inward, carrying el peso del dia, while the road le espera afuera.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/5kQ00j9mC6Wv4RZcBZ6kg0D",
        "Framed Print": "https://buy.stripe.com/4gMdR99mC0y75W31Xl6kg0G",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/aFa7sL6aqcgP4RZ0Th6kg0E",
        "Framed Print": "https://buy.stripe.com/14AfZh8iy3Kjacj45t6kg0H",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/4gM9AT0Q694Dacj0Th6kg0F",
        "Framed Print": "https://buy.stripe.com/9B6aEXgP41Cb4RZ6dB6kg0I",
      },
    },
  },

  {
    id: "p7",
    title: "descanso en transito",
    series: "Street",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2024,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p7%20_descanso%20en%20transito_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p7%20_descanso%20en%20transito_.jpg",
    description:
      "Un viejito sits along la acera, taking a brief rest between work and movement. The body pauses against the wall, while la calle sigue adelante.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/3cIbJ1eGWft15W39pN6kg0J",
        "Framed Print": "https://buy.stripe.com/6oU00j42igx5acjbxV6kg0M",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/9B614neGW80z0BJbxV6kg0K",
        "Framed Print": "https://buy.stripe.com/28EbJ12Yea8H3NV59x6kg0N",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/8x2bJ19mCa8H1FN1Xl6kg0L",
        "Framed Print": "https://buy.stripe.com/eVq14nbuK0y7ckr6dB6kg0O",
      },
    },
  },

  {
    id: "p8",
    title: "turno en marcha",
    series: "Fine Art",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p8%20_turno%20en%20marcha_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p8%20_turno%20en%20marcha_.jpg",
    description:
      "A bus driver pauses at the window, trabajando while the route continues.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/aFa9AT42i94DacjbxV6kg0P",
        "Framed Print": "https://buy.stripe.com/3cI9ATdCScgPgAHgSf6kg0S",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/28E8wPdCS94D4RZ7hF6kg0Q",
        "Framed Print": "https://buy.stripe.com/fZu8wPgP45Srckr7hF6kg0T",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/14A7sLgP41Cbacj31p6kg0R",
        "Framed Print": "https://buy.stripe.com/8x23cv7eu4OnbgngSf6kg0U",
      },
    },
  },

  {
    id: "p9",
    title: "juego en la calle",
    series: "Portrait",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2023,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p9%20_juego%20en%20la%20calle_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p9%20_juego%20en%20la%20calle_.jpg",
    description:
      "A child stands en la calle holding a bat, paused between play and waiting. The street becomes un espacio de juego, shaped by imagination and everyday life.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/00w8wP0Q6cgP2JRfOb6kg0V",
        "Framed Print": "https://buy.stripe.com/dRm6oHfL04On1FNbxV6kg0Y",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/eVq14n7eu0y798feK76kg0W",
        "Framed Print": "https://buy.stripe.com/aFadR9eGWdkTacjbxV6kg0Z",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/cNi28r8iycgPacjfOb6kg0X",
        "Framed Print": "https://buy.stripe.com/00w00jbuKa8H2JR31p6kg10",
      },
    },
  },

  {
    id: "p10",
    title: "la jugada sigue",
    series: "Black & White",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p10%20_la%20jugada%20sigue_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p10%20_la%20jugada%20sigue_.jpg",
    description:
      "Two young men play fútbol en una cancha improvisada, moving across open ground. The city frames the action, while play becomes practice for ritmo, espacio y seguir adelante.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/6oU3cvgP4dkT84b45t6kg11",
        "Framed Print": "https://buy.stripe.com/5kQbJ1eGWcgP3NV1Xl6kg14",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/28EfZh42i94DbgnfOb6kg12",
        "Framed Print": "https://buy.stripe.com/8x29AT8iy5Sracj9pN6kg15",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/00w14n1Ua3Kjesz8lJ6kg13",
        "Framed Print": "https://buy.stripe.com/00w14n42idkTacjfOb6kg16",
      },
    },
  },

  {
    id: "p11",
    title: "tiempo compartido",
    series: "Street",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p11%20_tiempo%20compartido_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p11%20_tiempo%20compartido_.jpg",
    description: "Two people wait en la banca, as the city speaks around them.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/5kQ14nbuKgx598f45t6kg17",
        "Framed Print": "https://buy.stripe.com/9B6aEX9mC1Cb5W3fOb6kg1a",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/5kQcN5eGWdkTdov8lJ6kg18",
        "Framed Print": "https://buy.stripe.com/4gM7sL8iydkTgAH0Th6kg1b",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/bJe6oH1Ua94D3NVdG36kg19",
        "Framed Print": "https://buy.stripe.com/8x228r42i4On2JRgSf6kg1c",
      },
    },
  },

  {
    id: "p12",
    title: "vintage con sazón",
    series: "Landscape",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p12%20_vintage%20con%20sazon_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p12%20_vintage%20con%20sazon_.jpg",
    description:
      "Un clásico que sigue rodando por las calles, full of history, orgullo y timeless vibes.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/dRm6oHcyO6Wv98feK76kg1d",
        "Framed Print": "https://buy.stripe.com/aFabJ17eudkTckrdG36kg1g",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/14AcN5gP4eoXacj1Xl6kg1e",
        "Framed Print": "https://buy.stripe.com/00weVd9mCft1acjgSf6kg1h",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/9B6aEXgP494D3NV31p6kg1f",
        "Framed Print": "https://buy.stripe.com/3cIcN5buK1Cbckr6dB6kg1i",
      },
    },
  },

  {
    id: "p13",
    title: "colores que nunca se apagan",
    series: "Landscape",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p13%20_colores%20que%20no%20se%20apagan_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p13%20_colores%20que%20no%20se%20apagan_.jpg",
    description:
      "Clásicos alineados en la calle, each one con su propio flow y decades of history shining through chrome and color.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/14AfZh6aq6Wv4RZfOb6kg1j",
        "Framed Print": "https://buy.stripe.com/aFa3cvaqGa8H3NV59x6kg1m",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/8x24gzaqG94D5W38lJ6kg1k",
        "Framed Print": "https://buy.stripe.com/4gM3cv0Q6a8Hbgn31p6kg1n",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/aFa6oHaqGgx50BJcBZ6kg1l",
        "Framed Print": "https://buy.stripe.com/bJe28r6aq80zesz9pN6kg1o",
      },
    },
  },

  {
    id: "p14",
    title: "entre historia y pan diario",
    series: "Fine Art",
    priceBySize: { "8×10": 180, "11×14": 185, "16×20": 200 },
    sizes: ["8×10", "11×14", "16×20"],
    edition: "Limited",
    inStock: true,
    year: 2014,
    imageSrcs: [
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p14%20_%20entre%20historia%20y%20pan%20diario_.jpg",
    ],
    image:
      "https://ik.imagekit.io/kkyqx5mlc/ojo%20full%20photo%20/p14%20_%20entre%20historia%20y%20pan%20diario_.jpg",
    description:
      "la vida sigue su ritmo mientras la historia observa -- un contraste poderoso entre the present and the eternal.",
    shipping: "Ships flat with protective packaging.",
    checkoutLinks: {
      "8×10": {
        "Print (Flat)": "https://buy.stripe.com/4gM3cv6aqeoX98fgSf6kg1p",
        "Framed Print": "https://buy.stripe.com/6oUbJ10Q60y7bgn6dB6kg1s",
      },
      "11×14": {
        "Print (Flat)": "https://buy.stripe.com/28E3cv56m4On3NV6dB6kg1q",
        "Framed Print": "https://buy.stripe.com/eVq4gzgP44Onckr31p6kg1t",
      },
      "16×20": {
        "Print (Flat)": "https://buy.stripe.com/9B63cvfL094Ddov0Th6kg1r",
        "Framed Print": "https://buy.stripe.com/eVq8wPcyOeoXckr0Th6kg1u",
      },
    },
  },
];

const SERIES = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.series)))];

function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Fulfillment options (how a print is delivered)
const FULFILLMENT_OPTIONS = ["Print (Flat)", "Framed Print"];
const DEFAULT_FULFILLMENT = FULFILLMENT_OPTIONS[0];

// Default framing add-ons (edit anytime)
const DEFAULT_FRAME_ADDON_BY_SIZE = {
  "8×10": 80,
  "11×14": 110,
  "16×20": 160,
  "24×36": 240,
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getFrameAddon(product, size) {
  const bySize = product?.frameAddOnBySize;
  if (bySize && size && bySize[size] != null) return Number(bySize[size]);
  if (size && DEFAULT_FRAME_ADDON_BY_SIZE[size] != null) {
    return Number(DEFAULT_FRAME_ADDON_BY_SIZE[size]);
  }
  return 0;
}

function getUnitPrice(product, size, fulfillment = DEFAULT_FULFILLMENT) {
  const bySize = product?.priceBySize;
  let base = 0;
  if (bySize && size && bySize[size] != null) base = Number(bySize[size]);
  else if (product?.price != null) base = Number(product.price);

  if (fulfillment === "Framed Print") base += getFrameAddon(product, size);

  return Number.isFinite(base) ? base : 0;
}

function getFromPrice(product) {
  const sizes = product?.sizes ?? [];
  if (sizes.length) {
    const vals = sizes.map((s) => getUnitPrice(product, s, DEFAULT_FULFILLMENT));
    const finite = vals.filter((v) => Number.isFinite(v));
    if (finite.length) return Math.min(...finite);
  }
  return getUnitPrice(product, sizes?.[0], DEFAULT_FULFILLMENT);
}

// ---------------------------------------------------------------------------
// Payments (Stripe Payment Links per product/size/fulfillment)
// ---------------------------------------------------------------------------
function getCheckoutUrl(product, size, fulfillment) {
  const link = product?.checkoutLinks?.[size]?.[fulfillment];
  if (typeof link === "string" && link.startsWith("http")) return link;
  if (typeof BRAND.checkoutUrl === "string" && BRAND.checkoutUrl.startsWith("http")) {
    return BRAND.checkoutUrl;
  }
  return null;
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function Button({ children, onClick, disabled, variant = "primary", className = "" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm transition shadow-sm";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : variant === "ghost"
      ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
      : "bg-black/50 text-white hover:bg-black/60 border border-white/10";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}

function Drawer({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-zinc-950"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="text-white font-medium">{title}</div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-white/10"
                aria-label="Close"
                type="button"
              >
                <X className="h-5 w-5 text-white/80" />
              </button>
            </div>
            <div className="h-[calc(100%-64px)] overflow-auto">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="text-white font-medium">Details</div>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 hover:bg-white/10"
                  aria-label="Close"
                  type="button"
                >
                  <X className="h-5 w-5 text-white/80" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function useCart() {
  const [items, setItems] = useState([]); // {id, title, price, size, fulfillment, qty}

  const add = (product, size, fulfillment) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === product.id && i.size === size && i.fulfillment === fulfillment
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: getUnitPrice(product, size, fulfillment),
          size,
          fulfillment,
          qty: 1,
        },
      ];
    });
  };

  const remove = (id, size, fulfillment) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.fulfillment === fulfillment)));
  };

  const setQty = (id, size, fulfillment, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size && i.fulfillment === fulfillment
          ? { ...i, qty: clamp(qty, 1, 99) }
          : i
      )
    );
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return { items, add, remove, setQty, clear, subtotal, count };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("All");
  const [availability, setAvailability] = useState("All"); // All | In stock
  const [sort, setSort] = useState("Featured");
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState(null); // product
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFulfillment, setSelectedFulfillment] = useState(DEFAULT_FULFILLMENT);

  const cart = useCart();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        String(p.year).includes(q);
      const matchesSeries = series === "All" || p.series === series;
      const matchesAvail = availability === "All" || p.inStock;
      return matchesQuery && matchesSeries && matchesAvail;
    });

    if (sort === "Price: Low") list = [...list].sort((a, b) => getFromPrice(a) - getFromPrice(b));
    if (sort === "Price: High") list = [...list].sort((a, b) => getFromPrice(b) - getFromPrice(a));
    if (sort === "Newest") list = [...list].sort((a, b) => b.year - a.year);

    return list;
  }, [query, series, availability, sort]);

  const openDetails = (p) => {
    setDetail(p);
    setSelectedSize(p.sizes?.[0] ?? null);
    setSelectedFulfillment(DEFAULT_FULFILLMENT);
  };

  const startCheckout = (product, size, fulfillment) => {
    const url = getCheckoutUrl(product, size, fulfillment);
    if (!url) {
      alert(
        "Payment link missing. Add a Stripe Payment Link for this size + delivery option in the product's checkoutLinks."
      );
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const addToCartFromModal = () => {
    if (!detail || !selectedSize) return;
    cart.add(detail, selectedSize, selectedFulfillment);
    setCartOpen(true);
  };

  const buyNowFromModal = () => {
    if (!detail || !selectedSize) return;
    startCheckout(detail, selectedSize, selectedFulfillment);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a
            href="#"
            className="flex items-center gap-3 focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Go to homepage"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <SmartImg
                srcs={driveUrls(BRAND.logoFileId, BRAND.logoResourceKey)}
                alt={`${BRAND.name} logo`}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold leading-tight">{BRAND.name}</div>
              <div className="text-xs text-white/60">{BRAND.tagline}</div>
            </div>
          </a>

          <div className="hidden items-center gap-2 md:flex">
            <a href="#shop" className="rounded-2xl px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              Shop
            </a>
            <a href="#about" className="rounded-2xl px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              About
            </a>
            <a href="#faq" className="rounded-2xl px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              FAQ
            </a>
            <a href="#contact" className="rounded-2xl px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              Contact
            </a>
          </div>

          <Button variant="ghost" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="h-4 w-4" />
            Cart
            {cart.count > 0 ? (
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">{cart.count}</span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="flex flex-col justify-center">
            <motion.h1
              className="text-4xl font-semibold tracking-tight md:text-5xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Photographs que se sienten como recuerdos.
            </motion.h1>

            <p className="mt-4 max-w-prose text-white/70">
              Curated collections of street, landscape, and fine art photography — printed with archival pigment inks
              and made to last.
            </p>

            <div className="mt-4 max-w-prose rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <span className="font-medium">Limited edition</span> — cada foto está firmada, fechada y numerada, y viene
              con un mensaje personal de agradecimiento del fotógrafo. <span className="font-medium">No reprints.</span>{" "}
              Once it’s gone, it’s gone.
            </div>

            <div className="mt-3 text-sm text-white/60">{BRAND.heroNote}</div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse prints <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => (window.location.href = `mailto:${BRAND.email}`)}
              >
                <Mail className="h-4 w-4" />
                Email us
              </Button>
            </div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SmartImg
              srcs={PRODUCTS[1]?.imageSrcs ?? PRODUCTS[1]?.image}
              alt="Featured print"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-sm text-white/70">Featured</div>
              <div className="text-xl font-semibold">{PRODUCTS[1]?.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>{PRODUCTS[1]?.edition}</Pill>
                <Pill>{formatUSD(getFromPrice(PRODUCTS[1]))}</Pill>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Shop prints</h2>
            <p className="mt-1 text-sm text-white/60">
              Search, filter, and open any piece for sizing and edition details.
            </p>
          </div>

          <div className="grid w-full gap-2 md:w-auto md:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, series, year…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <Filter className="h-4 w-4 text-white/60" />
                <select
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  {SERIES.map((s) => (
                    <option key={s} value={s} className="bg-zinc-950">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="All" className="bg-zinc-950">
                    Availability: All
                  </option>
                  <option value="In stock" className="bg-zinc-950">
                    Availability: In stock
                  </option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  {["Featured", "Newest", "Price: Low", "Price: High"].map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-950">
                      Sort: {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        <div className="mb-6 flex gap-2 md:hidden">
          <div className="flex w-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="All" className="bg-zinc-950">
                Availability: All
              </option>
              <option value="In stock" className="bg-zinc-950">
                Availability: In stock
              </option>
            </select>
          </div>
          <div className="flex w-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              {["Featured", "Newest", "Price: Low", "Price: High"].map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-950">
                  Sort: {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => openDetails(p)}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              type="button"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImg
                  srcs={p.imageSrcs ?? p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {!p.inStock ? (
                  <div className="absolute left-3 top-3">
                    <Pill>Sold out</Pill>
                  </div>
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">
                      {p.series} • {p.year}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{p.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">From</div>
                    <div className="text-lg font-semibold">{formatUSD(getFromPrice(p))}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{p.edition}</Pill>
                  <Pill>{p.sizes.join(" • ")}</Pill>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            No matches. Try clearing filters.
          </div>
        ) : null}
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">About</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/80 font-medium">Archival quality</div>
              <p className="mt-2 text-sm text-white/60">
                Prints use pigment inks and museum-grade papers for longevity and consistent color.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/80 font-medium">Fair, simple pricing</div>
              <p className="mt-2 text-sm text-white/60">
                Transparent pricing and clear edition details — no surprises.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/80 font-medium">Secure checkout</div>
              <p className="mt-2 text-sm text-white/60">
                Stripe payment links per piece/size/delivery (fast + simple).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "What’s included with a print?",
                a: "Cada foto está firmada, fechada y numerada (cuando aplica). Incluye un mensaje personal del fotógrafo.",
              },
              {
                q: "Do you offer framing?",
                a: "Yes—choose Print (Flat) or Framed Print on the details page. Framed prints ship ready-to-hang.",
              },
              {
                q: "What’s the return policy?",
                a: "If your print arrives damaged, we’ll replace it. For other issues, contact us within 7 days of delivery.",
              },
              {
                q: "Can I request a custom size?",
                a: "Sometimes. Email us with the piece name and desired dimensions — we’ll confirm feasibility and pricing.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="font-medium">{item.q}</div>
                <p className="mt-2 text-sm text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold">Contact</h2>
              <p className="mt-2 text-sm text-white/60">
                Questions about editions, shipping, or commissions? Reach out by email.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
                  href={`mailto:${BRAND.email}`}
                >
                  <Mail className="h-4 w-4" />
                  {BRAND.email}
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/80 font-medium">Payments</div>
              <p className="mt-2 text-sm text-white/60">
                “Buy now” opens the Stripe Payment Link for the selected size + delivery option. Add links to each
                product’s <code>checkoutLinks</code>.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="ghost"
                  onClick={() =>
                    startCheckout(PRODUCTS[0], PRODUCTS[0]?.sizes?.[0] ?? "8×10", DEFAULT_FULFILLMENT)
                  }
                >
                  Test checkout link <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Tip: If a link is missing, it falls back to <code>BRAND.checkoutUrl</code>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Secure packaging</Pill>
            <Pill>Archival inks</Pill>
            <Pill>Limited editions</Pill>
          </div>
        </div>
      </footer>

      {/* Product detail modal */}
      <Modal
        open={!!detail}
        onClose={() => {
          setDetail(null);
          setSelectedSize(null);
          setSelectedFulfillment(DEFAULT_FULFILLMENT);
        }}
      >
        {detail ? (
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
              <WatermarkedImg
                srcs={detail.imageSrcs ?? detail.image}
                alt={detail.title}
                className="h-full w-full object-cover"
                enabled
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-sm text-white/70">
                  {detail.series} • {detail.year}
                </div>
                <div className="text-2xl font-semibold">{detail.title}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill>{detail.edition}</Pill>
                  <Pill>
                    {formatUSD(
                      getUnitPrice(detail, selectedSize ?? detail.sizes?.[0], selectedFulfillment)
                    )}
                  </Pill>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {detail.inStock ? <Pill>In stock</Pill> : <Pill>Sold out</Pill>}
                <Pill>Sizes: {detail.sizes.join(", ")}</Pill>
              </div>

              <p className="mt-4 text-sm text-white/70">{detail.description}</p>

              <div className="mt-5">
                <div className="text-sm text-white/80 font-medium">Choose delivery</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedFulfillment(opt)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        selectedFulfillment === opt
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm text-white/80 font-medium">Choose a size</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detail.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        selectedSize === s
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <Check className="h-4 w-4" /> Shipping
                </div>
                <div className="mt-1">
                  {selectedFulfillment === "Framed Print"
                    ? "Framed prints ship ready-to-hang with protective packaging."
                    : detail.shipping}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={addToCartFromModal} disabled={!detail.inStock}>
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </Button>
                <Button variant="ghost" onClick={buyNowFromModal} disabled={!detail.inStock}>
                  Buy now <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 text-xs text-white/50">
                Note: Payment Links check out one item at a time. For a true cart checkout, we’d switch to Stripe
                Checkout Sessions (backend).
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cart drawer */}
      <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title="Your cart">
        <div className="p-5">
          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              Your cart is empty.
              <div className="mt-4">
                <Button variant="ghost" onClick={() => setCartOpen(false)}>
                  Continue shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {cart.items.map((i) => (
                  <div
                    key={`${i.id}-${i.size}-${i.fulfillment}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{i.title}</div>
                        <div className="mt-1 text-sm text-white/60">
                          Size: {i.size} • {i.fulfillment}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">Each</div>
                        <div className="font-semibold">{formatUSD(i.price)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-1">
                        <button
                          className="rounded-xl p-2 hover:bg-white/10"
                          onClick={() => cart.setQty(i.id, i.size, i.fulfillment, i.qty - 1)}
                          type="button"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4 text-white/80" />
                        </button>
                        <div className="w-8 text-center text-sm">{i.qty}</div>
                        <button
                          className="rounded-xl p-2 hover:bg-white/10"
                          onClick={() => cart.setQty(i.id, i.size, i.fulfillment, i.qty + 1)}
                          type="button"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4 text-white/80" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm text-white/60">Line</div>
                        <div className="font-semibold">{formatUSD(i.price * i.qty)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const p = PRODUCTS.find((pp) => pp.id === i.id);
                          startCheckout(p, i.size, i.fulfillment);
                        }}
                      >
                        Checkout this item <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => cart.remove(i.id, i.size, i.fulfillment)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-white/70">Subtotal</div>
                  <div className="text-lg font-semibold">{formatUSD(cart.subtotal)}</div>
                </div>
                <div className="mt-2 text-xs text-white/50">Taxes and shipping calculated at checkout.</div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      if (cart.items.length === 1) {
                        const i = cart.items[0];
                        const p = PRODUCTS.find((pp) => pp.id === i.id);
                        startCheckout(p, i.size, i.fulfillment);
                        return;
                      }
                      alert(
                        "Stripe Payment Links support checkout one item at a time. Use the 'Checkout this item' buttons."
                      );
                    }}
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={cart.clear}>
                    Clear cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>

      {/* Floating quick action */}
      <div className="fixed bottom-5 right-5 z-20 flex flex-col gap-2">
        <Button variant="ghost" onClick={() => setCartOpen(true)}>
          <ShoppingBag className="h-4 w-4" />
          {cart.count > 0 ? `Cart (${cart.count})` : "Cart"}
        </Button>
      </div>
    </div>
  );
}
