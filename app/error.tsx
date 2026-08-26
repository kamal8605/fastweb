"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-brand-bg px-5 py-16">
      <div className="w-full max-w-xl border border-brand-line bg-brand-white p-8 text-center shadow-sm">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-brand-orange">
          Unexpected error
        </p>
        <h1 className="mt-3 text-2xl font-black uppercase text-brand-ink">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          The page could not be displayed. Try loading it again or return to the home page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="min-h-11 bg-brand-navy px-6 text-sm font-bold text-white transition-colors hover:bg-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-brand-line bg-white px-6 text-sm font-bold text-brand-ink no-underline transition-colors hover:border-brand-blue hover:text-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
