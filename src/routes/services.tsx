import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import {
  Battery,
  Car,
  CheckCircle2,
  Cog,
  Crown,
  Gauge,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — AutoInspect" },
      { name: "description", content: "Pre-purchase, annual, EV, fleet and luxury car inspection services across the GCC." },
      { property: "og:title", content: "Inspection Services — AutoInspect" },
      { property: "og:description", content: "Choose from 6 dedicated inspection programs for buyers, dealers and fleets." },
    ],
  }),
});

const services = [
  {
    icon: Car,
    title: "Pre-Delivery Inspection",
    price: "",
    body: "Comprehensive inspection to ensure the vehicle is fully prepared, safe, and delivery-ready before handover.",
    bullets: [
      "Complete vehicle quality check",
      "Engine & fluid inspection",
      "Battery, brake & tire testing",
      "Interior & exterior condition review",
      "Final road test before delivery"
    ],
  },
  {
    icon: Crown,
    title: "Used Car Inspection",
    price: "",
    body: "Complete inspection service for used vehicles to evaluate mechanical condition, safety, performance, and overall vehicle quality before purchase.",
    bullets: [
      "Engine & transmission check",
      "Brake & suspension inspection",
      "Exterior & interior condition review",
      "Accident & damage detection",
      "Road test & diagnostic scan"
    ],
  },
  {
    icon: Truck,
    title: "Vehicle Service History",
    price: "",
    body: "Complete service and maintenance history records for accurate vehicle condition verification.",
    bullets: [
      "Previous service records",
      "Maintenance timeline",
      "Repair history tracking",
      "Oil & filter change history",
      "Authorized service details"
    ],
  },
  {
    icon: Wrench,
    title: "Annual Health Check",
    price: "",
    body: "Yearly preventive scan to catch wear and tear before it becomes a costly repair bill.",
    bullets: ["Engine & drivetrain health", "Brake & suspension test", "Battery & electrical", "Filters audit", "Service interval planning"],
  },
  {
    icon: Battery,
    title: "EV Battery Diagnostic",
    price: "",
    body: "High-voltage battery state-of-health for Tesla, BYD, Polestar, Lucid and other EVs.",
    bullets: ["Cell balance analysis", "Charging system test", "Motor & inverter scan", "Range degradation report", "Software version audit"],
  },
  {
    icon: ShieldCheck,
    title: "Comprehensive Vehicle Inspection",
    price: "",
    body: "Detailed vehicle inspection service to assess mechanical condition, safety, and overall performance.",
    bullets: [
      "Engine performance check",
      "Brake & suspension inspection",
      "Battery & electrical testing",
      "Interior & exterior review",
      "Detailed inspection PDF report"
    ],
  },
];

const compare = [
  ["180-point inspection", true, true, true, true],
  ["Real photos analysis", true, true, true, true],
  ["OBD-II diagnostic", true, true, true, true],
  ["Paint thickness scan", true, true, true, true],
  ["Test drive evaluation", true, true, true, true],
  ["Marque-specialist inspector", true, true, true, true],
] as const;

function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Inspection programs for every vehicle"
        subtitle="From first-time car buyers to dealerships, our inspection services are designed to deliver transparency, confidence, and peace of mind before every vehicle purchase."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="glass-card flex flex-col rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.price}</span>
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                <ul className="mt-5 flex-1 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  search={{ package: s.title } as any}
                  className="neon-button mt-6 inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Book this inspection
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Compare</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              What's included in each program
            </h2>
          </div>

          <div className="glass-card overflow-x-auto rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-background/40">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Feature</th>
                  <th className="px-6 py-4">Basic</th>
                  <th className="px-6 py-4">Standard</th>
                  <th className="px-6 py-4">Premium</th>
                </tr>
              </thead>

              <tbody>
                {compare.map(([label, basic, standard, premium]) => (
                  <tr key={label as string} className="border-t border-border/60">
                    <td className="px-6 py-4 text-foreground">
                      {label as string}
                    </td>

                    {[basic, standard, premium].map((c, i) => (
                      <td key={i} className="px-6 py-4">
                        {c ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Gauge, title: "Average inspection", value: "62 min" },
            { icon: Cog, title: "Systems checked", value: "14 modules" },
            { icon: ShieldCheck, title: "Professional Inspection Standards", value: "150+ checkpoints" },
          ].map((s) => {
            const I = s.icon;
            return (
              <div key={s.title} className="glass-card rounded-2xl p-6">
                <I className="h-6 w-6 text-primary" />
                <p className="mt-4 text-3xl font-semibold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
