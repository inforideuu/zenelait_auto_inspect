import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, ShieldAlert, Sparkles, User, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In / Register — AutoInspect Portal" },
      { name: "description", content: "Access your AutoInspect dashboard to manage bookings, client requests, and inspection statuses." },
    ],
  }),
});

function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Registration Form State
  const [rUsername, setRUsername] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rFirstName, setRFirstName] = useState("");
  const [rLastName, setRLastName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rCity, setRCity] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Invalid username or password.");
      }

      const data = await response.json();

      localStorage.setItem("autoinspect_auth", "true");
      localStorage.setItem("autoinspect_token", data.token);
      localStorage.setItem("autoinspect_role", data.role); // 'admin' or 'user'

      const user = data.user;
      const fullName = (user.first_name || user.last_name)
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.username;

      localStorage.setItem("autoinspect_user", fullName);
      localStorage.setItem("autoinspect_user_id", String(user.id));
      if (user.profile) {
        localStorage.setItem("autoinspect_phone", user.profile.phone_number || "");
        localStorage.setItem("autoinspect_city", user.profile.city || "");
      }

      toast.success(`Welcome back, ${fullName}!`, {
        description: "Successfully authenticated to your dashboard.",
      });

      // Handle redirect search param if present (e.g. sent from booking block)
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/dashboard";

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);

    } catch (err: any) {
      toast.error("Authentication Failed", {
        description: err.message || "Invalid username/email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/register-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: rUsername.trim(),
          email: rEmail.trim(),
          password: rPassword,
          first_name: rFirstName.trim(),
          last_name: rLastName.trim(),
          phone_number: rPhone.trim(),
          city: rCity.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const firstErr = Object.values(errData).flat().join(" ") || "Failed to create account.";
        throw new Error(firstErr);
      }

      toast.success("Account created successfully!", {
        description: "Signing you in automatically...",
      });

      // Auto-login after successful registration
      const loginResponse = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: rUsername.trim(),
          password: rPassword,
        }),
      });

      if (!loginResponse.ok) {
        // Fallback: switch to signin tab and pre-fill credentials
        setUsername(rUsername);
        setPassword(rRPassword => rPassword);
        setActiveTab("signin");
        toast.info("Please sign in with your newly created credentials.");
        return;
      }

      const data = await loginResponse.json();

      localStorage.setItem("autoinspect_auth", "true");
      localStorage.setItem("autoinspect_token", data.token);
      localStorage.setItem("autoinspect_role", data.role); // 'user'

      const user = data.user;
      const fullName = (user.first_name || user.last_name)
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.username;

      localStorage.setItem("autoinspect_user", fullName);
      localStorage.setItem("autoinspect_user_id", String(user.id));
      if (user.profile) {
        localStorage.setItem("autoinspect_phone", user.profile.phone_number || "");
        localStorage.setItem("autoinspect_city", user.profile.city || "");
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/dashboard";

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 300);

    } catch (err: any) {
      toast.error("Registration Failed", {
        description: err.message || "Could not register account. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={activeTab === "signin" ? "Secure Portal" : "Client Registration"}
        title={activeTab === "signin" ? "Access Dashboard" : "Create Client Account"}
        subtitle={
          activeTab === "signin"
            ? "Sign in to manage bookings, track diagnostic reports, and view vehicle scores."
            : "Register your secure client account to place booking requests and view detailed inspections."
        }
      />

      <section className="relative mx-auto flex max-w-7xl items-center justify-center px-6 py-12">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            {/* Logo and Greeting Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_15px_var(--neon-glow-soft)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {activeTab === "signin" ? "Welcome Back" : "Get Started"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "signin" ? "Sign in to your account" : "Set up your inspection account"}
              </p>
            </div>

            {/* Premium Navigation Tabs */}
            <div className="flex border-b border-border/40 mb-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === "signin"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === "register"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Tab: Sign In */}
            {activeTab === "signin" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Username or Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username or email"
                      className="w-full rounded-xl border border-border bg-background/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-border bg-background text-primary accent-primary outline-none focus:ring-0"
                    />
                    Remember session
                  </label>
                  {/* <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Password Recovery", {
                        description: "Standard users can recover password using system support (hello@autoinspect.ai).",
                      });
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </a> */}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="neon-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer transition hover:scale-[1.01]"
                >
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>
              </form>
            )}

            {/* Tab: Create Account */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      First Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        value={rFirstName}
                        onChange={(e) => setRFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-8.5 pr-3 text-xs text-foreground outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Last Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        value={rLastName}
                        onChange={(e) => setRLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-8.5 pr-3 text-xs text-foreground outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Username / ID *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={rUsername}
                      onChange={(e) => setRUsername(e.target.value)}
                      placeholder="e.g. john_doe"
                      className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={rEmail}
                      onChange={(e) => setREmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    Password *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={rPassword}
                      onChange={(e) => setRPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        value={rPhone}
                        onChange={(e) => setRPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      City
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        value={rCity}
                        onChange={(e) => setRCity(e.target.value)}
                        placeholder="Dubai"
                        className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="neon-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer transition hover:scale-[1.01]"
                >
                  {loading ? "Registering..." : "Create Client Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
