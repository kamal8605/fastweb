"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBrands, type Brand } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";
import { useProducts, type Product } from "@/hooks/useProducts";

const FALLBACK_CATEGORIES = [
  "Apparel / Merch",
  "Hookah",
  "Glass / Accessories",
  "Cigar / Lighter Essentials",
  "Smoking Essentials",
  "Everyday Essentials",
  "Detox / Supplements",
  "Clearance",
];

const FALLBACK_BRANDS = ["Puffco", "OPMS", "Coastal Clouds", "Smok", "Formula 420", "Raw", "Blazy Susan"];

const PROMO_TILES = [
  { title: "Infused Essentials", tone: "blue" },
  { title: "7-Hydroxy", tone: "teal" },
  { title: "Juice Bar", tone: "orange" },
  { title: "Vaporizer Vault", tone: "green" },
] as const;

const FEATURED_PRODUCTS = [
  "YOLO Hot Grabba Tube - Box of 30",
  "Puffco Peak Pro Rig 3DXL",
  "Puffco Peak Pro Chamber",
  "ROOR Smoke Ware Cleaner",
  "RAW Cone 5 Premium Hand Pipe",
  "RAW Lighter - Extendo Black",
  "RAW Rolling Papers Box King Size",
  "DUD Hookah Husic Assorted Colors",
  "Zebra Smoke Hookah Assorted Colors",
  "Al Malaki Prince Hookah Top",
  "DUD Party 4 Hoses Hookah",
  "DUD Turkeya Hookah",
  "Quick Fix Plus",
  "Uwell Caliburn A2 Refillable Pod",
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function BannerVisual({
  title,
  subtitle,
  tone = "blue",
  compact = false,
  eyebrow = "New Arrival",
}: {
  title: string;
  subtitle?: string;
  tone?: "blue" | "green" | "orange" | "teal" | "dark";
  compact?: boolean;
  eyebrow?: string;
}) {
  const palettes = {
    blue: "from-brand-blue via-[#5DB4FF] to-[#CFEAFF]",
    green: "from-[#143A2C] via-[#2E7D5B] to-[#D6F4E5]",
    orange: "from-brand-orange via-[#FFB062] to-[#FFE2C7]",
    teal: "from-[#0A7776] via-[#57C9C2] to-[#DDF9F4]",
    dark: "from-brand-navy via-[#173A69] to-[#0B1F3A]",
  };

  const shapeLayout = compact
    ? "-right-32 bottom-5 gap-3 opacity-70"
    : "-right-4 bottom-6 gap-4 opacity-90";
  const contentLayout = compact
    ? "max-w-[330px] p-7 pr-24 md:p-10 md:pr-24"
    : "max-w-[620px] p-8 pr-14 md:p-10 md:pr-20";

  return (
    <div className={`relative h-full min-h-[230px] overflow-hidden bg-gradient-to-br ${palettes[tone]}`}>
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_18px_18px,white_2px,transparent_2px)] [background-size:72px_72px]" />
      <div className="absolute inset-y-0 right-0 w-[48%] bg-gradient-to-l from-white/30 to-transparent" />
      <div className={`absolute hidden items-end sm:flex ${shapeLayout}`}>
        <div className={`${compact ? "h-24 w-12" : "h-28 w-14"} rounded-t-full bg-white/75 shadow-xl`} />
        <div className={`${compact ? "h-[152px] w-20" : "h-44 w-24"} rounded-t-[44px] bg-white/70 shadow-xl`} />
        <div className={`${compact ? "h-24 w-24" : "h-28 w-28"} rounded-full bg-white/75 shadow-xl`} />
        <div className={`${compact ? "h-48 w-12" : "h-54 w-14"} rounded-t-full bg-white/55 shadow-xl`} />
      </div>
      <div className={`relative z-10 flex h-full min-h-[230px] flex-col justify-center text-white ${contentLayout}`}>
        <div className="mb-4 inline-flex w-fit bg-brand-orange px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.03em]">
          {eyebrow}
        </div>
        <h1
          className={`font-black uppercase leading-[0.96] ${
            compact ? "text-[30px] md:text-[40px]" : "text-[36px] sm:text-[48px] md:text-[62px]"
          }`}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-[300px] text-[15px] font-bold leading-6">{subtitle}</p>}
        {!compact && (
          <span className="mt-6 inline-flex w-fit items-center gap-2 bg-brand-ink px-5 py-3 text-[13px] font-bold uppercase tracking-[0.02em] text-white">
            Shop the drop <ArrowRight size={15} className="text-brand-orange" />
          </span>
        )}
      </div>
    </div>
  );
}

function SectionBanner({ title, tone = "orange" }: { title: string; tone?: "orange" | "green" | "blue" }) {
  const palette =
    tone === "green"
      ? "from-[#153C2D] via-[#71B67A] to-[#DDF4DF]"
      : tone === "blue"
        ? "from-brand-blue via-[#84B8FF] to-[#E3F0FF]"
        : "from-[#FFB84F] via-brand-orange to-[#7BBDE8]";

  return (
    <div className={`my-7 flex h-16 items-center justify-center overflow-hidden bg-gradient-to-r ${palette}`}>
      <div className="absolute h-16 w-full opacity-20 [background-image:repeating-linear-gradient(90deg,white_0_18px,transparent_18px_38px)]" />
      <h2 className="relative text-center text-[28px] font-black uppercase italic text-white [text-shadow:0_2px_0_#0B1F3A] md:text-[42px]">
        {title}
      </h2>
    </div>
  );
}

function ProductFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[190px] items-center justify-center bg-brand-bg">
      <div className="relative h-28 w-36">
        <div className="absolute bottom-0 left-2 h-20 w-28 rounded-sm border border-brand-line bg-white shadow-sm" />
        <div className="absolute bottom-4 left-9 h-24 w-12 rounded-t-full bg-gradient-to-b from-brand-blue to-brand-navy shadow-md" />
        <div className="absolute bottom-1 right-2 h-16 w-14 rounded-t-xl bg-gradient-to-b from-brand-orange to-[#B83434] shadow-md" />
        <span className="absolute bottom-8 left-1/2 w-32 -translate-x-1/2 text-center font-mono text-[10px] font-semibold uppercase text-brand-muted">
          {label}
        </span>
      </div>
    </div>
  );
}

function BrandLogo({ brand, index }: { brand?: Brand; index: number }) {
  const label = brand?.name ?? FALLBACK_BRANDS[index % FALLBACK_BRANDS.length];

  return (
    <Link
      href={brand ? `/brand/${brand.id}` : "/brands"}
      className="flex min-w-[130px] flex-col items-center gap-3 text-center no-underline"
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-brand-line bg-brand-white shadow-sm">
        {brand?.image ? (
          <Image
            src={brand.image}
            alt={label}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-bg-alt via-white to-brand-orange-soft">
            <span className="text-[26px] font-black uppercase text-brand-navy">{label.slice(0, 2)}</span>
          </div>
        )}
      </div>
      <span className="text-[14px] font-semibold text-brand-muted">{label}</span>
    </Link>
  );
}

function ProductCard({
  product,
  fallbackName,
  index,
  isAuthenticated,
}: {
  product?: Product;
  fallbackName: string;
  index: number;
  isAuthenticated: boolean;
}) {
  const title = product?.name ?? fallbackName;
  const image = product?.image ?? product?.images?.find((img) => img.is_primary)?.url;
  const href = product ? `/product/${product.id}` : "/shop";
  const soldOut = product ? !product.in_stock : index % 6 === 0;
  const isNew = !soldOut && (index === 1 || index === 2 || index === 3);
  const category = product?.category?.name ?? (index % 2 === 0 ? "Glass / Accessories" : "Papers / Cones / Wraps");
  const price = product?.current_price ?? product?.sale_price ?? product?.regular_price ?? null;
  const regularPrice =
    product?.on_sale && product.regular_price && product.sale_price
      ? product.regular_price
      : null;

  return (
    <Link
      href={href}
      className="group relative flex min-h-[380px] flex-col border-r border-brand-line bg-brand-white px-5 pb-5 pt-4 no-underline transition-colors hover:bg-brand-bg"
    >
      <div className="mb-2 min-h-[34px] text-[12px] uppercase leading-tight tracking-[0.01em] text-[#7A8DA3]">
        {category}
      </div>
      <h3 className="min-h-[72px] text-[15px] font-black uppercase leading-[1.16] text-brand-blue group-hover:text-brand-blue-deep">
        {title}
      </h3>

      <div className="relative mt-3 h-[180px] overflow-hidden bg-white">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 15vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <ProductFallback label="Product Image" />
        )}
      </div>

      <div className="mt-auto flex min-h-[58px] items-end justify-center pt-4">
        {isAuthenticated ? (
          <span className="inline-flex min-w-[132px] flex-col items-center rounded-full bg-brand-navy px-6 py-2.5 text-center text-white shadow-sm">
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-brand-orange">
              Wholesale
            </span>
            <span className="text-[17px] font-black leading-tight">
              {price !== null ? formatPrice(price) : "Price N/A"}
            </span>
            {regularPrice && (
              <span className="text-[11px] leading-tight text-[#C8D2E5] line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </span>
        ) : (
          <span className="rounded-full bg-brand-bg-alt px-6 py-3 text-[14px] font-semibold text-brand-muted transition-colors group-hover:bg-brand-navy group-hover:text-white">
            Login to Buy
          </span>
        )}
      </div>

      {soldOut && (
        <span className="absolute left-0 top-0 bg-[#E60000] px-2 py-1 text-[13px] font-black text-white">
          Sold Out
        </span>
      )}
      {isNew && (
        <span className="absolute left-0 top-0 bg-[#0FAE25] px-2 py-1 text-[13px] font-black text-white">
          New
        </span>
      )}
    </Link>
  );
}

function HeroPromos() {
  return (
    <section className="border-b border-brand-line bg-white px-3 py-8 md:px-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Link href="/new" className="group relative block min-h-[360px] overflow-hidden no-underline">
          <BannerVisual title="Haze Collection" subtitle="Premium wholesale inventory for fast moving counters." />
          <span
            aria-hidden
            className="absolute right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink/80 text-white transition-colors group-hover:bg-brand-ink md:flex"
          >
            <ChevronRight size={28} />
          </span>
        </Link>
        <Link href="/shop" className="group relative block min-h-[360px] overflow-hidden no-underline">
          <BannerVisual
            title="Botanical Alternatives"
            subtitle="Fresh drops across everyday essentials."
            tone="green"
            eyebrow="Wholesale Focus"
            compact
          />
          <span
            aria-hidden
            className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink/85 text-white transition-colors group-hover:bg-brand-ink md:flex"
          >
            <ChevronRight size={24} />
          </span>
        </Link>
      </div>
    </section>
  );
}

function FeaturedBrands() {
  const { data: brands } = useBrands();
  const displayed: Array<Brand | undefined> =
    brands && brands.length > 0 ? brands.slice(0, 7) : Array.from({ length: 7 });

  return (
    <section className="bg-white">
      <SectionBanner title="Featured Brands" />
      <div className="grid grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:px-10">
        {displayed.map((brand, index) => (
          <BrandLogo key={brand?.id ?? index} brand={brand} index={index} />
        ))}
      </div>
    </section>
  );
}

function PromoGrid() {
  return (
    <section className="bg-white px-2 pb-2">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {PROMO_TILES.map((tile) => (
          <Link key={tile.title} href="/shop" className="block min-h-[290px] overflow-hidden no-underline">
            <BannerVisual title={tile.title} tone={tile.tone} compact />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  const { data: categories } = useCategories();
  const displayed: Array<Category | undefined> =
    categories && categories.length > 0 ? categories.slice(0, 8) : Array.from({ length: 8 });

  return (
    <section className="bg-white">
      <SectionBanner title="Our Categories" tone="blue" />
      <div className="grid gap-2 px-2 pb-8 md:grid-cols-2 lg:grid-cols-4">
        {displayed.map((category, index) => {
          const label = category?.name ?? FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length];
          return (
            <Link
              key={category?.id ?? index}
              href={category ? `/category/${category.id}` : "/shop"}
              className="group overflow-hidden border border-brand-line bg-brand-white no-underline"
            >
              <div className="relative h-[220px] overflow-hidden">
                {category?.image ? (
                  <Image
                    src={category.image}
                    alt={label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <BannerVisual title={label} tone={index % 2 === 0 ? "orange" : "teal"} compact />
                )}
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[16px] font-black uppercase text-brand-ink">{label}</h3>
                <ArrowRight size={18} className="text-brand-blue" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductSection({
  title,
  tone,
  products,
  fallbackOffset = 0,
}: {
  title: string;
  tone: "green" | "orange" | "blue";
  products?: Product[];
  fallbackOffset?: number;
}) {
  const { isAuthenticated } = useAuth();
  const displayed =
    products && products.length > 0
      ? products.slice(0, 14)
      : Array.from<Product | undefined>({ length: 14 }).fill(undefined);

  return (
    <section className="bg-white">
      <SectionBanner title={title} tone={tone} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        {displayed.map((product, index) => (
          <ProductCard
            key={product?.id ?? `${title}-${index}`}
            product={product}
            fallbackName={FEATURED_PRODUCTS[(index + fallbackOffset) % FEATURED_PRODUCTS.length]}
            index={index + fallbackOffset}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </section>
  );
}

function SplitFeature() {
  return (
    <section className="bg-white px-2 py-8">
      <div className="mb-7 min-h-[170px] overflow-hidden">
        <BannerVisual title="Counter Ready Wholesale" subtitle="Fast turns, better margins, one simple cart." tone="dark" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Link href="/sale" className="block min-h-[260px] overflow-hidden no-underline">
          <BannerVisual title="Nicotine Disposable" subtitle="Bulk deals for approved retail buyers." tone="green" />
        </Link>
        <Link href="/new" className="block min-h-[260px] overflow-hidden no-underline">
          <BannerVisual title="7-Hydroxymitragynine" subtitle="New stock landing weekly." tone="blue" />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: newProducts } = useProducts({ sort: "newest", per_page: 14 });
  const { data: trendingProducts } = useProducts({ in_stock: true, per_page: 14 });

  return (
    <div className="bg-white">
      <HeroPromos />
      <FeaturedBrands />
      <PromoGrid />
      <Categories />
      <ProductSection title="New Arrivals" tone="blue" products={newProducts?.data} />
      <SplitFeature />
      <ProductSection title="Top Trending" tone="green" products={trendingProducts?.data} fallbackOffset={6} />
    </div>
  );
}
