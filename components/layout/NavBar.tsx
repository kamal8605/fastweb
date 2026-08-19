"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCategories } from "@/hooks/useCategories";

const NAV_LINKS = [
  { label: "Apparel / Merch", href: "/shop" },
  { label: "Hookah", href: "/shop" },
  { label: "Glass / Accessories", href: "/shop" },
  { label: "Cigar / Lighter Essentials", href: "/shop" },
  { label: "Smoking Essentials", href: "/shop" },
  { label: "Everyday Essentials", href: "/shop" },
  { label: "Detox / Supplements / Health", href: "/shop" },
  { label: "Shop By Brand", href: "/brands" },
  { label: "Clearance", href: "/sale" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const categoryLinks =
    categories && categories.length > 0
      ? categories.slice(0, 8).map((category) => ({
          label: category.name,
          href: `/category/${category.id}`,
        }))
      : NAV_LINKS;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  function isActive(href: string) {
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/category") || pathname.startsWith("/product");
    if (href === "/brands") return pathname === "/brands" || pathname.startsWith("/brand");
    return pathname.startsWith(href);
  }

  return (
    <nav className="border-b border-brand-line bg-brand-navy">
      <div className="flex items-center gap-5 overflow-x-auto px-4 py-4 lg:justify-center lg:px-8">
        {categoryLinks.map(({ label, href }) => (
          <Link
            key={`${label}-${href}`}
            href={href}
            className={`shrink-0 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.02em] no-underline transition-colors ${
              isActive(href)
                ? "text-white"
                : "text-[#C8D2E5] hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-[#1E3358] bg-brand-bg px-4 py-3 md:flex-row md:items-center md:justify-center md:px-8">
        <Link
          href="/shop"
          className="order-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink no-underline hover:text-brand-blue md:order-1"
        >
          Shop All
        </Link>

        <form onSubmit={handleSearch} className="relative md:order-2 md:ml-auto md:w-[360px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 12,400+ products"
            className="h-[38px] w-full rounded-[var(--brand-radius)] border border-brand-line bg-brand-white pl-8 pr-3 text-[13px] text-brand-muted placeholder:text-brand-muted focus:border-brand-blue focus:outline-none"
          />
        </form>

        <Link
          href="/cart"
          className="order-3 flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-brand-ink no-underline transition-colors hover:text-brand-blue md:ml-2"
        >
          {itemCount > 0 && (
            <span className="rounded-[var(--brand-radius)] bg-brand-orange px-1.5 py-0.5 font-mono text-[10px] leading-none text-brand-white">
              {itemCount}
            </span>
          )}
          <ShoppingCart size={16} />
          Cart
        </Link>
      </div>
    </nav>
  );
}
