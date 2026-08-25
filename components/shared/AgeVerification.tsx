"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "fastweb_age_verified";

export function AgeVerification() {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const storedVerified = useSyncExternalStore(
    () => () => undefined,
    () => localStorage.getItem(STORAGE_KEY) === "yes",
    () => false
  );
  const [acceptedThisVisit, setAcceptedThisVisit] = useState(false);
  const [denied, setDenied] = useState(false);
  const verified = storedVerified || acceptedThisVisit;

  useEffect(() => {
    if (!hydrated || verified) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [hydrated, verified]);

  if (!hydrated || verified) return null;

  function approve() {
    localStorage.setItem(STORAGE_KEY, "yes");
    setAcceptedThisVisit(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/95 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="w-full max-w-lg border border-white/20 bg-white p-8 text-center shadow-2xl sm:p-12">
        <ShieldCheck size={48} className="mx-auto text-brand-blue" aria-hidden />
        <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-orange">Wholesale access</p>
        <h2 id="age-title" className="mt-2 text-3xl font-black uppercase text-brand-navy">{denied ? "Access denied" : "Age verification"}</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-brand-muted">
          {denied ? "Sorry, the content of this wholesale store cannot be shown to a younger audience." : "You must be 21 years or older to enter this wholesale store."}
        </p>
        {!denied ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={approve} className="bg-brand-blue px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-brand-blue-deep">Yes, I am 21+</button>
            <button type="button" onClick={() => setDenied(true)} className="border border-brand-line bg-brand-bg-alt px-5 py-3 text-sm font-black uppercase tracking-wide text-brand-muted hover:border-brand-navy">No, I am not 21</button>
          </div>
        ) : (
          <button type="button" onClick={() => setDenied(false)} className="mt-8 border border-brand-line bg-brand-bg-alt px-6 py-3 text-sm font-black uppercase tracking-wide text-brand-muted">Go back</button>
        )}
      </div>
    </div>
  );
}
