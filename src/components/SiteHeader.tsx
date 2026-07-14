import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Client-side authentication check to avoid SSR failures
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("autoinspect_auth") === "true";
      setIsAuthenticated(auth);
      setUserRole(localStorage.getItem("autoinspect_role") || "");
      setUserName(localStorage.getItem("autoinspect_user") || "");
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <div className="flex items-center justify-center">
            <img src="/newlogo.png" alt="AutoInspect" className="h-20 w-30" />
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              className="transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                Hi, <span className="text-primary font-semibold">{userName}</span> ({userRole})
              </span>
              <Link
                to="/dashboard"
                className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20 transition font-medium"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary transition"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/contact"
            className="neon-button rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Book Inspection
          </Link>
        </div>
        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-border bg-card p-2 text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/95 px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: n.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="block py-1 text-base text-foreground"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-1 text-base text-primary font-semibold"
                >
                  Dashboard ({userRole})
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block py-1 text-base text-foreground"
                >
                  Sign in
                </Link>
              </li>
            )}
            <li className="pt-2">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="neon-button block rounded-full px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Book Inspection
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
