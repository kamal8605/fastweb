"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Logo } from "@/components/layout/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (reason: unknown) {
      const message =
        (reason as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to send the reset link. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md border border-brand-line bg-brand-white p-8 shadow-lg sm:p-10">
      <Logo />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-orange">Account recovery</p>
      <h1 className="mt-2 text-2xl font-semibold text-brand-ink">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-brand-muted">
        Enter your account email and we&apos;ll send a reset link if the address is registered.
      </p>

      {sent ? (
        <div className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">
          <div className="flex items-center gap-2 font-semibold"><CheckCircle size={17} /> Check your email</div>
          <p className="mt-1 leading-5">If that address is registered, a password reset link has been sent.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-xs font-semibold text-brand-ink">Email address</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="h-11 w-full border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 bg-brand-navy text-sm font-bold text-white hover:bg-brand-blue disabled:opacity-60">
            {loading && <Loader2 size={15} className="animate-spin" />}
            Send reset link
          </button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-brand-blue hover:text-brand-blue-deep">← Back to login</Link>
    </div>
  );
}
