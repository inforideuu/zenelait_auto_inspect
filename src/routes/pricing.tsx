import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — AutoInspect" },
      { name: "description", content: "Transparent flat pricing for car inspections. From AED 299. No hidden fees, no subscriptions." },
      { property: "og:title", content: "Inspection Pricing — AutoInspect" },
      { property: "og:description", content: "Choose Basic, Standard, Premium or Luxury — pay only after the report is delivered." },
    ],
  }),
});

const tiers = [
  {
    name: "Basic",
    price: "Starts from 1299",
    body: "Quick health check for everyday cars under 5 years old.",
    bullets: ["120-point visual inspection", "Visual photo analysis", "Digital PDF report", "WhatsApp delivery", "Same-day report"],
  },
  {
    name: "Standard",
    price: "Starts from 1799",
    popular: true,
    body: "Most popular full diagnostic for pre-purchase decisions.",
    bullets: [
      "180-point inspection",
      "OBD-II ECU scan",
      "Paint thickness reading",
      "Repair cost estimates",
      "Detailed PDF inspection report"
    ],
  },
  {
    name: "Premium",
    price: "Starts from 2999",
    body: "Includes road test and accident history report.",
    bullets: ["Everything in Standard", "Test drive evaluation", "Accident & title history", "Underbody lift inspection", "Priority booking"],
  },
  // {
  //   name: "Luxury",
  //   price: "1,299",
  //   body: "White-glove for exotics, classics and high-value vehicles.",
  //   bullets: ["Marque-specialist inspector", "Carbon fibre integrity", "Service book validation", "Provenance audit", "Concierge handover"],
  // },
];

const addons = [
  { t: "Vehicle service history report", p: "" },
  { t: "Pending vehicle challan check", p: "" },
  { t: "FIR history verification", p: "" },
  { t: "RC and ownership verification", p: "" },
];

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Flat pricing. Pay after the report."
        subtitle="No subscriptions, no hidden fees. Choose your package, get inspected, pay only when you've reviewed the report."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`glass-card relative flex flex-col rounded-2xl p-6 ${t.popular ? "ring-2 ring-primary shadow-[var(--shadow-neon)]" : ""
                }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="text-xl font-bold font-semibold uppercase tracking-wider text-primary text-center">{t.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">Rs. </span>
                <span className="text-2xl font-semibold tracking-tight">{t.price}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                search={{ package: t.name } as any}
                className={`mt-7 inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${t.popular
                  ? "neon-button text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
                  }`}
              >
                Book {t.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="text-2xl uppercase tracking-[0.15em] text-primary">Add-ons</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Optional extras</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {addons.map((a) => (
              <div key={a.t} className="glass-card flex items-center justify-between rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{a.t}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{a.p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-semibold">Vehicle Service History Record</h3>

            <p className="mt-3 text-muted-foreground">
              Access complete maintenance and service history records to verify past repairs, routine servicing, and overall vehicle care before delivery or purchase.
            </p>
            <Link
              to="/contact"
              search={{ package: 'Fleet' } as any}
              className="mt-6 inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Learn More
            </Link>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-2xl font-semibold">100% Accuracy Commitment</h3>

            <p className="mt-3 text-muted-foreground">
              Every inspection is performed using advanced diagnostic tools, detailed quality checks, and expert verification to ensure accurate and reliable vehicle reports.
            </p>

            <Link
              to="/services"
              className="mt-6 inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
