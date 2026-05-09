import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

const footerColumns = [
  {
    title: "Models",
    links: ["Ferrari", "Lamborghini", "McLaren", "Porsche", "Rolls-Royce", "Aston Martin"],
  },
  {
    title: "Your Collection",
    links: ["Service and Maintenance", "Ownership Support", "Technology", "Finance Services", "Accessories"],
  },
  {
    title: "Lifestyle",
    links: ["Experiences", "Architecture and Design", "Automotive", "Audio"],
  },
  {
    title: "About",
    links: ["News", "Environmental Foundation", "Beyond 100+", "History and Heritage", "People and Expertise", "Factory Tours"],
  },
  {
    title: "Corporate",
    links: ["Sitemap", "Contact Us", "Terms and Conditions", "Privacy Policy", "Cookies Policy", "Cookie Settings", "Recalls", "Battery Passport"],
  },
];

const footerSocialLinks = ["f", "X", "yt", "p", "ig", "tt", "in"];

export function SiteFooter({
  variant = "light",
}: {
  variant?: "light" | "dark" | "detail" | "ivory";
}) {
  const isDark = variant === "dark";
  const wrapperClass =
    variant === "dark"
      ? "bg-[linear-gradient(180deg,#183028_0%,#10211B_100%)] text-[#F3EFE7]"
      : variant === "detail"
        ? "bg-[#FAF8F4] text-[#111111]"
        : variant === "ivory"
          ? "bg-[#FEFDFC] text-[#111111]"
          : "bg-[#F4F1EA] text-[#111111]";
  const dividerClass = isDark ? "border-[#C2A878]/28" : "border-[#D9D2C6]";
  const mutedClass = isDark ? "text-[#8E8A83]" : "text-[#6F6A63]";
  const linkClass = isDark
    ? "text-[#8E8A83] hover:text-[#F3EFE7]"
    : "text-[#6F6A63] hover:text-[#111111]";

  return (
    <footer className={wrapperClass}>
      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="text-center">
          <Link href="/" aria-label="Trilogy Garage home" className="mx-auto inline-flex">
            <BrandLogo className="h-28 w-48" imageClassName="object-contain" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {footerSocialLinks.map((item) => (
            <Link
              key={item}
              href="/"
              aria-label={`Social link ${item}`}
              className={`flex h-5 min-w-5 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.05em] transition ${linkClass}`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className={`mt-12 border-t ${dividerClass} pt-10`}>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-lg font-light tracking-[0.04em]">{column.title}</h3>
                <div className="mt-7 space-y-5">
                  {column.links.map((item) => (
                    <Link
                      key={item}
                      href="/cars"
                      className={`flex items-center gap-3 text-[11px] leading-4 transition ${linkClass}`}
                    >
                      {column.title === "Models" ? null : (
                        <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                      )}
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-12 border-t ${dividerClass} pt-8`}>
          <div className={`text-xs leading-6 ${mutedClass}`}>
            <p>© Copyright Trilogy Garage 2026</p>
            <p className="mt-6 max-w-3xl">
              Registered office: Miami, Florida. Premium inventory presentation for rare,
              refined, and collector-grade automobiles.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
