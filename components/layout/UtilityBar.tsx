"use client";

import Link from "next/link";
import { Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAccountMenu } from "./UserAccountMenu";
import { Logo } from "./Logo";

export function UtilityBar() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-brand-white border-b border-brand-line">
      <div className="px-6 lg:px-10 py-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between">
          <Logo size={42} />
          <div className="lg:hidden">
            {isAuthenticated ? (
              <UserAccountMenu />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[var(--brand-radius)] bg-brand-navy px-4 py-2 text-sm font-semibold text-white no-underline"
              >
                <UserRound size={15} />
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center gap-8 text-[14px] text-brand-muted">
          <span className="inline-flex items-center gap-2">
            <Phone size={16} className="text-brand-ink" />
            +1 (914) 539-5580
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail size={17} className="text-brand-ink" />
            info@forgesmokedistro.com
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <UserAccountMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[var(--brand-radius)] bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-blue"
              >
                <UserRound size={15} />
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-[var(--brand-radius)] border border-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-blue no-underline transition-colors hover:bg-brand-blue hover:text-white"
              >
                Register for Wholesale
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
