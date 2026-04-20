import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  "Monorepo architecture ready for scale",
  "FastAPI + PostgreSQL backend foundation",
  "Luxury-focused UI baseline with shadcn/ui setup",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(195,157,95,0.2),_transparent_35%),linear-gradient(180deg,_#f8f4ec_0%,_#f1ebdf_40%,_#efe7da_100%)]" />
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[var(--color-muted-foreground)]">
              Luxury-Car-SaaS
            </p>
          </div>
          <div className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-medium text-[var(--color-muted-foreground)] backdrop-blur-sm">
            Phase 1 and 2 foundation ready
          </div>
        </header>

        <div className="grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs font-medium text-[var(--color-muted-foreground)] shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              Premium dealer platform starter
            </div>

            <h1 className="font-heading text-5xl leading-none tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              Build a luxury car marketplace with a clean, scalable foundation.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
              The frontend is live, the backend is structured, and the initial
              PostgreSQL schema is ready for future phases.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg">
                Frontend is working
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="lg">
                Backend + DB foundation
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Starter health check</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  UI shell prepared for production growth
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm text-[var(--color-muted-foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

