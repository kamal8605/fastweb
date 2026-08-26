"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { StockDot } from "./StockDot";
import { PriceGate } from "./PriceGate";
import { type Product } from "@/hooks/useProducts";

export type ProductCardData = Pick<
  Product,
  "id" | "name" | "sku" | "brand" | "current_price" |
  "sale_price" | "regular_price" | "on_sale" | "in_stock" | "stock_quantity" |
  "prices_visible" | "image"
>;

interface ProductCardProps {
  product: ProductCardData;
  onWishlistToggle?: (id: number) => void;
  wishlisted?: boolean;
}

function ImagePlaceholder() {
  return (
    <div
      className="w-full h-full"
      style={{
        background:
          "repeating-linear-gradient(135deg, #E5DFD0 0 14px, #D9D3C5 14px 28px)",
      }}
    />
  );
}

export function ProductCard({ product, onWishlistToggle, wishlisted = false }: ProductCardProps) {
  return (
    <div className="relative bg-brand-white border border-brand-line rounded-[var(--brand-radius)] overflow-hidden group hover:border-brand-blue hover:shadow-md transition-[border-color,box-shadow]">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-brand-bg-alt">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {product.on_sale && (
          <span className="absolute top-2 left-2 bg-[#B83434] text-white font-mono text-[9px] tracking-[0.06em] px-1.5 py-0.5">
            SALE
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="p-3">
        {product.brand?.name && (
          <Link
            href={product.brand.id ? `/brand/${product.brand.id}` : "/brands"}
            className="font-mono text-[10px] tracking-[0.06em] text-brand-blue uppercase hover:text-brand-blue-deep transition-colors"
          >
            {product.brand.name}
          </Link>
        )}
        <Link href={`/product/${product.id}`} className="block mt-0.5">
          <h3 className="text-[13px] font-bold uppercase text-brand-blue leading-snug line-clamp-2 hover:text-brand-blue-deep transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceGate pricesVisible={product.prices_visible}>
            {product.on_sale && product.sale_price !== null ? (
              <span className="flex items-baseline gap-1.5 font-mono text-[13px]">
                <span className="text-[#B83434] font-semibold">${product.sale_price.toFixed(2)}</span>
                <span className="text-brand-muted line-through text-[11px]">${product.regular_price?.toFixed(2)}</span>
              </span>
            ) : (
              <span className="font-mono text-[13px] font-semibold text-brand-navy">
                {product.current_price !== null ? `$${product.current_price.toFixed(2)}` : "—"}
              </span>
            )}
          </PriceGate>

          <StockDot inStock={product.in_stock} stockQuantity={product.stock_quantity} />
        </div>
      </div>

      {/* Wishlist button */}
      {onWishlistToggle && (
        <button
          onClick={() => onWishlistToggle(product.id)}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-none flex items-center justify-center hover:bg-white transition-colors"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            className={wishlisted ? "text-[#B83434] fill-[#B83434]" : "text-brand-muted"}
          />
        </button>
      )}
    </div>
  );
}
