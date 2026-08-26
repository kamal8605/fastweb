"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRequireApproved } from "@/components/auth/withAuth";
import { useOrders, type OrderStatus, type PaymentStatus } from "@/hooks/useOrders";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-[#E5DFD0] text-[#6B6045]",
  processing: "bg-[#DBEAFE] text-[#1D4ED8]",
  shipped: "bg-[#FEE9D6] text-brand-orange",
  delivered: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#B83434]",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  due: "text-brand-muted",
  paid: "text-[#065F46]",
  refunded: "text-[#1D4ED8]",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-[0.06em] uppercase px-2 py-0.5 rounded-[var(--brand-radius)] ${STATUS_STYLES[status] ?? "bg-brand-bg-alt text-brand-muted"}`}
    >
      {status}
    </span>
  );
}

function OrdersTable() {
  const { isLoading, isAuthenticated, isApproved } = useRequireApproved();
  const [page, setPage] = useState(1);
  const { data, isLoading: ordersLoading, isError, refetch } = useOrders(page);

  if (isLoading || !isAuthenticated || !isApproved || ordersLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-brand-white">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-brand-line">
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-brand-bg-alt rounded-none animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-brand-line border-t-2 border-t-red-600 bg-brand-white py-12 text-center">
        <p className="font-mono text-[12px] text-brand-muted">Orders could not be loaded.</p>
        <button type="button" onClick={() => refetch()} className="mt-4 bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-brand-blue">Try again</button>
      </div>
    );
  }

  const orders = data?.data ?? [];
  const meta = data?.meta;

  if (orders.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 border border-brand-line border-t-2 border-t-brand-orange bg-brand-white">
        <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand-muted">No orders yet.</p>
        <Link href="/shop" className="bg-brand-navy px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-white transition-colors hover:bg-brand-blue">
          Browse products
        </Link>
      </div>
    );
  }

  const TH = "px-4 py-2.5 font-mono text-[10px] tracking-[0.08em] uppercase text-brand-muted border-b border-brand-ink text-left bg-brand-bg-alt";
  const TD = "px-4 py-3 text-[12.5px] text-brand-ink border-b border-brand-line align-middle";

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-brand-white">
          <thead>
            <tr>
              <th className={TH}>Invoice #</th>
              <th className={TH}>Date</th>
              <th className={TH}>Status</th>
              <th className={TH}>Payment</th>
              <th className={`${TH} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-brand-bg transition-colors">
                <td className={TD}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-mono text-[12px] text-brand-blue hover:text-brand-blue-deep transition-colors"
                  >
                    {order.invoice_no}
                  </Link>
                </td>
                <td className={`${TD} font-mono text-[11.5px] text-brand-muted`}>
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className={TD}>
                  <StatusBadge status={order.status} />
                </td>
                <td className={TD}>
                  <span
                    className={`font-mono text-[11.5px] capitalize ${order.payment_status ? PAYMENT_STYLES[order.payment_status] : "text-brand-muted"}`}
                  >
                    {order.payment_status ?? "—"}
                  </span>
                </td>
                <td className={`${TD} text-right font-mono font-semibold`}>
                  ${order.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <div className="bg-brand-bg min-h-screen pb-20">
      <PageHeader
        crumbs={[{ label: "Orders" }]}
        title="Your orders"
      />
      <div className="px-8 py-6 max-w-5xl mx-auto">
        <Suspense>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
}
