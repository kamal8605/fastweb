"use client";

import { use, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { type Product } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PriceGate } from "@/components/shared/PriceGate";
import { StockDot } from "@/components/shared/StockDot";
import { CartBar } from "@/components/shared/CartBar";
import {
  useToggleWishlist,
  useWishlist as useWishlistItems,
} from "@/hooks/useWishlist";

interface Props {
  params: Promise<{ id: string }>;
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: "repeating-linear-gradient(135deg, #E5DFD0 0 14px, #D9D3C5 14px 28px)",
      }}
    >
      <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-muted">
        No image
      </span>
    </div>
  );
}

function ImageGallery({ images, name }: { images: { url: string; is_primary: boolean }[]; name: string }) {
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActive((i) => (i + 1) % sorted.length);

  if (sorted.length === 0) {
    return (
      <div className="aspect-[4/3] relative overflow-hidden bg-brand-bg-alt border border-brand-line">
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-brand-bg-alt border border-brand-line group">
        <Image
          src={sorted[active].url}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-white/80 border border-brand-line flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-white/80 border border-brand-line flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 relative overflow-hidden border-2 transition-colors ${
                i === active ? "border-brand-orange" : "border-brand-line hover:border-brand-blue"
              }`}
            >
              <Image src={img.url} alt={`${name} ${i + 1}`} fill className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Block ─────────────────────────────────────────────────────────────

function PriceBlock({ product }: { product: Product }) {
  return (
    <PriceGate pricesVisible={product.prices_visible}>
      {product.on_sale && product.sale_price !== null ? (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[24px] font-semibold text-[#B83434]">
            ${product.sale_price.toFixed(2)}
          </span>
          {product.regular_price !== null && (
            <span className="font-mono text-[16px] text-brand-muted line-through">
              ${product.regular_price.toFixed(2)}
            </span>
          )}
          {product.regular_price !== null && product.sale_price !== null && (
            <span className="font-mono text-[11px] bg-[#B83434] text-white px-1.5 py-0.5">
              -{Math.round((1 - product.sale_price / product.regular_price) * 100)}%
            </span>
          )}
        </div>
      ) : product.current_price !== null ? (
        <span className="font-mono text-[24px] font-semibold text-brand-ink">
          ${product.current_price.toFixed(2)}
        </span>
      ) : (
        <span className="font-mono text-[13px] text-brand-muted">Price not set</span>
      )}
    </PriceGate>
  );
}

// ─── Qty Stepper ─────────────────────────────────────────────────────────────

function QtyStepper({
  value,
  onChange,
  disabled,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  max?: number | null;
}) {
  const reachedMax = max !== null && max !== undefined && value >= max;

  return (
    <div className="inline-flex items-center border border-brand-line">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
        className="w-8 h-8 flex items-center justify-center font-mono text-[14px] text-brand-ink hover:bg-brand-bg-alt transition-colors disabled:opacity-30"
      >
        −
      </button>
      <span className="w-10 text-center font-mono text-[13px] text-brand-ink border-x border-brand-line h-8 flex items-center justify-center">
        {value}
      </span>
      <button
        onClick={() => onChange(max == null ? value + 1 : Math.min(max, value + 1))}
        disabled={disabled || reachedMax}
        className="w-8 h-8 flex items-center justify-center font-mono text-[14px] text-brand-ink hover:bg-brand-bg-alt transition-colors disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

// ─── Simple Product Panel ────────────────────────────────────────────────────

function SimpleAddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(0);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const price = product.current_price ?? product.sale_price;

  if (!isAuthenticated || !product.prices_visible || price === null) {
    return (
      <Link
        href="/login"
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center bg-brand-navy px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-brand-blue"
      >
        Login to Buy
      </Link>
    );
  }

  const handleAdd = () => {
    if (qty === 0) return;
    addItem(
      {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        price,
        parent_id: product.parent_id,
        parent_name: null,
      },
      qty
    );
    setQty(0);
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <QtyStepper
        value={qty}
        onChange={setQty}
        disabled={!product.in_stock}
        max={product.stock_quantity}
      />
      <button
        onClick={handleAdd}
        disabled={qty === 0 || !product.in_stock}
        className="flex-1 bg-brand-navy text-white font-mono text-[11px] tracking-[0.08em] uppercase px-6 py-2 hover:bg-brand-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!product.in_stock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}

// ─── Grouped Variant Table ───────────────────────────────────────────────────

function GroupedVariantTable({ product }: { product: Product }) {
  const children = product.children ?? [];
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const setQty = (id: number, qty: number) =>
    setQtys((prev) => ({ ...prev, [id]: qty }));

  const selectedCount = Object.values(qtys).filter((q) => q > 0).length;

  const handleAddAll = () => {
    children.forEach((child) => {
      const qty = qtys[child.id] ?? 0;
      if (qty === 0) return;
      const price = child.current_price ?? child.sale_price;
      if (!child.in_stock || price === null) return;
      addItem(
        {
          product_id: child.id,
          name: child.name,
          sku: child.sku,
          image: child.image ?? product.image,
          price,
          parent_id: product.id,
          parent_name: product.name,
        },
        qty
      );
    });
    setQtys({});
  };

  const TD = "px-3 py-2 border-b border-brand-line text-left align-middle";
  const TH = "px-3 py-2 font-mono text-[10px] tracking-[0.08em] uppercase text-brand-muted border-b border-brand-ink text-left";

  if (children.length === 0) {
    return (
      <p className="font-mono text-[12px] text-brand-muted mt-4">No variants available.</p>
    );
  }

  if (!isAuthenticated || !product.prices_visible) {
    return (
      <div className="mt-6 border border-brand-line bg-brand-white p-5">
        <p className="text-sm text-brand-muted">Sign in to view wholesale prices and order variants.</p>
        <Link
          href="/login"
          className="mt-3 inline-flex min-h-10 items-center justify-center bg-brand-navy px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-brand-blue"
        >
          Login to Buy
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-muted border-b border-brand-ink pb-2 mb-0">
        Variants · {children.length} SKUs
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              <th className={TH}>Variant</th>
              <th className={TH}>SKU</th>
              <th className={`${TH} text-right`}>Price</th>
              <th className={`${TH} text-right`}>Stock</th>
              <th className={`${TH} text-right`}>Qty</th>
              <th className={`${TH} text-right`}>Line</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => {
              const qty = qtys[child.id] ?? 0;
              const price = child.current_price ?? child.sale_price;
              return (
                <tr key={child.id} className="hover:bg-brand-bg-alt/50 transition-colors">
                  <td className={TD}>
                    <div className="flex items-center gap-2">
                      {(child.image ?? product.image) ? (
                        <div className="w-8 h-8 relative shrink-0 border border-brand-line overflow-hidden bg-brand-bg-alt">
                          <Image
                            src={(child.image ?? product.image)!}
                            alt={child.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : null}
                      <span className="text-brand-ink">{child.name}</span>
                    </div>
                  </td>
                  <td className={`${TD} font-mono text-brand-muted`}>{child.sku}</td>
                  <td className={`${TD} text-right`}>
                    <PriceGate pricesVisible={child.prices_visible}>
                      {child.on_sale && child.sale_price !== null ? (
                        <span className="text-[#B83434] font-semibold">${child.sale_price.toFixed(2)}</span>
                      ) : price !== null ? (
                        <span>${price.toFixed(2)}</span>
                      ) : (
                        <span className="text-brand-muted">—</span>
                      )}
                    </PriceGate>
                  </td>
                  <td className={`${TD} text-right`}>
                    <StockDot inStock={child.in_stock} stockQuantity={child.stock_quantity} />
                  </td>
                  <td className={`${TD} text-right`}>
                    <QtyStepper
                      value={qty}
                      onChange={(n) => setQty(child.id, n)}
                      disabled={!child.in_stock || price === null}
                      max={child.stock_quantity}
                    />
                  </td>
                  <td className={`${TD} text-right font-mono text-brand-ink`}>
                    {qty > 0 && price !== null ? `$${(qty * price).toFixed(2)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-brand-muted">
          {selectedCount} variant{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={handleAddAll}
          disabled={selectedCount === 0}
          className="bg-brand-navy text-white font-mono text-[11px] tracking-[0.08em] uppercase px-6 py-2 hover:bg-brand-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to cart ({selectedCount})
        </button>
      </div>

      <CartBar />
    </div>
  );
}

// ─── Spec Strip ──────────────────────────────────────────────────────────────

function SpecStrip({ attributes }: { attributes?: Record<string, string> | null }) {
  if (!attributes || Object.keys(attributes).length === 0) return null;

  const entries = Object.entries(attributes);

  return (
    <div className="border-t border-brand-line mt-10">
      <div className="px-8 py-4 border-b border-brand-line">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-brand-muted">
          Product specifications
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-brand-line">
        {entries.map(([key, value]) => (
          <div key={key} className="px-8 py-5 border-b border-brand-line">
            <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-brand-muted mb-1">
              {key}
            </div>
            <div className="font-mono text-[13px] text-brand-ink">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

// ─── Main Product Detail ──────────────────────────────────────────────────────

function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: wishlistItems = [] } = useWishlistItems();
  const { toggle: toggleWishlist, isPending: wishlistLoading } = useToggleWishlist();
  const { isAuthenticated } = useAuth();
  const wishlisted = wishlistItems.some((item) => item.product_id === Number(id));

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-brand-bg-alt border-b border-brand-line" />
        <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-2">
          <div className="aspect-[4/3] bg-brand-bg-alt" />
          <div className="space-y-4">
            <div className="h-4 bg-brand-bg-alt rounded-none w-1/3" />
            <div className="h-8 bg-brand-bg-alt rounded-none w-3/4" />
            <div className="h-4 bg-brand-bg-alt rounded-none w-1/4" />
            <div className="h-6 bg-brand-bg-alt rounded-none w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-4">
        <p className="font-mono text-[12px] text-brand-muted">Product not found.</p>
        <Link href="/shop" className="font-mono text-[11px] text-brand-blue hover:text-brand-blue-deep">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const images = product.images ?? (product.image ? [{ url: product.image, is_primary: true }] : []);
  const description = product.short_description || product.description;

  const crumbs = [
    { label: "Shop", href: "/shop" },
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.id}` }] : []),
    ...(product.brand ? [{ label: product.brand.name, href: `/brand/${product.brand.id}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="bg-brand-bg min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="px-8 py-3.5 border-b border-brand-line bg-brand-white">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 gap-0 border-b border-brand-line lg:grid-cols-2">
        {/* Left: images */}
        <div className="border-b border-brand-line bg-brand-white p-4 sm:p-8 lg:border-b-0 lg:border-r">
          <ImageGallery images={images} name={product.name} />
        </div>

        {/* Right: summary */}
        <div className="bg-brand-white p-4 sm:p-8">
          {/* Brand */}
          {product.brand && (
            <Link
              href={`/brand/${product.brand.id}`}
              className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-brand-blue hover:text-brand-blue-deep transition-colors"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="font-serif text-[38px] leading-[1.05] font-normal tracking-tight mt-1 text-brand-ink">
            {product.name}
          </h1>

          {/* SKU */}
          <div className="font-mono text-[10.5px] tracking-[0.08em] text-brand-muted uppercase mt-2">
            SKU · {product.sku}
          </div>

          {/* Sale badge */}
          {product.on_sale && (
            <span className="inline-block mt-3 bg-[#B83434] text-white font-mono text-[9px] tracking-[0.06em] px-1.5 py-0.5">
              SALE
            </span>
          )}

          {/* Price */}
          <div className="mt-3">
            <PriceBlock product={product} />
          </div>

          {/* Stock */}
          <div className="mt-3">
            <StockDot inStock={product.in_stock} stockQuantity={product.stock_quantity} />
          </div>

          {/* Description */}
          {description && (
            <p className="mt-4 text-[13px] text-brand-muted leading-relaxed border-t border-brand-line pt-4">
              {description.length > 400 ? description.slice(0, 400) + "…" : description}
            </p>
          )}

          {/* Simple product: qty + add to cart */}
          {product.type !== "grouped" && <SimpleAddToCart product={product} />}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-4 pt-4 border-t border-brand-line">
            {isAuthenticated ? (
              <button
                onClick={() => toggleWishlist(product.id)}
                disabled={wishlistLoading}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.06em] uppercase transition-colors disabled:opacity-50 ${
                  wishlisted ? "text-[#B83434]" : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase text-brand-blue">
                <Heart size={13} /> Sign in to wishlist
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grouped variant table */}
      {product.type === "grouped" && (
        <div className="px-4 py-6 sm:px-8">
          <GroupedVariantTable product={product} />
        </div>
      )}

      {/* Spec strip */}
      <SpecStrip attributes={product.attributes} />

      {/* CartBar for simple products */}
      {product.type !== "grouped" && product.prices_visible && <CartBar />}
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <ProductDetail id={id} />
    </Suspense>
  );
}
