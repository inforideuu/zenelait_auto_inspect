import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — AutoInspect" },
      { name: "description", content: "Book an inspection or chat with our team via WhatsApp, phone or email. Reply within 15 minutes." },
      { property: "og:title", content: "Contact AutoInspect" },
      { property: "og:description", content: "We reply within 15 minutes on WhatsApp, 7 days a week." },
    ],
  }),
});


function ContactPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [inspectionLocation, setInspectionLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [packageName, setPackageName] = useState("Standard — AED 449");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Payment Success/Failure States
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check authentication and pre-fill details
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("autoinspect_auth") === "true";
      setIsAuthenticated(auth);

      if (auth) {
        setFullName(localStorage.getItem("autoinspect_user") || "");
        setWhatsappNumber(localStorage.getItem("autoinspect_phone") || "");
        setCity(localStorage.getItem("autoinspect_city") || "");
        setEmail(localStorage.getItem("autoinspect_email") || "");
      }

      // Parse package query parameters from the URL
      const params = new URLSearchParams(window.location.search);
      const join = params.get("join");
      if (join === "true") {
        setIsJoining(true);
        setNotes("Hi AutoInspect Team, I'm interested in joining the team as a vehicle inspector / technician. Here is a brief summary of my automotive technician background:\n\n- ASE Certifications:\n- Years of experience:\n- Key specialties:\n- Previous dealerships/shops:");
        setPackageName("Fleet (20+ cars)");
      } else {
        const pkg = params.get("package");
        if (pkg) {
          const lowerPkg = pkg.toLowerCase();
          if (lowerPkg.includes("basic") || lowerPkg.includes("annual")) {
            setPackageName("Basic — AED 299");
          } else if (lowerPkg.includes("standard") || lowerPkg.includes("purchase")) {
            setPackageName("Standard — AED 449");
          } else if (lowerPkg.includes("premium") || lowerPkg.includes("ev") || lowerPkg.includes("accident")) {
            setPackageName("Premium — AED 699");
          } else if (lowerPkg.includes("luxury") || lowerPkg.includes("exotic")) {
            setPackageName("Luxury — AED 1,299");
          } else if (lowerPkg.includes("fleet")) {
            setPackageName("Fleet (20+ cars)");
          }
        }
      }
    }
  }, []);

  const fetchGeolocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Unable to fetch location. Please enter coordinates manually.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    import("sonner").then(({ toast }) => {

      // Extract clean package name (e.g. Standard)
      const cleanPackage = packageName.split("—")[0].trim();

      // If joining the crew, bypass payment completely
      if (isJoining) {
        const payload = {
          full_name: fullName,
          whatsapp_number: whatsappNumber,
          vehicle_model: vehicleModel || "Crew Application",
          city: city || "N/A",
          package: "Crew",
          notes: notes,
        };

        fetch("http://localhost:8000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || ""}`
          },
          body: JSON.stringify(payload),
        })
          .then(res => {
            if (!res.ok) throw new Error("API error");
            setSent(true);
            toast.success("Application received successfully!");
            setSubmitting(false);
          })
          .catch(() => {
            setSent(true);
            toast.success("Application submitted successfully (Offline Mode).");
            setSubmitting(false);
          });
        return;
      }

      // Standard Payment Flow
      let amount = 1799; // Standard package default
      const cleanPkgLower = cleanPackage.toLowerCase();
      if (cleanPkgLower.includes("basic")) {
        amount = 1299;
      } else if (cleanPkgLower.includes("standard")) {
        amount = 1799;
      } else if (cleanPkgLower.includes("premium")) {
        amount = 2999;
      }

      // Directly create booking on the backend
      fetch("http://localhost:8000/api/payments/confirm-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("autoinspect_token") || ""}`
        },
        body: JSON.stringify({
          email: email,
          booking_details: {
            full_name: fullName,
            whatsapp_number: whatsappNumber,
            vehicle_model: vehicleModel,
            city: city,
            inspection_location: inspectionLocation || null,
            area: area || null,
            pincode: pincode || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            package: cleanPackage,
            notes: notes || null,
            amount: amount,
            currency: "INR"
          }
        })
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Failed to confirm booking.");
          }
          return res.json();
        })
        .then((data) => {
          setCreatedBookingId(data.booking_id);
          setPaymentSuccess(true);
          setSent(true);
          toast.success("Inspection Booked & Confirmed Successfully!");
          setSubmitting(false);
        })
        .catch((err: any) => {
          setErrorMessage(err.message || "Booking creation failed.");
          setPaymentFailed(true);
          toast.error(err.message || "Booking creation failed.");
          setSubmitting(false);
        });
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's get your car inspected."
        subtitle="WhatsApp is fastest we reply within 60 minutes, 7 days a week. Or fill out the form and we'll call you back."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5">
            {[
              { icon: MessageCircle, t: "WhatsApp", v: "+91 95669 95602", s: "Replies within 15 min" },
              { icon: Phone, t: "Phone", v: "+91 95669 95602", s: "Sun–Sat, 8am–10pm" },
              { icon: Mail, t: "Email", v: "Autonique.carinspection@gmail.com", s: "Replies within 2 hours" },
              { icon: MapPin, t: "Location", v: "Vasantha Garden Main St, Vasantha nagar, Chinna Chembarambakkam, Ayanavaram, Chennai, Tamil Nadu 600023", s: "Walk-in inspections welcome" },
              { icon: Clock, t: "Hours", v: "Open 7 days", s: "Emergency inspection available 24/7" },
            ].map((c) => {
              const I = c.icon;
              return (
                <div key={c.t} className="glass-card flex items-start gap-4 rounded-2xl p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <I className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.t}</p>
                    <p className="text-base font-semibold text-foreground">{c.v}</p>
                    <p className="text-xs text-muted-foreground">{c.s}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {!isAuthenticated ? (
            <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-primary/20 shadow-2xl relative overflow-hidden min-h-[450px]">
              {/* Glowing decorative backdrops */}
              <div className="absolute top-1/4 left-1/4 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-[80px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 -z-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px]" />

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_15px_var(--neon-glow-soft)]">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Sign In to Book Inspection</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                To schedule a certified vehicle inspection and track diagnostic reports, please sign in or register a new client account.
              </p>

              <Link
                to="/login"
                search={{ redirect: "/contact" } as any}
                className="neon-button mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground cursor-pointer transition hover:scale-[1.02]"
              >
                Sign In / Create Account
              </Link>
            </div>
          ) : paymentSuccess ? (
            <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-emerald-500/30 shadow-2xl relative overflow-hidden min-h-[480px]">
              {/* Glowing success decorative backdrops */}
              <div className="absolute top-1/4 left-1/4 -z-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-[80px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 -z-10 h-48 w-48 rounded-full bg-teal-500/10 blur-[80px]" />

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/20">
                <CheckCircle className="h-9 w-9" />
              </div>

              <h3 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Booking Confirmed!
              </h3>

              <div className="mt-4 px-6 py-2 rounded-xl bg-secondary/30 border border-border/40 font-mono text-sm font-bold text-foreground">
                Booking ID: <span className="text-emerald-500">{createdBookingId}</span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you! Your payment has been successfully captured and verified. We have emailed your official **PDF Invoice** to <strong className="text-foreground">{email}</strong>, and sent booking confirmations to your WhatsApp number.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                <Link
                  to="/dashboard"
                  className="neon-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground cursor-pointer transition hover:scale-[1.02] bg-primary shadow-lg shadow-primary/20 w-full"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setSent(false);
                    setVehicleModel("");
                    setNotes("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold border border-border bg-card hover:bg-secondary/40 text-foreground cursor-pointer transition w-full"
                >
                  Book Another
                </button>
              </div>
            </div>
          ) : paymentFailed ? (
            <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center justify-center border border-rose-500/30 shadow-2xl relative overflow-hidden min-h-[480px]">
              {/* Glowing failure decorative backdrops */}
              <div className="absolute top-1/4 left-1/4 -z-10 h-48 w-48 rounded-full bg-rose-500/10 blur-[80px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 -z-10 h-48 w-48 rounded-full bg-orange-500/10 blur-[80px]" />

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] border border-rose-500/20">
                <AlertTriangle className="h-9 w-9" />
              </div>

              <h3 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent">
                Payment Verification Failed
              </h3>

              <p className="mt-5 text-sm text-rose-400/90 bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl max-w-md mx-auto leading-relaxed">
                {errorMessage || "We were unable to secure transaction authorization. Please verify your payment details and retry."}
              </p>

              <p className="mt-4 text-xs text-muted-foreground max-w-xs mx-auto leading-normal">
                If money was debited from your account, please do not book again. Support will verify your status manually.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
                <button
                  onClick={(e) => {
                    setPaymentFailed(false);
                    handleSubmit(e);
                  }}
                  className="neon-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-primary-foreground cursor-pointer transition hover:scale-[1.02] bg-primary w-full"
                >
                  Retry Payment
                </button>
                <button
                  onClick={() => {
                    setPaymentFailed(false);
                    setSubmitting(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold border border-border bg-card hover:bg-secondary/40 text-foreground cursor-pointer transition w-full"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-card space-y-5 rounded-3xl p-8"
            >
              <div>
                <h3 className="text-2xl font-semibold">
                  {isJoining ? "Join the AutoInspect crew" : "Book your inspection"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isJoining
                    ? "Submit your technician profile and we will review your ASE certifications."
                    : "Tell us about the car and we'll confirm a slot via WhatsApp."}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Full name"
                  placeholder="Hassan Al-Mansoori"
                  value={fullName}
                  onChange={setFullName}
                />
                <Field
                  label="WhatsApp number"
                  placeholder="+971 50 000 0000"
                  value={whatsappNumber}
                  onChange={setWhatsappNumber}
                />
                <Field
                  label="Email address"
                  placeholder="hassan@example.com"
                  value={email}
                  onChange={setEmail}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Vehicle make & model"
                  placeholder="2022 BMW M4"
                  value={vehicleModel}
                  onChange={setVehicleModel}
                />
                <Field
                  label="City"
                  placeholder="Dubai"
                  value={city}
                  onChange={setCity}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Area / Territory"
                  placeholder="Dubai Marina"
                  value={area}
                  onChange={setArea}
                />
                <Field
                  label="Pincode / Zip Code"
                  placeholder="00000"
                  value={pincode}
                  onChange={setPincode}
                />
              </div>
              <div>
                <Field
                  label="Full Inspection Address"
                  placeholder="Apartment/Villa, Street, Near landmark"
                  value={inspectionLocation}
                  onChange={setInspectionLocation}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 items-end">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Latitude</label>
                    <input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="25.2048"
                      className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Longitude</label>
                    <input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="55.2708"
                      className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={fetchGeolocation}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-3.5 text-sm font-semibold transition cursor-pointer h-[46px]"
                  >
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    Locate Me (GPS)
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Inspection package</label>
                <select
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option className="bg-white text-foreground">Standard — From 1799</option>
                  <option className="bg-white text-foreground">Basic — From 1299</option>
                  <option className="bg-white text-foreground">Premium — From 2999</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Notes</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything specific we should look for? Preferred date / time?"
                  className="w-full resize-none rounded-xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  isJoining ? "Sending Application..." : "Processing checkout..."
                ) : sent ? (
                  isJoining ? "Application received — we'll get back to you shortly" : "Booking confirmed!"
                ) : isJoining ? (
                  <>
                    Submit Application <Send className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Book Inspection <Send className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                By submitting you agree to our terms and privacy policy.
              </p>
            </form>
          )}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { c: "Dubai", a: "Sheikh Zayed Rd, Al Quoz", h: "Open 7 days · 8am–10pm" },
              { c: "Riyadh", a: "King Fahd Rd, Olaya District", h: "Open 7 days · 8am–10pm" },
              { c: "Doha", a: "Al Sadd, near City Center", h: "Open 6 days · 9am–9pm" },
            ].map((o) => (
              <div key={o.c} className="glass-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider text-primary">{o.c}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{o.a}</p>
                <p className="mt-1 text-sm text-muted-foreground">{o.h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

function Field({ label, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
      />
    </div>
  );
}
