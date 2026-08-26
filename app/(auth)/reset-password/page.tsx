"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Logo } from "@/components/layout/Logo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) return setError("This reset link is missing its token.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email: email.trim(),
        password,
        password_confirmation: confirmation,
      });
      setSuccess(true);
    } catch (reason: unknown) {
      const message =
        (reason as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to reset the password. Please request a new link.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md border border-brand-line bg-brand-white p-8 shadow-lg sm:p-10">
      <Logo />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-orange">Account recovery</p>
      <h1 className="mt-2 text-2xl font-semibold text-brand-ink">Choose a new password</h1>

      {success ? (
        <div className="mt-6">
          <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">
            <div className="flex items-center gap-2 font-semibold"><CheckCircle size={17} /> Password updated</div>
          </div>
          <Link href="/login" className="mt-5 inline-flex h-11 items-center bg-brand-navy px-5 text-sm font-bold text-white no-underline hover:bg-brand-blue">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-brand-ink">Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-1.5 h-11 w-full border border-brand-line px-3 text-sm outline-none focus:border-brand-blue" />
          </label>
          <label className="block text-xs font-semibold text-brand-ink">New password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="mt-1.5 h-11 w-full border border-brand-line px-3 text-sm outline-none focus:border-brand-blue" />
          </label>
          <label className="block text-xs font-semibold text-brand-ink">Confirm new password
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} autoComplete="new-password" className="mt-1.5 h-11 w-full border border-brand-line px-3 text-sm outline-none focus:border-brand-blue" />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={loading || !token} className="flex h-11 w-full items-center justify-center gap-2 bg-brand-navy text-sm font-bold text-white hover:bg-brand-blue disabled:opacity-60">
            {loading && <Loader2 size={15} className="animate-spin" />}
            Reset password
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="text-sm text-brand-muted">Loading…</div>}><ResetPasswordForm /></Suspense>;
}
