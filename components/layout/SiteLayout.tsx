import { type ReactNode } from "react";
import { UtilityBar } from "./UtilityBar";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { AgeVerification } from "@/components/shared/AgeVerification";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip">
      <AgeVerification />
      <UtilityBar />
      <NavBar />
      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}
