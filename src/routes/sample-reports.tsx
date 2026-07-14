import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  Info,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/sample-reports")({
  component: SampleReportsPage,
  head: () => ({
    meta: [
      { title: "Sample Vehicle Inspection Reports — AutoInspect" },
      { name: "description", content: "Explore interactive sample car reports. View mechanical checks, paint thickness readings, AI defect tagging, and OBD scans." },
    ],
  }),
});

interface MockReport {
  id: string;
  vehicle: string;
  year: number;
  grade: number;
  gradeColor: string;
  package: string;
  city: string;
  date: string;
  summary: string;
  
  // Vehicle specifications
  vin: string;
  odometer: string;
  fuelType: string;
  transmission: string;
  registrationNumber: string;
  variant?: string;
  technicianName?: string;
  
  // Attention Needed Areas
  bodyStructural: string;
  accidentalHistory: string;
  engineGearbox: string;
  waterLogged: string;
  obdErrors: string;
  
  // Inspector Remarks
  remarks: string[];
  
  obd: {
    status: "Clean" | "Faults Detected";
    codes: { code: string; desc: string; severity: "Low" | "Medium" | "High" }[];
  };
  paint: {
    status: "Original" | "Refinished Panel";
    panels: { name: string; value: number; original: boolean }[];
  };
  checks: {
    category: "Engine Cabin" | "Exterior and Body" | "Interior" | "Test Drive";
    items: { name: string; status: "Pass" | "Attention" | "Fail"; desc: string }[];
  }[];
}

const SAMPLE_REPORTS: MockReport[] = [
  {
    id: "REP-397556",
    vehicle: "BMW M4 Coupe",
    year: 2026,
    grade: 90,
    gradeColor: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    package: "Premium",
    city: "Dubai",
    date: "May 20, 2026",
    summary: "Overall excellent cosmetic and mechanical state. The vehicle has uniform original paint on all body panels with zero signs of accident or structural repairs. The active OBD ECU diagnostic pre/post scans log clean histories. High-speed road test displays flawless tracking, highly responsive steering, and crisp gear transitions from the dual-clutch transmission.",
    vin: "WBA3A5C58GP397556",
    odometer: "12,450 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    registrationNumber: "D-397556",
    variant: "Competition",
    technicianName: "ASE Master Certified (#491-03)",
    bodyStructural: "Passed (Uniform original panels, no structural deformation detected)",
    accidentalHistory: "Clean (No collision repair history observed)",
    engineGearbox: "Passed (Healthy idling, quiet valves, crisp gear engagement)",
    waterLogged: "Passed (No flood or water immersion markers found)",
    obdErrors: "Clean (Zero active diagnostic trouble codes)",
    remarks: [
      "Engine oil and fluids at optimum viscosity levels.",
      "Front brake pad life remains high at 88%.",
      "Minor dust build-up in engine bay panel edges, normal for GCC climate."
    ],
    obd: {
      status: "Clean",
      codes: [],
    },
    paint: {
      status: "Original",
      panels: [
        { name: "Hood", value: 110, original: true },
        { name: "Front Bumper", value: 105, original: true },
        { name: "Left Fender", value: 112, original: true },
        { name: "Right Fender", value: 108, original: true },
        { name: "Left Door", value: 115, original: true },
        { name: "Right Door", value: 114, original: true },
        { name: "Roof", value: 102, original: true },
        { name: "Rear Hatch", value: 109, original: true },
      ],
    },
    checks: [
      {
        category: "Engine Cabin",
        items: [
          { name: "Engine Physical Condition", status: "Pass", desc: "No weeping or active fluid leaks on block or covers." },
          { name: "Engine Oil Condition", status: "Pass", desc: "Optimal fill level, color and viscosity are normal." },
          { name: "Coolant system hold pressure", status: "Pass", desc: "Radiator and hoses show zero leaks or pressure drop." },
          { name: "Battery Condition", status: "Pass", desc: "Battery test results are healthy (12.6V resting charge)." },
          { name: "Fuel Injector", status: "Pass", desc: "Nominal operation noise, clean diagnostic injection loop." },
          { name: "Left Apron & Leg", status: "Pass", desc: "Original factory sealant and spot welds intact." },
          { name: "Right Apron & Leg", status: "Pass", desc: "Original factory sealant and structure conform to spec." }
        ]
      },
      {
        category: "Exterior and Body",
        items: [
          { name: "Windshield", status: "Pass", desc: "Original OEM glass, free of cracks or pits." },
          { name: "Bonnet panel alignment", status: "Pass", desc: "Bonnet conforms perfectly to factory gap specifications." },
          { name: "Front Bumper and Grill", status: "Pass", desc: "All clips and brackets are secure, no structural damage." },
          { name: "Headlights & DRLs", status: "Pass", desc: "Crystal clear LED lenses, flawless operation." },
          { name: "Fenders & Side Panels", status: "Pass", desc: "Paint thickness is uniform (80-120μm), all factory original." },
          { name: "A/B/C Pillars", status: "Pass", desc: "Structure is factory original, paint values indicate no respraying." },
          { name: "Roof structure", status: "Pass", desc: "No dents or respray work detected." }
        ]
      },
      {
        category: "Interior",
        items: [
          { name: "Instrument Cluster & Screen", status: "Pass", desc: "Live dashboard displays fully operational, zero dead pixels." },
          { name: "Airconditioner System", status: "Pass", desc: "Blows ice-cold at 5.8°C at center vent (Excellent)." },
          { name: "Power Windows & Switches", status: "Pass", desc: "All doors cycle smoothly, one-touch automation responds instantly." },
          { name: "ORVM folding and controls", status: "Pass", desc: "Side mirrors fold and adjust quietly with zero lag." },
          { name: "Seats & leather condition", status: "Pass", desc: "Slight bolster wear on driver's side, overall excellent." },
          { name: "Tail Lamps & boot lights", status: "Pass", desc: "All lighting clusters operate with zero moisture ingress." }
        ]
      },
      {
        category: "Test Drive",
        items: [
          { name: "Airbags & SRS safety loop", status: "Pass", desc: "Diagnostic check returns 100% active circuit readiness." },
          { name: "ABS & Traction Control", status: "Pass", desc: "Safety systems respond instantly on road test without locking." },
          { name: "Clutch & Brake deceleration", status: "Pass", desc: "Brake rotors flat, strong linear stop power, paddles shift fast." },
          { name: "Gear Shifting & box performance", status: "Pass", desc: "Lightning fast shifts, clutch parameters are within OEM specs." },
          { name: "Suspension noise & damping", status: "Pass", desc: "Bushings and shock absorbers tight, silent over speed bumps." },
          { name: "Engine sound and NVH", status: "Pass", desc: "Smooth mechanical revving, zero abnormal cabin vibrations." },
          { name: "Water Logged & flood check", status: "Pass", desc: "Dry floor pans, no harness corrosion or mildew smell." }
        ]
      }
    ],
  },
  {
    id: "REP-000297",
    vehicle: "Honda City",
    year: 2018,
    grade: 45,
    gradeColor: "text-rose-500 border-rose-500/20 bg-rose-500/10",
    package: "Standard",
    city: "Dubai",
    date: "April 07, 2026",
    summary: "CRITICAL HEALTH WARNING: Comprehensive inspection has revealed that this vehicle has been involved in major accidents, with significant structural repairs performed on its chassis to restore a normal outward appearance. While mechanical components are currently operational, the compromised integrity of the apron legs and pillars poses a severe risk to long-term safety. Strongly recommend against purchasing.",
    vin: "MAKGM4650JG000297",
    odometer: "98,240 km",
    fuelType: "Petrol",
    transmission: "Manual",
    registrationNumber: "TN-05-BH-XXXX",
    variant: "i-VTEC V",
    technicianName: "Certified Master Inspector Alex",
    bodyStructural: "Attention Required (Front apron and chassis legs repaired, left pillars and roof repaired)",
    accidentalHistory: "Attention Required (Yes, major front-end and left-side impact history found)",
    engineGearbox: "Normal (Clutch is weak but engine/gearbox holds standard operations)",
    waterLogged: "Passed (No flood or water immersion markers found)",
    obdErrors: "Clean (Zero active diagnostic trouble codes)",
    remarks: [
      "Front major accident history found and body chassis repaired (apron and legs).",
      "Left side pillars (A, B, C) and roof repaired with heavy body filler.",
      "Rear left power window motor is dead, needs replacement.",
      "Clutch is very weak and showing slippage under load, needs immediate replacement."
    ],
    obd: {
      status: "Clean",
      codes: [],
    },
    paint: {
      status: "Refinished Panel",
      panels: [
        { name: "Hood", value: 245, original: false }, // Repainted
        { name: "Front Bumper", value: 310, original: false }, // Repainted
        { name: "Left Fender", value: 280, original: false }, // Repainted
        { name: "Right Fender", value: 120, original: true },
        { name: "Left Door", value: 295, original: false }, // Repainted
        { name: "Right Door", value: 118, original: true },
        { name: "Roof", value: 275, original: false }, // Repainted
        { name: "Rear Hatch", value: 220, original: false }, // Repainted
      ],
    },
    checks: [
      {
        category: "Engine Cabin",
        items: [
          { name: "Engine Physical Condition", status: "Pass", desc: "Engine block is dry with no active oil leaks." },
          { name: "Engine Oil Condition", status: "Pass", desc: "Oil is at acceptable level, but showing dark coloration." },
          { name: "Coolant condition", status: "Pass", desc: "Coolant level normal, hoses show standard aging." },
          { name: "Battery Condition", status: "Pass", desc: "Cranking speed normal, battery holds steady charge." },
          { name: "Left Apron structural weld", status: "Pass", desc: "Inner weld appears factory original." },
          { name: "Left Apron Leg structure", status: "Fail", desc: "REPAIRED: Welds and paint overspray found. Major accident repair history." },
          { name: "Right Apron & Leg", status: "Pass", desc: "Original factory structure, free of damage." }
        ]
      },
      {
        category: "Exterior and Body",
        items: [
          { name: "Windshield Glass", status: "Attention", desc: "REPLACED: Front windshield has been replaced with non-OEM glass." },
          { name: "Bonnet cosmetic paint", status: "Attention", desc: "REPLACED & REPAINTED: High paint values (245μm) indicate secondary respray." },
          { name: "Front Bumper alignment", status: "Attention", desc: "REPLACED: Front bumper replaced, bumper brackets have loose fitting." },
          { name: "Fog Lamp assembly", status: "Attention", desc: "DAMAGED: Right fog lamp bracket broken, fitting loose." },
          { name: "Left Side Panels (Fender/Doors)", status: "Attention", desc: "REPAINTED: Painted over thick layers of body filler." },
          { name: "Left Pillars (A / B / C)", status: "Attention", desc: "REPAIRED: Structural repair and straightening history detected on left pillars." },
          { name: "Roof panel structure", status: "Attention", desc: "REPAIRED: Roof shows extensive dent repair and high filler thickness." }
        ]
      },
      {
        category: "Interior",
        items: [
          { name: "Instrument Cluster display", status: "Pass", desc: "All indicator bulbs and cluster screen function properly." },
          { name: "Airconditioner System output", status: "Pass", desc: "A/C cooling is functional, drops to 7.2°C (Good)." },
          { name: "Power Window controls", status: "Fail", desc: "Rear left window is completely inoperative, motor is dead." },
          { name: "Steering Wheel Mount Buttons", status: "Attention", desc: "DAMAGED: Cruise control button is physically broken and stuck." },
          { name: "ORVM mirror switch", status: "Pass", desc: "Electronic mirror adjustment responds normally." },
          { name: "Rear Dicky & bumper paint", status: "Attention", desc: "REPAINTED: Boot door and rear bumper have been refinished." }
        ]
      },
      {
        category: "Test Drive",
        items: [
          { name: "Airbags Visual Inspection", status: "Pass", desc: "SRS cover displays no deployment tears, diagnostics clear." },
          { name: "Clutch engagement", status: "Fail", desc: "WEAK: Clutch pedal feels soft and slips under high load, replacement required." },
          { name: "Brake system & pedal", status: "Pass", desc: "Linear stopping power, ABS actuator cycles without error." },
          { name: "Acceleration & Pickup", status: "Pass", desc: "Engine pulls normally through mid-rev range." },
          { name: "Gear shifting smoothness", status: "Pass", desc: "Manual gear lever shifts into all gears cleanly." },
          { name: "Suspension feedback", status: "Pass", desc: "Normal absorption of road vibrations, no structural play." },
          { name: "Flood immersion indicators", status: "Pass", desc: "No signs of water logging, clean electrical harness." }
        ]
      }
    ],
  },
  {
    id: "REP-911GT3",
    vehicle: "Porsche 911 GT3 (992)",
    year: 2023,
    grade: 98,
    gradeColor: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    package: "Premium",
    city: "Dubai",
    date: "May 18, 2026",
    summary: "Exceptional mechanical and cosmetic condition. The vehicle has been meticulously maintained, showing uniform original paint across all panels. High-speed test drive completed with perfect tracking, zero gearbox lag, and superb carbon ceramic braking deceleration. Drivetrain ECU diagnostics returned zero stored or active codes.",
    vin: "WP0AC2A91NS1911GT",
    odometer: "8,200 km",
    fuelType: "Petrol",
    transmission: "Automatic",
    registrationNumber: "G-911GT3",
    variant: "GT3 Coupe",
    technicianName: "ASE Master Certified (#491-03)",
    bodyStructural: "Passed (100% original panels and carbon aerodynamic structure)",
    accidentalHistory: "Clean (No paint thickness variance, absolute factory state)",
    engineGearbox: "Passed (Perfect PDK oil analysis, zero clutch wear parameters)",
    waterLogged: "Passed (No flood or moisture indicators present)",
    obdErrors: "Clean (Zero stored engine or safety system fault codes)",
    remarks: [
      "Carbon ceramic discs have 92% life remaining.",
      "Titanium sport active exhaust welds and valves fully functional.",
      "Paint thickness is uniform at 105-118μm across all composite panels."
    ],
    obd: {
      status: "Clean",
      codes: [],
    },
    paint: {
      status: "Original",
      panels: [
        { name: "Hood", value: 112, original: true },
        { name: "Front Bumper", value: 108, original: true },
        { name: "Left Fender", value: 115, original: true },
        { name: "Right Fender", value: 110, original: true },
        { name: "Left Door", value: 118, original: true },
        { name: "Right Door", value: 114, original: true },
        { name: "Roof", value: 105, original: true },
        { name: "Rear Hatch", value: 111, original: true },
      ],
    },
    checks: [
      {
        category: "Engine Cabin",
        items: [
          { name: "Engine oil level & quality", status: "Pass", desc: "Oil is fresh and at optimal fill level. No metallic deposits." },
          { name: "Coolant system hold pressure", status: "Pass", desc: "No leaks in radiator, carbon-shrouded hoses, or expansion tank." },
          { name: "Battery & charging output", status: "Pass", desc: "Lightweight lithium battery holds full charge, alternator normal." },
          { name: "Left Apron & strut mount", status: "Pass", desc: "Perfect factory spot welds, zero compression marks." },
          { name: "Right Apron & strut mount", status: "Pass", desc: "Intact composite mounting area, aligned factory sealant." }
        ]
      },
      {
        category: "Exterior and Body",
        items: [
          { name: "Carbon Fiber Bonnet", status: "Pass", desc: "Lightweight hood alignment meets exact factory specs." },
          { name: "Windshield OEM glass", status: "Pass", desc: "Flawless lightweight glass, clear visibility." },
          { name: "Front Bumper Active Aero", status: "Pass", desc: "Under-bumper active cooling flaps cycle without restriction." },
          { name: "LED Matrix Headlights", status: "Pass", desc: "Auto-leveling high beams operate normally." },
          { name: "Paint thickness audit", status: "Pass", desc: "Uniform values (105-118μm) on all aluminum/composite panels." }
        ]
      },
      {
        category: "Interior",
        items: [
          { name: "Instrument Cluster screens", status: "Pass", desc: "Sport Chrono lap timer and display pods function flawlessly." },
          { name: "HVAC cooling & vents", status: "Pass", desc: "Compressor cycles quietly, vent temperature stable at 6.2°C." },
          { name: "Power Window motors", status: "Pass", desc: "Windows glide smoothly without stutter." },
          { name: "Bucket seats carbon weave", status: "Pass", desc: "Nomex fabric and carbon fiber buckets show zero wear." }
        ]
      },
      {
        category: "Test Drive",
        items: [
          { name: "PDK Transmission shifts", status: "Pass", desc: "Lightning fast shifts, clutch pressure parameters are within OEM specs." },
          { name: "Carbon ceramic brake rotors", status: "Pass", desc: "Friction surface is perfectly flat. Brakes at 92% life remaining." },
          { name: "Titanium active sport exhaust", status: "Pass", desc: "Welds solid, electronic sound flaps open fully under throttle." },
          { name: "Airbags & safety systems", status: "Pass", desc: "Self-test passed with full resistance match across bags." },
          { name: "Flood Check & underside panels", status: "Pass", desc: "Complete skid protection covers, zero corrosion on chassis bolts." }
        ]
      }
    ],
  },
];

export default function SampleReportsPage() {
  const [activeReportIndex, setActiveReportIndex] = useState(0);
  const report = SAMPLE_REPORTS[activeReportIndex];

  const handleDownloadPDF = () => {
    toast.success("Preparing Branded PDF", {
      description: "Opening print layout. Select 'Save as PDF' to save your branded inspection report.",
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up blocked", { description: "Please allow pop-ups to download the PDF." });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>AutoInspect_${report.vehicle.replace(/\s+/g, "_")}_Report</title>
          <style>
            @page {
              size: A4;
              margin: 12mm 12mm 15mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              line-height: 1.4;
              font-size: 16px;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header-banner {
              width: 100%;
              border-collapse: collapse;
              background-color: #ffffff;
              border-bottom: 3px solid #0f172a;
              margin-bottom: 20px;
            }
            .header-banner td {
              padding: 10px 0;
              vertical-align: middle;
            }
            .report-id {
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              color: #0f172a;
              text-align: right;
            }
            .section-title {
              font-size: 28px;
              font-weight: bold;
              color: #0f172a;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 4px;
              margin-top: 25px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              page-break-inside: avoid;
            }
            .verdict {
              font-size: 16px;
              color: #1e293b;
              background-color: #f8fafc;
              border-left: 4px solid #0f172a;
              padding: 14px 18px;
              margin-bottom: 20px;
              border-radius: 0 6px 6px 0;
              line-height: 1.6;
              page-break-inside: avoid;
            }
            .specs-table, .status-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #cbd5e1;
              page-break-inside: avoid;
            }
            .specs-table td, .status-table td {
              padding: 10px 14px;
              border-bottom: 1px solid #cbd5e1;
              border-right: 1px solid #cbd5e1;
              font-size: 16px;
            }
            .specs-table td:last-child, .status-table td:last-child {
              border-right: none;
            }
            .specs-label {
              background-color: #f8fafc;
              color: #64748b;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
              width: 25%;
            }
            .specs-val {
              font-weight: bold;
              color: #0f172a;
              width: 25%;
            }
            .remarks-box {
              background-color: #fffbeb;
              border-left: 4px solid #d97706;
              padding: 14px 18px;
              border-radius: 0 6px 6px 0;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .remarks-title {
              color: #b45309;
              font-size: 20px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .remarks-list {
              margin: 6px 0 0 0;
              padding-left: 18px;
              font-size: 16px;
              color: #78350f;
              line-height: 1.5;
            }
            .badge-passed {
              background-color: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              padding: 3px 8px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 14px;
              display: inline-block;
              text-transform: uppercase;
            }
            .badge-attention {
              background-color: #fef2f2;
              color: #b91c1c;
              border: 1px solid #fecaca;
              padding: 3px 8px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 14px;
              display: inline-block;
              text-transform: uppercase;
            }
            .check-list-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #cbd5e1;
              page-break-inside: avoid;
            }
            .check-cat-row {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: bold;
              text-transform: uppercase;
            }
            .check-cat-row td {
              padding: 10px 14px;
              font-size: 20px;
              letter-spacing: 0.5px;
            }
            .check-item-row {
              background-color: #ffffff;
              border-bottom: 1px solid #cbd5e1;
            }
            .check-item-row:nth-child(even) {
              background-color: #f8fafc;
            }
            .check-item-row td {
              padding: 10px 14px;
              vertical-align: top;
            }
            .check-name {
              font-weight: bold;
              color: #1e293b;
              font-size: 16px;
            }
            .check-desc {
              color: #64748b;
              font-size: 14px;
              margin-top: 3px;
            }
            .status-badge {
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
              text-align: center;
              padding: 3px 8px;
              border-radius: 4px;
              display: inline-block;
            }
            .status-pass {
              background-color: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
            }
            .status-attention {
              background-color: #fff7ed;
              color: #c2410c;
              border: 1px solid #ffedd5;
            }
            .status-fail {
              background-color: #fef2f2;
              color: #b91c1c;
              border: 1px solid #fecaca;
            }
            .footer-note {
              text-align: center;
              font-size: 13px;
              color: #64748b;
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              page-break-inside: avoid;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="container">
            
            <!-- HEADER BANNER -->
            <table class="header-banner">
              <tr>
                <td style="width: 33%; text-align: left;">
                  <img src="/newlogo.png" width="110" height="85" style="width: 110px; height: 85px; display: block;" alt="AUTONIQUE INSPECT" />
                </td>
                <td style="width: 33%; text-align: center; vertical-align: middle;">
                  <span style="font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px;">${report.year} ${report.vehicle}</span>
                </td>
                <td class="report-id" style="width: 34%; text-align: right; vertical-align: middle;">
                  REPORT ID: ${report.id}
                </td>
              </tr>
            </table>

            <div class="section-title">01 / VEHICLE DIAGNOSTICS & SYSTEM ASSESSMENT OVERVIEW</div>
            
            <!-- VEHICLE DETAILS -->
            <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
              1. VEHICLE DETAILS
            </div>
            <table class="specs-table">
              <tr>
                <td class="specs-label">Vehicle</td>
                <td class="specs-val">${report.year} ${report.vehicle}</td>
                <td class="specs-label">Inspection Date</td>
                <td class="specs-val">${report.date}</td>
              </tr>
              <tr>
                <td class="specs-label">Variant</td>
                <td class="specs-val">${report.variant || "—"}</td>
                <td class="specs-label">Location</td>
                <td class="specs-val">${report.city}, GCC</td>
              </tr>
              <tr>
                <td class="specs-label">Odometer</td>
                <td class="specs-val">${report.odometer}</td>
                <td class="specs-label">VIN Number</td>
                <td class="specs-val" style="font-family: monospace;">${report.vin}</td>
              </tr>
              <tr>
                <td class="specs-label">Fuel Type</td>
                <td class="specs-val">${report.fuelType}</td>
                <td class="specs-label">Transmission</td>
                <td class="specs-val">${report.transmission}</td>
              </tr>
              <tr>
                <td class="specs-label">Registration No.</td>
                <td class="specs-val" style="font-family: monospace;">${report.registrationNumber}</td>
                <td class="specs-label">Program Package</td>
                <td class="specs-val">${report.package} Service</td>
              </tr>
            </table>

            <!-- EXPERT VERDICT -->
            <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
              2. OVERALL ASSESSMENT
            </div>
            <div class="verdict">
              <strong>EXPERT DIAGNOSTIC VERDICT SUMMARY:</strong><br>
              <span style="font-size: 16px; color: #334155; display: block; margin-top: 6px; line-height: 1.5;">${report.summary}</span>
              <div style="font-weight: bold; margin-top: 10px; font-size: 20px; color: #e11d48;">
                ★ AutoInspect Quality Score: ${report.grade}/100
              </div>
            </div>

            <!-- ATTENTION BOARD -->
            <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
              3. HIGH-LEVEL ATTENTION BOARD
            </div>
            <table class="status-table">
              <tr>
                <td class="specs-label" style="width: 35%; font-size: 16px;">Body & Structural State</td>
                <td>
                  <span class="${report.bodyStructural.toLowerCase().includes("attention") || report.bodyStructural.toLowerCase().includes("repaired") ? "badge-attention" : "badge-passed"}">
                    ${report.bodyStructural.toLowerCase().includes("attention") || report.bodyStructural.toLowerCase().includes("repaired") ? "⚠ ATTENTION" : "✔ PASSED"}
                  </span>
                  <span style="color: #475569; margin-left: 8px; font-size: 16px;">${report.bodyStructural.replace(/passed|clean|attention required/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                </td>
              </tr>
              <tr>
                <td class="specs-label" style="font-size: 16px;">Accidental History</td>
                <td>
                  <span class="${report.accidentalHistory.toLowerCase().includes("attention") || report.accidentalHistory.toLowerCase().includes("repaired") ? "badge-attention" : "badge-passed"}">
                    ${report.accidentalHistory.toLowerCase().includes("attention") || report.accidentalHistory.toLowerCase().includes("repaired") ? "⚠ ATTENTION" : "✔ PASSED"}
                  </span>
                  <span style="color: #475569; margin-left: 8px; font-size: 16px;">${report.accidentalHistory.replace(/passed|clean|attention required/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                </td>
              </tr>
              <tr>
                <td class="specs-label" style="font-size: 16px;">Engine & Gearbox State</td>
                <td>
                  <span class="${report.engineGearbox.toLowerCase().includes("attention") || report.engineGearbox.toLowerCase().includes("weak") ? "badge-attention" : "badge-passed"}">
                    ${report.engineGearbox.toLowerCase().includes("attention") || report.engineGearbox.toLowerCase().includes("weak") ? "⚠ ATTENTION" : "✔ PASSED"}
                  </span>
                  <span style="color: #475569; margin-left: 8px; font-size: 16px;">${report.engineGearbox.replace(/passed|clean|attention required/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                </td>
              </tr>
              <tr>
                <td class="specs-label" style="font-size: 16px;">Water Logged (Flooded)</td>
                <td>
                  <span class="${report.waterLogged.toLowerCase().includes("attention") || report.waterLogged.toLowerCase().includes("yes") ? "badge-attention" : "badge-passed"}">
                    ${report.waterLogged.toLowerCase().includes("attention") || report.waterLogged.toLowerCase().includes("yes") ? "⚠ ATTENTION" : "✔ PASSED"}
                  </span>
                  <span style="color: #475569; margin-left: 8px; font-size: 16px;">${report.waterLogged.replace(/passed|clean|attention required/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                </td>
              </tr>
              <tr>
                <td class="specs-label" style="font-size: 16px;">OBD Scan Diagnostics</td>
                <td>
                  <span class="${report.obdErrors.toLowerCase().includes("attention") || report.obdErrors.toLowerCase().includes("faults") ? "badge-attention" : "badge-passed"}">
                    ${report.obdErrors.toLowerCase().includes("attention") || report.obdErrors.toLowerCase().includes("faults") ? "⚠ ATTENTION" : "✔ CLEAN"}
                  </span>
                  <span style="color: #475569; margin-left: 8px; font-size: 16px;">${report.obdErrors.replace(/passed|clean|attention required/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                </td>
              </tr>
            </table>

            <!-- INSPECTION REMARKS -->
            ${report.remarks && report.remarks.length > 0 ? `
              <div class="remarks-box">
                <span class="remarks-title">INSPECTION EXPERT REMARKS:</span>
                <ul class="remarks-list">
                  ${report.remarks.map(rem => `<li>${rem}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- PAGE BREAK FOR MECHANICAL AUDIT -->
            <div class="page-break"></div>
            
            <table class="header-banner">
              <tr>
                <td style="width: 33%; text-align: left;">
                  <img src="/newlogo.png" width="110" height="85" style="width: 110px; height: 85px; display: block;" alt="AUTONIQUE INSPECT" />
                </td>
                <td style="width: 33%; text-align: center; vertical-align: middle;">
                  <span style="font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 0.5px;">${report.year} ${report.vehicle}</span>
                </td>
                <td class="report-id" style="width: 34%; text-align: right; vertical-align: middle;">
                  REPORT ID: ${report.id}
                </td>
              </tr>
            </table>

            <div class="section-title">02 / DETAILED MECHANICAL AUDIT & CHECKPOINTS</div>

            <table class="check-list-table">
              ${report.checks.map(cat => `
                <tr class="check-cat-row">
                  <td>${cat.category}</td>
                  <td style="width: 100px; text-align: right;">STATUS</td>
                </tr>
                ${cat.items.map(item => `
                  <tr class="check-item-row">
                    <td>
                      <span class="check-name">${item.name}</span>
                      <div class="check-desc">${item.desc}</div>
                    </td>
                    <td style="text-align: right; width: 100px;">
                      <span class="status-badge status-${item.status.toLowerCase()}">
                        ${item.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              `).join('')}
            </table>

            <div class="footer-note">
              This is an official secure document compiled by AutoInspect Network. To verify authentic certification, visit autoinspect.ai/verify?id=${report.id}.<br>
              <strong>ASE Certified Signature:</strong> Signed digitally by ${report.technicianName || "AutoInspect Certified Expert"}.
              <div style="font-size: 11px; margin-top: 8px; text-transform: uppercase; font-weight: bold; color: #94a3b8; letter-spacing: 0.5px;">
                powered by zenelait infotech
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this AutoInspect digital vehicle inspection report for the ${report.year} ${report.vehicle}! Score: ${report.grade}/100. Verification code: ${report.id}. View full diagnostics at: ${window.location.href}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    
    toast.success("Redirecting to WhatsApp", {
      description: "Opening WhatsApp with your customized vehicle report message pre-filled.",
    });
    
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 800);
  };

  return (
    <>
      <PageHeader
        eyebrow="Digital Inspection Showcase"
        title="Interactive Sample Reports"
        subtitle="Explore our exact digital vehicle reports. Switch below to see real results from clean, fair, and attention-needed inspections."
      />

      <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        
        {/* Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {SAMPLE_REPORTS.map((rep, idx) => (
            <button
              key={rep.id}
              onClick={() => setActiveReportIndex(idx)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeReportIndex === idx
                  ? "neon-button text-primary-foreground scale-[1.02]"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <Zap className="h-4 w-4 shrink-0" />
              {rep.vehicle} ({rep.year})
            </button>
          ))}
        </div>

        {/* Selected Interactive Report Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          
          {/* Sidebar Metrics */}
          <div className="space-y-6">
            
            {/* Health Score Card */}
            <div className="glass-card rounded-3xl p-6 text-center space-y-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                AutoInspect Score
              </span>
              <div className="flex items-center justify-center">
                <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 text-4xl font-extrabold shadow-lg ${report.gradeColor}`}>
                  {report.grade}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">{report.vehicle}</h4>
                <p className="text-xs text-muted-foreground mt-1">ID: {report.id}</p>
              </div>
              <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-2 text-left text-xs">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-semibold text-foreground">{report.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-semibold text-foreground">{report.date}</p>
                </div>
                <div className="mt-2">
                  <span className="text-muted-foreground">Package:</span>
                  <p className="font-semibold text-primary">{report.package}</p>
                </div>
                <div className="mt-2">
                  <span className="text-muted-foreground">Year:</span>
                  <p className="font-semibold text-foreground">{report.year}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground mb-1">Actions</h4>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground hover:bg-secondary transition cursor-pointer"
              >
                <Download className="h-4 w-4 text-primary" /> Download Branded PDF
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-medium text-white transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" /> Share on WhatsApp
              </button>
              <Link
                to="/contact"
                search={{ package: report.package } as any}
                className="w-full neon-button flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-primary-foreground cursor-pointer"
              >
                Book This Program
              </Link>
            </div>

            {/* OBD Scan Status */}
            <div className="glass-card rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  OBD-II ECU Scan
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  report.obd.status === "Clean" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {report.obd.status}
                </span>
              </div>
              
              {report.obd.codes.length === 0 ? (
                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>Zero active fault codes detected. Catalytic converters, oxygen sensors, and misfire loops are fully verified.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {report.obd.codes.map((code) => (
                    <div key={code.code} className="p-2.5 rounded-xl border border-border bg-background/50 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-amber-500 font-semibold">{code.code}</span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          code.severity === "High" ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                        }`}>{code.severity} Priority</span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{code.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Report Content */}
          <div className="space-y-6">
            
            {/* Vehicle Specifications Block */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3>Vehicle Specifications</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">VIN Number</span>
                  <p className="font-semibold font-mono text-foreground tracking-wider">{report.vin}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Odometer</span>
                  <p className="font-semibold text-foreground">{report.odometer}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Fuel Type</span>
                  <p className="font-semibold text-foreground">{report.fuelType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Transmission</span>
                  <p className="font-semibold text-foreground">{report.transmission}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Registration</span>
                  <p className="font-semibold font-mono text-foreground">{report.registrationNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Variant</span>
                  <p className="font-semibold text-foreground">{report.variant || "—"}</p>
                </div>
              </div>
            </div>

            {/* High-Level Attention Board */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3>High-Level Attention Board</h3>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { label: "Body & Structural State", val: report.bodyStructural },
                  { label: "Accidental History", val: report.accidentalHistory },
                  { label: "Engine & Gearbox State", val: report.engineGearbox },
                  { label: "Water Logged (Flooded)", val: report.waterLogged },
                  { label: "OBD Scan Report", val: report.obdErrors },
                ].map((area, idx) => {
                  const isAttention = area.val.toLowerCase().includes("attention") || area.val.toLowerCase().includes("repaired") || area.val.toLowerCase().includes("fail") || area.val.toLowerCase().includes("weak");
                  return (
                    <div key={idx} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">{area.label}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${
                          !isAttention 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${!isAttention ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {!isAttention ? "Passed" : "Attention Required"}
                        </span>
                        <span className="text-xs text-muted-foreground">{area.val.replace(/passed|clean|attention required|normal/gi, '').trim().replace(/^\(|\)$/g, '')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Block */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-lg font-bold">Inspector Verdict</h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{report.summary}</p>
            </div>

            {/* Expert Remarks Card */}
            {report.remarks && report.remarks.length > 0 && (
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-bold border-b border-amber-500/10 pb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <h3>Inspection Expert Remarks</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                  {report.remarks.map((remark, idx) => (
                    <li key={idx} className="leading-relaxed">{remark}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Paint Thickness Block */}
            <div className="glass-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3>Paint Thickness Analyzer</h3>
                </div>
                <span className={`text-xs uppercase px-2 py-0.5 rounded font-semibold ${
                  report.paint.status === "Original" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {report.paint.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Measured in micrometers (μm). Factory specification typically ranges between 80μm and 130μm. Readings above 200μm suggest secondary refinishing or filler work.
              </p>
              
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {report.paint.panels.map((p) => (
                  <div key={p.name} className="p-3.5 rounded-2xl border border-border bg-background/30 text-center">
                    <span className="text-xs text-muted-foreground block truncate">{p.name}</span>
                    <span className="text-xl font-bold block mt-1 text-foreground">{p.value === 0 ? "—" : `${p.value} μm`}</span>
                    <span className={`inline-block text-[9px] uppercase font-bold mt-1 px-1.5 rounded ${
                      p.original ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {p.value === 0 ? "Glass" : p.original ? "Factory" : "Repainted"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Inspection Checklist */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3>Detailed Mechanical Audit</h3>
              </div>

              <div className="space-y-6">
                {report.checks.map((cat) => (
                  <div key={cat.category} className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest text-primary font-bold">
                      {cat.category}
                    </h4>
                    <div className="divide-y divide-border/20 border border-border/30 rounded-2xl overflow-hidden bg-background/20">
                      {cat.items.map((item) => (
                        <div key={item.name} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 text-sm hover:bg-secondary/15 transition">
                          <div className="space-y-1">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                          <span className={`inline-flex self-start items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            item.status === "Pass"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : item.status === "Attention"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              item.status === "Pass" ? "bg-emerald-500" : item.status === "Attention" ? "bg-amber-500" : "bg-rose-500"
                            }`} />
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sample Report Details Info Panel */}
        <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">Need a custom diagnostic check?</h4>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Every package includes a certified ASE inspection master, paint diagnostics, digital thickness logs, high-voltage battery scan, diagnostic ECU readings, and direct WhatsApp deliverable links. Get your inspection scheduled today.
            </p>
          </div>
          <Link
            to="/contact"
            className="neon-button shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground w-full md:w-auto text-center"
          >
            Schedule Inspection Now
          </Link>
        </div>

      </section>
    </>
  );
}
