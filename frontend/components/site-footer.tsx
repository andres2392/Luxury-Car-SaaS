import { ExternalLink } from "lucide-react";
import Link from "next/link";

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

export function SiteFooter({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  const wrapperClass = isDark
    ? "bg-[#354F44] text-[#F2EEE6]"
    : "border-t border-[#DDD7CC] bg-[#FEFDFC] text-[#171717]";
  const dividerClass = isDark ? "border-[#F2EEE6]/72" : "border-[#D8D0C4]";
  const mutedClass = isDark ? "text-[#F2EEE6]/82" : "text-[#6E6A63]";
  const linkClass = isDark
    ? "text-[#F2EEE6]/84 hover:text-white"
    : "text-[#3f453f] hover:text-[#171717]";

  return (
    <footer className={wrapperClass}>
      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="text-center">
          <Link href="/" className="mx-auto inline-flex flex-col items-center gap-1">
            <span className="font-heading text-3xl leading-none tracking-[0.04em]">LA</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Luxury Auto</span>
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
            <p>© Copyright Luxury Auto 2026</p>
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
