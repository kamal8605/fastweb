import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Find It Fast",
    links: ["Cigar Accessories", "Cleaning Products", "Detox Supplements", "Category Directory"],
  },
  {
    heading: "Customer Support",
    links: ["My Account", "Track your Order", "Category Directory", "Contact Us"],
  },
];

export function Footer() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Forge & Co.";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-white text-brand-ink">
      <div className="bg-brand-navy px-6 py-6 text-white lg:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 text-[22px] font-semibold">
            <Send size={28} className="shrink-0 text-brand-orange" />
            Sign up to Newsletter
          </div>
          <form className="flex w-full max-w-[620px] overflow-hidden rounded-[var(--brand-radius)] border border-[#1E3358] bg-white">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-12 min-w-0 flex-1 px-5 text-[14px] text-brand-ink outline-none placeholder:text-brand-muted"
            />
            <button
              type="submit"
              className="bg-brand-blue px-8 text-[14px] font-semibold text-white transition-colors hover:bg-brand-blue-deep"
            >
              SignUp
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-9 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1.45fr_0.9fr_1fr_1.55fr] lg:gap-10 lg:px-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo size={54} />
          <p className="mt-4 max-w-[320px] text-[14px] leading-7 text-brand-muted">
            A wholesale marketplace built for independent retailers. 600+ vetted brands,
            one invoice, sixty-day terms.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-[18px] font-bold leading-tight text-brand-ink">
            Need Assistance?
          </h4>
          <ul className="space-y-3.5 text-[14px] leading-6 text-brand-muted">
            <li className="flex gap-3">
              <Phone size={17} className="mt-1 shrink-0 text-brand-ink" />
              <a href="tel:+19145395580" className="text-brand-muted no-underline hover:text-brand-blue">
                +1 (914) 539-5580
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="mt-1 shrink-0 text-brand-ink" />
              <a
                href="mailto:info@forgesmokedistro.com"
                className="min-w-0 break-words text-brand-muted no-underline hover:text-brand-blue"
              >
                info@forgesmokedistro.com
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="mt-1 shrink-0 text-brand-ink" />
              <a
                href="mailto:support@forgesmokedistro.com"
                className="min-w-0 break-words text-brand-muted no-underline hover:text-brand-blue"
              >
                support@forgesmokedistro.com
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin size={17} className="mt-1 shrink-0 text-brand-ink" />
              <span>Brooklyn - Portland - Chicago</span>
            </li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="mb-5 text-[18px] font-bold leading-tight text-brand-ink">
              {col.heading}
            </h4>
            <ul className="space-y-3.5 text-[14px] leading-6">
              {col.links.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-brand-muted no-underline transition-colors hover:text-brand-blue"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-5 text-[18px] font-bold leading-tight text-brand-ink">
            Business Hours
          </h4>
          <ul className="space-y-2.5 text-[14px] leading-6 text-brand-muted">
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Monday</span><span className="whitespace-nowrap">9:00 AM - 7:00 PM</span></li>
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Tuesday</span><span className="whitespace-nowrap">9:00 AM - 7:00 PM</span></li>
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Wednesday</span><span className="whitespace-nowrap">9:00 AM - 7:00 PM</span></li>
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Thursday</span><span className="whitespace-nowrap">9:00 AM - 7:00 PM</span></li>
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Friday</span><span className="whitespace-nowrap">9:00 AM - 7:00 PM</span></li>
            <li className="grid grid-cols-[90px_1fr] gap-4"><span>Saturday</span><span className="whitespace-nowrap">10:00 AM - 5:00 PM</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-line px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {companyName} Wholesale Inc.</span>
          <span>Free freight over $500 - Net-60 terms available</span>
        </div>
      </div>
    </footer>
  );
}
