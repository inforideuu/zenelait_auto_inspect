import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ChevronDown,
  FileText,
  Gauge,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

const VIDEO_SRC =
  "https://cdn.coverr.co/videos/coverr-driving-a-luxury-car-at-night-2633/1080p.mp4";
const POSTER =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span>
      {n}
      {suffix}
    </span>
  );
}

const floatingCards = [
  {
    icon: Gauge,
    label: "Inspection Score",
    value: "98/100",
    sub: "Excellent",
    pos: "top-[12%] left-[4%]",
    delay: 0.6,
  },
  {
    icon: Activity,
    label: "Engine Health",
    value: "Optimal",
    sub: "0 anomalies",
    pos: "top-[28%] right-[5%]",
    delay: 0.9,
  },
  {
    icon: ShieldCheck,
    label: "Engine Health",
    value: "Good Condition",
    sub: "OBD diagnostics",
    pos: "bottom-[26%] left-[3%]",
    delay: 1.2,
  },
  {
    icon: FileText,
    label: "PDF Report",
    value: "Generating…",
    sub: "Live",
    pos: "bottom-[14%] right-[6%]",
    delay: 1.5,
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setParallax({ x: x * 20, y: y * 20 });
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Background video */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover opacity-22"
          autoPlay
          loop
          muted
          playsInline
          poster={POSTER}
          style={{ transform: "scale(1.08)" }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/25 to-background" />
      </div>

      {/* Animated grid */}
      <div className="hero-grid-bg absolute inset-0 opacity-40" />

      {/* Scan line */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.52 0.21 260 / 0.6), transparent)",
            animation: "scan-line 6s linear infinite",
          }}
        />
      </div>

      {/* Particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/60"
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${(i * 37) % 100}%`,
            boxShadow: "0 0 8px var(--neon-glow)",
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* Spotlight follows mouse */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(400px circle at ${50 + parallax.x}% ${50 + parallax.y}%, oklch(0.52 0.21 260 / 0.12), transparent 60%)`,
        }}
      />


      {/* Floating cards */}
      {floatingCards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: c.delay, duration: 0.8, ease: "easeOut" }}
            className={`absolute z-10 hidden lg:block ${c.pos}`}
            style={{
              transform: `translate(${parallax.x * (i % 2 ? -1 : 1) * 0.6}px, ${parallax.y * 0.6}px)`,
            }}
          >
            <div
              className="glass-card flex w-[220px] items-start gap-3 rounded-2xl p-4"
              style={{ animation: `float-slow ${5 + i}s ease-in-out infinite` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="truncate text-base font-semibold text-foreground">
                  {c.value}
                </p>
                <p className="text-xs text-primary">{c.sub}</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* WhatsApp delivery toast */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.7 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <div className="glass-card flex items-center gap-3 rounded-full px-5 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">
            Report delivered via WhatsApp · just now
          </span>
        </div>
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--neon-glow)]" />
          ISO certified · 12,400+ inspections
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-gradient-silver max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Professional Car
          <br />
          Inspection Services
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          vehicle inspections with instant digital PDF reports and
          WhatsApp delivery straight to your phone in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => navigate({ to: "/contact" })}
            className="neon-button group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03] cursor-pointer"
          >
            Book Inspection
            <span className="transition group-hover:translate-x-0.5">→</span>
          </button>
          <button
            onClick={() => navigate({ to: "/sample-reports" })}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur-md transition hover:bg-secondary cursor-pointer"
          >
            <PlayCircle className="h-4 w-4 text-primary" />
            View Sample Report
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4"
        >
          {[
            { v: 12400, s: "+", l: "Cars Inspected" },
            { v: 180, s: "+", l: "Checkpoints" },
            { v: 99, s: "%", l: "Accuracy" },
          ].map((s) => (
            <div key={s.l} className="glass-card rounded-2xl px-4 py-5">
              <p className="text-3xl font-semibold text-foreground md:text-4xl">
                <CountUp to={s.v} suffix={s.s} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div> */}
    </section>
  );
}
