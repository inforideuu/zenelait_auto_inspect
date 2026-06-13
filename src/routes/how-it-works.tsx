import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Calendar, Camera, ClipboardList, FileCheck2, MessageCircle, ScanLine } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  component: HowPage,
  head: () => ({
    meta: [
      { title: "How it works — AutoInspect" },
      { name: "description", content: "From booking to WhatsApp report delivery in 90 minutes. Here's how AutoInspect inspects your car." },
      { property: "og:title", content: "How AutoInspect Works" },
      { property: "og:description", content: "180 checkpoints, AI vision and OBD-II diagnostics — explained step by step." },
    ],
  }),
});

const steps = [
  { icon: Calendar, t: "Book online or via WhatsApp", b: "Pick the vehicle, the inspection package, the date and the location. You'll get a confirmation in seconds." },
  { icon: ClipboardList, t: "We confirm and schedule a window", b: "An inspector is dispatched with full diagnostic gear: cameras, OBD-II scanner, paint gauge, lift and tools." },
  {
    icon: Camera,
    t: "Visual Photo Capture",
    b: "Detailed vehicle photos are captured from multiple angles to document exterior, interior, and overall vehicle condition with clarity and accuracy."
  },
  { icon: ScanLine, t: "Mechanical & electronic scan", b: "180 checkpoints: engine, transmission, suspension, brakes, electronics, HVAC, interior and OBD-II live data." },
  { icon: FileCheck2, t: "Report generated in 1 Hour", b: "Score, verdict, photo evidence and repair estimates compiled into a single branded PDF." },
  { icon: MessageCircle, t: "Delivered to WhatsApp", b: "PDF + summary land in your WhatsApp. Share with seller or family in one tap." },
];

const checklist = [
  "Engine bay & fluids",
  "Transmission & gearbox",
  "Suspension & steering",
  "Brakes & ABS system",
  "Tyres & alignment",
  "Electrical & battery",
  "OBD-II error codes",
  "Lights & visibility",
  "AC & climate",
  "Interior & upholstery",
  "Exterior body & paint",
  "Underbody & exhaust",
  "Glass & wipers",
  "Documentation & VIN",
];

function HowPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="From booking to verdict in 90 minutes"
        subtitle="No appointments at workshops, no lost mornings. We come to the seller, do the work, and deliver the report to your phone."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.t} className="glass-card relative rounded-2xl p-6">
                <span className="absolute right-5 top-5 text-4xl font-semibold text-muted-foreground/30">0{i + 1}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <I className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.b}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-primary">Checklist</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">14 vehicle systems, 180 checkpoints</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">A full breakdown of what we check on every standard inspection. Basic, Standard & Premium packages add brand-specific items.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {checklist.map((c) => (
              <div key={c} className="glass-card flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground/90">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--neon-glow)]" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="glass-card rounded-3xl p-10 text-center md:p-14">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to know exactly what you're buying?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Book your inspection now — slots open within 24 hours across the GCC.</p>
          <Link to="/contact" className="neon-button mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground">
            Book Inspection
          </Link>
        </div>
      </section>
    </>
  );
}
