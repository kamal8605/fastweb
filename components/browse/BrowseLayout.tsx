"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal, LayoutList, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductTable } from "@/components/shared/ProductTable";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { Pagination } from "@/components/shared/Pagination";
import { CartBar } from "@/components/shared/CartBar";
import { useProducts, type ProductsParams } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useBrands } from "@/hooks/useBrands";
import { useCategories, type Category } from "@/hooks/useCategories";
import type { BreadcrumbItem } from "@/components/shared/Breadcrumb";

const SORT_OPTIONS = [
  { value: "name_asc", label: "Bestselling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
] as const;

const VALID_SORTS = new Set<ProductsParams["sort"]>(SORT_OPTIONS.map((option) => option.value));

interface BrowseLayoutProps {
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  /** Sub-categories passed from category pages (rendered as pills) */
  subCategories?: Category[];
  crumbs?: BreadcrumbItem[];
  title?: string;
  defaultSort?: ProductsParams["sort"];
  saleOnly?: boolean;
  showDiscountPct?: boolean;
}

export function BrowseLayout({
  categoryId,
  categoryName,
  brandId,
  subCategories = [],
  crumbs,
  title,
  defaultSort = "name_asc",
  saleOnly = false,
  showDiscountPct = false,
}: BrowseLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven state
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedSort = searchParams.get("sort") as ProductsParams["sort"];
  const sort = requestedSort && VALID_SORTS.has(requestedSort) ? requestedSort : defaultSort;
  const search = searchParams.get("search")?.trim() || undefined;
  const inStock = searchParams.get("in_stock") === "true";
  const activeBrandIds = searchParams.getAll("brand_id").map(Number).filter(Boolean);
  const subCatId = searchParams.get("sub_cat") ? Number(searchParams.get("sub_cat")) : undefined;
  // Sidebar-driven category selection (only used when categoryId prop is not set)
  const catId = searchParams.get("cat") ? Number(searchParams.get("cat")) : undefined;

  // Local state
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const [brandSearch, setBrandSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const storedView = localStorage.getItem("fastweb_view");
      if (storedView === "list" || storedView === "grid") setView(storedView);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function switchView(v: "list" | "grid") {
    setView(v);
    setQtyMap({});
    try {
      localStorage.setItem("fastweb_view", v);
    } catch {
      // The selected view still works when storage is unavailable.
    }
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === null) p.delete(key);
    else p.set(key, value);
    if (key !== "page") p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  function toggleBrand(id: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("brand_id");
    p.delete("page");
    const next = activeBrandIds.includes(id) ? [] : [id];
    next.forEach((b) => p.append("brand_id", String(b)));
    router.push(`${pathname}?${p.toString()}`);
  }

  function toggleCategory(id: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("sub_cat");
    p.delete("page");
    if (catId === id) {
      p.delete("cat");
    } else {
      p.set("cat", String(id));
    }
    router.push(`${pathname}?${p.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: allBrands } = useBrands();
  const { data: allCategories } = useCategories();

  const filteredBrands = brandSearch.trim()
    ? (allBrands ?? []).filter((b) =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
      )
    : (allBrands ?? []);

  // Sub-categories for the sidebar filter:
  // - On a fixed category page (categoryId prop): children come from subCategories prop
  // - On generic pages: children come from whichever top-level cat is selected via URL
  const activeSidebarCat = !categoryId
    ? (allCategories ?? []).find((c) => c.id === catId)
    : null;
  const sidebarSubCats: Category[] = categoryId
    ? subCategories
    : (activeSidebarCat?.children ?? []);

  const params: ProductsParams = {
    category_id: catId ?? categoryId,
    sub_category_id: subCatId,
    brand_id: activeBrandIds.length >= 1 ? activeBrandIds[0] : undefined,
    in_stock: inStock || undefined,
    search,
    sort,
    page,
    per_page: 48,
  };
  if (brandId) params.brand_id = brandId;

  const { data, isLoading, isError, refetch } = useProducts(params);

  const products = useMemo(() => {
    const nextProducts = data?.data ?? [];
    return saleOnly ? nextProducts.filter((p) => p.on_sale) : nextProducts;
  }, [data?.data, saleOnly]);

  const meta = data?.meta;
  const activeFilterCount =
    (inStock ? 1 : 0) +
    activeBrandIds.length +
    (!categoryId && catId ? 1 : 0) +
    (subCatId ? 1 : 0);

  // ── Cart ───────────────────────────────────────────────────────────────────

  const handleAddToCart = useCallback(() => {
    products.forEach((p) => {
      const qty = qtyMap[p.id];
      const price = p.current_price ?? p.sale_price;
      if (qty && qty > 0 && p.in_stock && p.prices_visible && price !== null) {
        addItem(
          {
            product_id: p.id,
            name: p.name,
            sku: p.sku,
            image: p.image,
            price,
            parent_id: p.parent_id,
            parent_name: null,
          },
          qty
        );
      }
    });
    setQtyMap({});
  }, [products, qtyMap, addItem, setQtyMap]);

  const selectedCount = Object.values(qtyMap).filter((q) => q > 0).length;

  const pageTitle = title ?? categoryName ?? (brandId ? "Brand" : "All Products");
  const metaStr = meta
    ? `${meta.total.toLocaleString()} SKUs${meta.from && meta.to ? ` · ${meta.from}–${meta.to}` : ""}`
    : undefined;

  // Chip label helpers
  const activeCatName = !categoryId
    ? (allCategories ?? []).find((c) => c.id === catId)?.name
    : undefined;
  const activeSubCatName = sidebarSubCats.find((sc) => sc.id === subCatId)?.name;

  return (
    <div className="bg-brand-bg min-h-screen pb-20">
      <PageHeader
        crumbs={
          crumbs ?? [
            { label: "Shop", href: "/shop" },
            ...(categoryName ? [{ label: categoryName }] : []),
          ]
        }
        title={pageTitle}
        meta={metaStr}
      />

      {/* Sub-category pills — category pages only */}
      {subCategories.length > 0 && (
        <div className="px-8 py-3 border-b border-brand-line bg-brand-white flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setParam("sub_cat", null)}
            className={`px-3 py-1 text-[11.5px] border rounded-[var(--brand-radius)] transition-colors ${
              !subCatId
                ? "bg-brand-ink text-white border-brand-ink"
                : "bg-brand-white text-brand-ink border-brand-line hover:border-brand-ink"
            }`}
          >
            All
          </button>
          {subCategories.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setParam("sub_cat", String(sc.id))}
              className={`px-3 py-1 text-[11.5px] border rounded-[var(--brand-radius)] transition-colors inline-flex items-center gap-1.5 ${
                subCatId === sc.id
                  ? "bg-brand-ink text-white border-brand-ink"
                  : "bg-brand-white text-brand-ink border-brand-line hover:border-brand-ink"
              }`}
            >
              {sc.name}
              {sc.products_count !== undefined && (
                <span className="font-mono text-[9.5px] opacity-60">{sc.products_count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 pt-4 sm:px-8 lg:flex-row">
        {/* ── Filters sidebar ──────────────────────────────── */}
        <aside className="w-full shrink-0 text-[12.5px] lg:w-[220px]">
          <div className="flex items-center justify-between pb-2 border-b border-brand-ink mb-3">
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase flex items-center gap-1.5">
              <SlidersHorizontal size={11} />
              FILTERS{activeFilterCount > 0 && ` · ${activeFilterCount}`}
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-brand-orange hover:text-brand-ink transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* In stock */}
          <div className="mb-4 pb-4 border-b border-brand-line">
            <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-ink mb-2">
              Stock
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setParam("in_stock", e.target.checked ? "true" : null)}
                className="w-3 h-3 accent-brand-blue"
              />
              <span>In stock now</span>
            </label>
          </div>

          {/* Brand filter */}
          {!brandId && (
            <div className="mb-4 pb-4 border-b border-brand-line">
              <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-ink mb-2 flex justify-between">
                <span>Brand</span>
                {activeBrandIds.length > 0 && (
                  <span className="text-brand-muted">{activeBrandIds.length} selected</span>
                )}
              </div>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands…"
                className="w-full h-7 px-2 mb-2 border border-brand-line text-[11.5px] bg-brand-white focus:outline-none focus:border-brand-blue rounded-[var(--brand-radius)] placeholder:text-brand-muted"
              />
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredBrands.length === 0 ? (
                  <p className="text-[11.5px] text-brand-muted">No brands found</p>
                ) : (
                  filteredBrands.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeBrandIds.includes(b.id)}
                        onChange={() => toggleBrand(b.id)}
                        className="w-3 h-3 accent-brand-blue shrink-0"
                      />
                      <span className="text-[12px] text-brand-ink truncate">{b.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Category filter — hidden on fixed category pages */}
          {!categoryId && (
            <div className="mb-4 pb-4 border-b border-brand-line">
              <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-ink mb-2">
                Category
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(allCategories ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catId === cat.id}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-3 h-3 accent-brand-blue shrink-0"
                    />
                    <span className="text-[12px] text-brand-ink truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sub-category filter — shown when parent has children */}
          {sidebarSubCats.length > 0 && (
            <div className="mb-4 pb-4 border-b border-brand-line">
              <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-brand-ink mb-2">
                Sub-category
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sidebarSubCats.map((sc) => (
                  <label key={sc.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subCatId === sc.id}
                      onChange={() =>
                        setParam("sub_cat", subCatId === sc.id ? null : String(sc.id))
                      }
                      className="w-3 h-3 accent-brand-blue shrink-0"
                    />
                    <span className="text-[12px] text-brand-ink truncate">{sc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* ── Main: toolbar + table + pagination ─────────── */}
        <main className="flex-1 min-w-0">
          <div className="mb-0 flex flex-col items-start justify-between gap-3 border-b border-brand-ink py-2.5 md:flex-row md:items-center">
            <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.04em] text-brand-muted uppercase flex-wrap">
              {meta && (
                <span>
                  <span className="text-brand-ink">{meta.total.toLocaleString()} SKUs</span>
                  {meta.from && meta.to && ` · ${meta.from}–${meta.to}`}
                </span>
              )}
              {inStock && (
                <button
                  onClick={() => setParam("in_stock", null)}
                  className="flex items-center gap-1 px-2 py-0.5 border border-brand-line bg-brand-white text-brand-ink text-[10.5px] normal-case tracking-normal rounded-[var(--brand-radius)] hover:border-brand-ink"
                >
                  In stock <X size={10} />
                </button>
              )}
              {activeBrandIds.map((bid) => {
                const brand = (allBrands ?? []).find((b) => b.id === bid);
                return (
                  <button
                    key={bid}
                    onClick={() => toggleBrand(bid)}
                    className="flex items-center gap-1 px-2 py-0.5 border border-brand-line bg-brand-white text-brand-ink text-[10.5px] normal-case tracking-normal rounded-[var(--brand-radius)] hover:border-brand-ink"
                  >
                    {brand?.name ?? bid} <X size={10} />
                  </button>
                );
              })}
              {!categoryId && catId && (
                <button
                  onClick={() => toggleCategory(catId)}
                  className="flex items-center gap-1 px-2 py-0.5 border border-brand-line bg-brand-white text-brand-ink text-[10.5px] normal-case tracking-normal rounded-[var(--brand-radius)] hover:border-brand-ink"
                >
                  {activeCatName ?? catId} <X size={10} />
                </button>
              )}
              {subCatId && (
                <button
                  onClick={() => setParam("sub_cat", null)}
                  className="flex items-center gap-1 px-2 py-0.5 border border-brand-line bg-brand-white text-brand-ink text-[10.5px] normal-case tracking-normal rounded-[var(--brand-radius)] hover:border-brand-ink"
                >
                  {activeSubCatName ?? subCatId} <X size={10} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-brand-line rounded-[var(--brand-radius)] overflow-hidden">
                <button
                  onClick={() => switchView("list")}
                  title="List view"
                  className={`px-2 py-1.5 transition-colors ${
                    view === "list"
                      ? "bg-brand-ink text-white"
                      : "bg-brand-white text-brand-muted hover:text-brand-ink"
                  }`}
                >
                  <LayoutList size={13} />
                </button>
                <button
                  onClick={() => switchView("grid")}
                  title="Grid view"
                  className={`px-2 py-1.5 transition-colors border-l border-brand-line ${
                    view === "grid"
                      ? "bg-brand-ink text-white"
                      : "bg-brand-white text-brand-muted hover:text-brand-ink"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
              </div>

              <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-brand-muted">
                SORT
              </span>
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="h-7 px-2 border border-brand-line text-[11.5px] bg-brand-white rounded-[var(--brand-radius)] focus:outline-none focus:border-brand-blue"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isError ? (
            <div className="mt-3 border border-brand-line border-t-2 border-t-red-600 bg-brand-white px-5 py-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-brand-muted">Products could not be loaded.</p>
              <button type="button" onClick={() => refetch()} className="mt-4 bg-brand-navy px-5 py-2.5 text-[11px] font-bold uppercase text-white hover:bg-brand-blue">Try again</button>
            </div>
          ) : view === "grid" ? (
            <ProductGrid
              products={products}
              showBrand={!brandId}
              showDiscountPct={showDiscountPct}
              loading={isLoading}
              onQtyChange={setQtyMap}
            />
          ) : (
            <ProductTable
              products={products}
              showBrand={!brandId}
              showDiscountPct={showDiscountPct}
              loading={isLoading}
              onQtyChange={setQtyMap}
            />
          )}

          {!isError && meta && meta.last_page > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={(p) => setParam("page", String(p))}
              />
            </div>
          )}
        </main>
      </div>

      <CartBar
        onAddToCart={selectedCount > 0 ? handleAddToCart : undefined}
        selectedCount={selectedCount}
      />
    </div>
  );
}
