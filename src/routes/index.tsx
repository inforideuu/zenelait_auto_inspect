import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AutoInspect — Professional AI Car Inspection Services" },
      {
        name: "description",
        content:
          "AI-powered vehicle inspections with instant digital PDF reports delivered via WhatsApp. 180-point diagnostic, certified inspectors, GCC-wide.",
      },
      { property: "og:title", content: "AutoInspect — AI Car Inspection" },
      { property: "og:description", content: "180-point AI-driven car inspections with WhatsApp report delivery." },
    ],
  }),
});

function Index() {
  return (
    <>
      <Hero />
      <HomeSections />
    </>
  );
}
