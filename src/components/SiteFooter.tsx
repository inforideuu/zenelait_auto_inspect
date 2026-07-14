import { Link } from "@tanstack/react-router";
import {
  AlignCenter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Twitter,
} from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border/60 bg-background">
      <div className="hero-grid-bg pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <div className="flex items-center justify-center">
                <img src="/newlogo.png" alt="AutoInspect" className="h-18 w-28" />
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              car inspections trusted by 12,000+ buyers and
              dealers . Instant digital reports delivered to your WhatsApp in
              minutes.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Sample report</a></li>
              <li><a href="#" className="hover:text-foreground">Inspection checklist</a></li>
              <li><a href="#" className="hover:text-foreground">Buyer's guide</a></li>
              <li><a href="#" className="hover:text-foreground">Help center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                Vasantha Garden Main St, Vasantha nagar, Chinna Chembarambakkam, Ayanavaram, Chennai, Tamil Nadu 600023
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone: +91 95669 95602
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email: Autonique.carinspection@gmail.com
              </li>

            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-foreground">Powered by</h4>
              <div className="w-fit bg-white rounded-md px-4 py-2 flex items-center justify-center h-12 shadow-sm hover:shadow-md transition-shadow">
                <img src="/zenelait_logo.png" alt="Zenelait Infotech" className="h-8 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-border/60 pt-6 text-xs text-muted-foreground grid grid-cols-1 gap-70 items-center md:grid-cols-3">

          {/* Links -> move to last on desktop */}
          <div className="flex gap-5 justify-center md:justify-start order-2 md:order-3">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>

          {/* Center content */}
          <p className="text-center order-1 md:order-2">
            © {new Date().getFullYear()} AutoInspect Technologies. All rights reserved.
          </p>

          {/* Empty spacer -> move to first */}
          <div className="hidden md:block md:order-1" />

        </div>
      </div>
    </footer>
  );
}
