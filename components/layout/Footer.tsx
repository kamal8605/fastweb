import { Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Find It Fast",
    links: [
      { label: "Cigar Accessories", href: "/shop?search=cigar%20accessories" },
      { label: "Cleaning Products", href: "/shop?search=cleaning" },
      { label: "Detox Supplements", href: "/shop?search=detox" },
      { label: "Category Directory", href: "/shop" },
    ],
  },
  {
    heading: "Customer Support",
    links: [
      { label: "My Account", href: "/account/profile" },
      { label: "Track your Order", href: "/orders" },
      { label: "Category Directory", href: "/shop" },
      { label: "Contact Us", href: "mailto:support@forgesmokedistro.com" },
    ],
  },
];

const BUSINESS_HOURS = [
  ["Monday", "9:00 AM - 7:00 PM"],
  ["Tuesday", "9:00 AM - 7:00 PM"],
  ["Wednesday", "9:00 AM - 7:00 PM"],
  ["Thursday", "9:00 AM - 7:00 PM"],
  ["Friday", "9:00 AM - 7:00 PM"],
  ["Saturday", "10:00 AM - 5:00 PM"],
];

const headingClass =
  "mb-5 text-[19px] font-bold leading-tight tracking-[-0.02em] text-brand-navy";
const linkClass =
  "text-brand-muted no-underline transition-colors hover:text-brand-orange focus-visible:text-brand-orange";

export function Footer() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Forge & Co.";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-white text-brand-ink">
      <div className="border-b border-white/10 bg-brand-navy px-6 py-4 text-white lg:px-10">
        <div className="mx-auto flex max-w-[1768px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 text-[20px] font-bold tracking-[-0.02em]">
            <Send size={26} className="shrink-0 text-brand-orange" />
            Sign up to Newsletter
          </div>
          <form className="flex h-12 w-full max-w-[620px] overflow-hidden border-2 border-brand-orange bg-brand-white">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-full min-w-0 flex-1 border-0 bg-brand-white px-4 text-[14px] text-brand-ink outline-none placeholder:text-brand-muted sm:px-5"
            />
            <button
              type="submit"
              className="h-full shrink-0 border-0 border-l-2 border-brand-orange bg-brand-orange px-5 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-brand-blue sm:px-9"
            >
              SignUp
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1760px] gap-x-10 gap-y-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-[210px_1.35fr_0.9fr_1fr_1.25fr] lg:px-10 lg:py-11 xl:grid-cols-[210px_340px_230px_250px_330px] xl:justify-between">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo size={58} />
          <p className="mt-5 max-w-[230px] text-[15px] leading-7 text-brand-muted">
            A wholesale marketplace built for independent retailers. 600+ vetted brands,
            one invoice, sixty-day terms.
          </p>
        </div>

        <div>
          <h2 className={headingClass}>Need Assistance?</h2>
          <address className="not-italic">
            <ul className="space-y-3.5 text-[15px] leading-6 text-brand-muted">
              <li className="flex gap-3">
                <Phone size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-brand-navy" />
                <a href="tel:+19145395580" className={linkClass}>+1 (914) 539-5580</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-brand-navy" />
                <a href="mailto:info@forgesmokedistro.com" className={`${linkClass} min-w-0 break-words`}>info@forgesmokedistro.com</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-brand-navy" />
                <a href="mailto:support@forgesmokedistro.com" className={`${linkClass} min-w-0 break-words`}>support@forgesmokedistro.com</a>
              </li>
              <li className="flex gap-3">
                <MapPin size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-brand-navy" />
                <span>Brooklyn - Portland - Chicago</span>
              </li>
            </ul>
          </address>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h2 className={headingClass}>{column.heading}</h2>
            <ul className="space-y-3.5 text-[15px] leading-6">
              {column.links.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className={headingClass}>Business Hours</h2>
          <ul className="space-y-2 text-[15px] leading-6 text-brand-muted">
            {BUSINESS_HOURS.map(([day, hours]) => (
              <li key={day} className="grid grid-cols-[90px_1fr] gap-3">
                <span>{day}</span>
                <span className="whitespace-nowrap">{hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-line bg-brand-bg-alt/40 px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {companyName} Wholesale Inc.</span>
          <span>Free freight over $500 - Net-60 terms available</span>
        </div>
      </div>
    </footer>
  );
}
