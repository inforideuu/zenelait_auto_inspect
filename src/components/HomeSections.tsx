import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Battery,
  Brain,
  Camera,
  Car,
  CheckCircle2,
  ClipboardList,
  Cog,
  FileCheck2,
  Gauge,
  Quote,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Damage Detection",
    body: "Detailed inspection process identifies dents, scratches, paint damage, and visible body issues to ensure accurate vehicle condition assessment."
  },
  { icon: ScanLine, title: "180-Point Diagnostic", body: "Engine, transmission, suspension, electronics, brakes every system scanned and scored." },
  { icon: FileCheck2, title: "Instant PDF Reports", body: "Branded, shareable inspection reports generated in under 60 minutes per vehicle." },
  { icon: Smartphone, title: "WhatsApp Delivery", body: "Reports land directly in your WhatsApp, no apps, no logins, no friction for buyers." },
  { icon: ShieldCheck, title: "Verified Inspectors", body: "Every technician is ASE-certified with a minimum of 8 years dealership experience." },
  { icon: Zap, title: "OBD-II Live Data", body: "Real-time ECU readings, error codes and emissions analysis included on every report." },
];

const steps = [
  { icon: ClipboardList, title: "Book in 60 seconds", body: "Pick a date, drop the location and choose a package. We confirm via WhatsApp." },
  { icon: Car, title: "We reach-out to you", body: "Mobile inspection vans arrive at the seller's location with full diagnostic kit." },
  { icon: Camera, title: "Human inspection", body: "180 checkpoints scanned with cameras, OBD readers and certified eyes on the metal." },
  { icon: FileCheck2, title: "Report in your hand", body: "Digital PDF + WhatsApp summary with score, photos, video walk-around and verdict." },
];

const services = [
  {
    icon: Car,
    title: "Pre-Delivery Inspection",
    body: "Ensure the vehicle is fully checked, tested, and ready before delivery to the customer."
  },
  { icon: Wrench, title: "Annual Health Check", body: "Yearly preventive scan to catch wear before it becomes a costly repair." },
  { icon: Battery, title: "EV Battery Diagnostic", body: "State-of-health testing for Tesla, BYD, Polestar and other EVs." },
  {
    icon: Cog,
    title: "Vehicle Service History Record",
    body: "View complete vehicle service and maintenance history records."
  },
];

const testimonials = [
  { name: "Omar A.", role: "Bought a used BMW M4", quote: "Saved me from a flood-damaged car. The flagged corrosion the dealer hid. Worth 100x the fee." },
  { name: "Sara K.", role: "Fleet manager, 240 vehicles", quote: "We replaced two full-time inspectors with AutoInspect and report quality went up. Best decision of 2025." },
  { name: "Daniel R.", role: "Independent dealer", quote: "Buyers trust the third-party report. My average closing time dropped from 9 days to 36 hours." },
];

const faqs = [
  { q: "How long does an inspection take?", a: "On-site inspection takes 45–75 minutes depending on the vehicle. The digital report is delivered within 60 minutes of completion." },
  { q: "Do you cover electric vehicles?", a: "Yes — we offer dedicated EV diagnostics including high-voltage battery state-of-health, charging system tests and motor analysis." },
  { q: "What if the car fails inspection?", a: "You receive a detailed defect list with repair cost estimates. We can connect you to vetted workshops or help you renegotiate." },
  {
    q: "How long does a car inspection take?",
    a: "Most standard vehicle inspections are completed within 45 to 90 minutes depending on the vehicle condition and inspection package selected."
  },
];

export default function HomeSections() {
  return (
    <>
      {/* TRUST BAR */}
      {/* <section className="border-y border-border/60 bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <span>Trusted by</span>
          {["Emirates Auto", "AlNabooda", "Sun City Motors", "Liberty Auto", "Al-Futtaim", "Arabian Auto"].map((b) => (
            <span key={b} className="text-foreground/80">{b}</span>
          ))}
        </div>
      </section> */}

      {/* FEATURES */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Why Autonique</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Inspection technology that <span className="text-primary">sees more</span> than a workshop ever could.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We combine certified human inspectors and live OBD-II diagnostics to give you a verdict you can actually trust.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="glass-card group relative overflow-hidden rounded-2xl p-6"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative border-y border-border/60 bg-secondary/30">
        <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Process</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">From booking to verdict in 90 minutes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="glass-card relative rounded-2xl p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-semibold text-muted-foreground/40">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Services</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Built for buyers & dealers</h2>
          </div>
          <Link to="/services" className="text-sm text-primary hover:underline">See all services →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="glass-card group rounded-2xl p-6 transition hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/40 text-primary-foreground shadow-[0_8px_24px_var(--neon-glow)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                <Link to="/services" className="mt-5 inline-flex items-center gap-1 text-sm text-primary opacity-0 transition group-hover:opacity-100">
                  Learn more →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* SAMPLE REPORT VISUAL */}
      <section className="relative border-y border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-2xl font-bold uppercase tracking-[0.25em] text-primary">Inspection Report</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">A report buyers actually read</h2>
            <p className="mt-4 text-muted-foreground">
              Every report ships with HD photos, a 360° video walk-around, OBD diagnostic codes, paint thickness readings and a single transparent score.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "180 checkpoints across 14 vehicle systems",
                "High-resolution photo evidence for every detected defect",
                "Repair cost estimates from local workshops",
                "Verdict, score and recommendation in plain language",
                "Shareable link + branded PDF + WhatsApp summary",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/sample-reports" className="neon-button mt-10 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground">
              View Sample Report
            </Link>
          </div>
          <div className="relative">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Report #AI-04881</p>
                    <p className="font-semibold">2022 BMW M4 Competition</p>
                  </div>
                </div>
                <BadgeCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { l: "Score", v: "94/100", i: Gauge },
                  { l: "Engine", v: "Optimal", i: Cog },
                  { l: "Body", v: "2 minor", i: ShieldCheck },
                ].map((m) => {
                  const I = m.i;
                  return (
                    <div key={m.l} className="rounded-xl border border-border/60 bg-background/40 p-3">
                      <I className="h-4 w-4 text-primary" />
                      <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{m.l}</p>
                      <p className="text-base font-semibold">{m.v}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { l: "Engine & Drivetrain", v: 96 },
                  { l: "Suspension & Brakes", v: 92 },
                  { l: "Electronics & ECU", v: 98 },
                  { l: "Body & Paint", v: 87 },
                  { l: "Interior & Comfort", v: 95 },
                ].map((row) => (
                  <div key={row.l}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{row.l}</span>
                      <span className="text-foreground">{row.v}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${row.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
                <span className="text-foreground">Verdict</span>
                <span className="font-semibold text-primary">Recommended to buy</span>
              </div>
            </div>
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem]"
              style={{ background: "radial-gradient(60% 60% at 50% 50%, oklch(0.65 0.27 22 / 0.25), transparent)" }}
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Customers</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">12,400 inspections. 4.9★ average.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-6">
              <Quote className="h-6 w-6 text-primary" />
              <p className="mt-4 text-base leading-relaxed text-foreground/90">"{t.quote}"</p>
              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">FAQ</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Questions, answered.</h2>
            <p className="mt-4 text-muted-foreground">Need more? Our team replies within 15-60 minutes on WhatsApp.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="glass-card group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-foreground">
                  {f.q}
                  <span className="ml-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="glass-card relative overflow-hidden rounded-3xl p-10 md:p-16">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "radial-gradient(70% 100% at 50% 0%, oklch(0.65 0.27 22 / 0.25), transparent)" }}
          />
          <div className="hero-grid-bg absolute inset-0 -z-10 opacity-20" />
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Don't buy a car you haven't <span className="text-primary">scanned.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Book your inspection in 60 seconds. Pay only after the report is delivered. Available 7 days a week across the GCC.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/contact" className="neon-button rounded-full px-6 py-3.5 text-center text-sm font-semibold text-primary-foreground">
                Book Inspection
              </Link>
              <Link to="/pricing" className="rounded-full border border-border bg-card px-6 py-3.5 text-center text-sm font-medium text-foreground hover:bg-secondary">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
