import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Award, Globe2, Heart, Lightbulb, Target, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — AutoInspect" },
      { name: "description", content: "AutoInspect builds AI-driven trust into every used car transaction across the GCC." },
      { property: "og:title", content: "About AutoInspect" },
      { property: "og:description", content: "We're on a mission to make every car purchase transparent." },
    ],
  }),
});

const values = [
  { icon: Target, title: "Transparency by default", body: "Every defect is photographed, scored and explained. No salesman varnish." },
  { icon: Heart, title: "Customer first", body: "We work for the buyer, not the seller. Our reports are independent and unbiased." },
  {
    icon: Lightbulb,
    title: "OBD and Professional Equipment tool",
    body: "We use professional OBD scanners and specialized inspection tools to detect hidden faults, engine issues, and electronic problems with accuracy."
  },
  { icon: Award, title: "Certified craftsmen", body: "Every inspector holds ASE certification with a minimum 8 years of dealership experience." },
];

const team = [
  { name: "Hassan Al-Mansoori", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { name: "Layla Karim", role: "Head of AI", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
  { name: "Daniel Reyes", role: "Master Technician", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  { name: "Aisha Rahman", role: "Operations Lead", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80" },
];

const milestones = [
  { year: "2024", text: "Founded with a mission to bring transparent and reliable vehicle inspections for used car buyers." },
  { year: "2025", text: "Expanded inspection services across multiple cities and completed thousands of successful vehicle inspections." },
  { year: "2026", text: "Launching advanced inspection reporting, faster scheduling, and dedicated support for EV and premium vehicle inspections." },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="We make every car purchase transparent."
        subtitle="AutoInspect is one of the region's trusted independent vehicle inspection networks built by experienced mechanics and designed to help buyers make confident decisions."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Our story</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              From a local inspection team to a trusted vehicle inspection network
            </h2>

            <p className="mt-5 text-muted-foreground">
              In 2024, AutoInspect was founded with a simple goal helping used car buyers avoid hidden vehicle problems and make confident purchasing decisions. What started as a small inspection setup quickly gained trust through honest reporting and professional inspection standards.
            </p>

            <p className="mt-4 text-muted-foreground">
              Today, AutoInspect serves customers across multiple cities with trained inspectors, mobile inspection support, advanced OBD diagnostics, and professional inspection equipment. We have successfully inspected thousands of vehicles and helped buyers save lakhs in unexpected repair costs by identifying hidden issues before purchase.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { v: "50K+", l: "Inspections" },
                { v: "₹50L+", l: "Buyer savings" },
                { v: "4.9★", l: "Avg rating" },
              ].map((s) => (
                <div key={s.l} className="glass-card rounded-xl p-4">
                  <p className="text-2xl font-semibold text-foreground">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-2">
            <img
              src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80"
              alt="Inspection garage"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Values</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">What we stand for</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const I = v.icon;
              return (
                <div key={v.title} className="glass-card rounded-2xl p-6">
                  <I className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Timeline</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Our journey so far</h2>
        </div>
        <div className="relative space-y-6 border-l border-border/60 pl-8">
          {milestones.map((m) => (
            <div key={m.year} className="relative">
              <span className="absolute -left-[37px] flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-[0_0_16px_var(--neon-glow)]" />
              <p className="text-sm font-semibold text-primary">{m.year}</p>
              <p className="mt-1 text-base text-foreground/90">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Team</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">The crew under the hood</h2>
          </div>
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {team.map((t) => (
            <div key={t.name} className="glass-card overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={t.img} alt={t.name} className="h-full w-full object-cover transition hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-base font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="glass-card relative overflow-hidden rounded-3xl p-10 md:p-14">
          <Globe2 className="absolute right-6 top-6 h-32 w-32 text-primary/10" />
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Expanding across the GCC, one workshop at a time.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">"Currently operating across Chennai with plans to expand to other major cities in Tamil Nadu and South India. We're continuously growing our inspection network and service coverage."</p>
          <Link
            to="/contact"
            search={{ join: 'true' } as any}
            className="neon-button mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Join the team
          </Link>
        </div>
      </section>
    </>
  );
}
