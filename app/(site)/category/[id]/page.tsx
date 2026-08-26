"use client";

import { Suspense } from "react";
import { use } from "react";
import { BrowseLayout } from "@/components/browse/BrowseLayout";
import { useCategory } from "@/hooks/useCategories";

interface Props {
  params: Promise<{ id: string }>;
}

function CategoryBrowse({ id }: { id: string }) {
  const { data: category, isLoading, isError, refetch } = useCategory(id);
  const numericId = Number(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 font-mono text-[11px] text-brand-muted tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  if (!Number.isInteger(numericId) || numericId <= 0 || isError || !category) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4 text-center">
        <p className="font-mono text-[12px] text-brand-muted">Category not found.</p>
        {isError && <button type="button" onClick={() => refetch()} className="bg-brand-navy px-5 py-2 text-xs font-bold text-white">Try again</button>}
      </div>
    );
  }

  return (
    <BrowseLayout
      categoryId={numericId}
      categoryName={category?.name}
      subCategories={category?.children ?? []}
      crumbs={[
        { label: "Shop", href: "/shop" },
        { label: category?.name ?? "Category" },
      ]}
      title={category?.name ?? "Category"}
    />
  );
}

export default function CategoryPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense>
      <CategoryBrowse id={id} />
    </Suspense>
  );
}
