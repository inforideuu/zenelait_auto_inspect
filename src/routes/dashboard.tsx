import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, Fragment } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Filter,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  Users,
  AlertTriangle,
  Plus,
  FileText,
  Upload,
  Gauge,
  Activity,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Sparkles,
  Download,
  Info,
  CheckSquare,
  Play,
  Bell,
  BellOff,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — AutoInspect" },
    ],
  }),
});

interface Booking {
  id: number;
  full_name: string;
  whatsapp_number: string;
  vehicle_model: string;
  city: string;
  inspection_location?: string | null;
  area?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  assigned_staff?: number | null;
  assigned_staff_name?: string | null;
  assigned_staff_email?: string | null;
  package: string;
  notes: string | null;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  accepted_at?: string | null;
  accepted_by?: number | null;
  travel_started_at?: string | null;
  reached_location_at?: string | null;
  inspection_status: string;
  created_at: string;
  updated_at: string;
}

interface InspectionReport {
  id: string;
  user: number;
  assigned_customer_name: string;
  assigned_customer_email: string;
  assigned_customer_phone: string;
  vehicle_model: string;
  year: number;
  grade: number;
  package: string;
  city: string;
  date: string;
  summary: string;
  obd_status: string;
  obd_codes: { code: string; desc: string; severity: 'Low' | 'Medium' | 'High' }[];
  paint_status: string;
  paint_panels: { name: string; value: number; original: boolean }[];
  checks: {
    category: string;
    items: { name: string; status: 'Excellent' | 'Good' | 'Normal' | 'Warning' | 'Need Attention' | 'Damaged' | 'Replaced'; desc: string }[];
    images?: string[];
  }[];
  technician_remarks: string | null;
  disclaimer: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  pdf_file: string | null;
  video_link: string | null;
  images: string[];
  other_references?: string[];
  obd_qr_images?: string[];
  obd_pdf?: string | null;
  obd_video_url?: string | null;
  car_make: string | null;
  registration_number: string | null;
  vin_number: string | null;
  odometer: string | null;
  fuel_type: string | null;
  transmission: string | null;
  body_structural: string | null;
  accidental_history: string | null;
  engine_gearbox: string | null;
  water_logged: string | null;
  obd_errors: string | null;
  variant?: string | null;
  engine_number?: string | null;
  insurance_details?: string | null;
  customer_address?: string | null;
  booking_id?: string | null;
  technician_name?: string | null;
  header_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

const defaultChecklist = [
  {
    category: "Engine Cabin",
    items: [
      { name: "Engine Physical Condition", status: "Normal", desc: "Minor Repaired, Major repaired, Replaced." },
      { name: "Engine Oil Condition", status: "Normal", desc: "Dirty, Low Level." },
      { name: "Coolant", status: "Normal", desc: "Dirty, Oil Max, Dry, Low Level, only water inside, Heavy Rusted." },
      { name: "Battery Condition", status: "Normal", desc: "Weak, Need to recharge, Clamp Missing, Loose connection, Acid leak found." },
      { name: "Fuel Injector", status: "Normal", desc: "Noise, Fuel Leak, Possibilities repair in future." },
      { name: "Left Apron", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Left Apron Leg", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Right Apron", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Right Apron Leg", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Upper Cross Member", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Lower Cross Member", status: "Normal", desc: "Repaired, Minor Rust, Metal eaten rust, Replace, Painted extra." },
      { name: "Radiator and Support", status: "Normal", desc: "Radiator core and fan shroud are secure and undamaged." },
      { name: "Radiator Fan", status: "Normal", desc: "Radiator fan not working, Radiator fan motor noise." },
      { name: "Firewall", status: "Normal", desc: "Repaired, Rust." },
      { name: "Engine Oil Sump", status: "Normal", desc: "Damaged, oil leak." }
    ]
  },
  {
    category: "Exterior and Body",
    items: [
      { name: "Cowltop", status: "Normal", desc: "Plastic cowl trim is secure and free of weathering or cracks." },
      { name: "Windshield", status: "Normal", desc: "Major scratched, Damaged/cracked, Replaced,." },
      { name: "Bonnet", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, paint faded, Repainted, Repaired, Replaced." },
      { name: "Front Bumper", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, paint faded, Repainted, Repaired, Replaced." },
      { name: "Front Bumper Grill", status: "Normal", desc: "Scratched, Damaged, Repaired." },
      { name: "Headlight Left", status: "Normal", desc: "Scratched, Damaged, Repaired, Faded." },
      { name: "Headlight Right", status: "Normal", desc: "Scratched, Damaged, Repaired, Faded." },
      { name: "Fog Lamp Left", status: "Normal", desc: "Normal, Damaged, Missing, Not working, Not available." },
      { name: "Fog Lamp Right", status: "Normal", desc: "Normal, Damaged, Missing, Not working, Not available." },
      { name: "Fender Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, paint faded, Repainted, Repaired, Replaced." },
      { name: "Mirror Assembly Left", status: "Normal", desc: "Damaged/broken, shaken/vibration, Mirror missing." },
      { name: "A Pillar Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Repalced." },
      { name: "B Pillar Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Repalced." },
      { name: "C Pillar Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Left Door Front", status: "Normal", desc: "Minor rust, Major rust, paint faded, Repaired, Repainted, Replaced." },
      { name: "Left Door Rear", status: "Normal", desc: "Minor rust, Major rust, paint faded, Repaired, Repainted, Replaced." },
      { name: "Running Board Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Quarter Panel Left", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Roof Outer", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." }
    ]
  },
  {
    category: "Interior",
    items: [
      { name: "Rear Windshield", status: "Normal", desc: "Major scratched, Cracked, Replaced." },
      { name: "Boot Door (Dicky)", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Rear Bumper", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Boot Floor", status: "Normal", desc: "Minor rust, Major rust, Minor dent found, Major dent found, floor repaired, cracked." },
      { name: "Tool Kit", status: "Normal", desc: "Jack, wheel wrench, and tow hook are present and complete." },
      { name: "Tail Lamp Left", status: "Normal", desc: "Cracked/broken, Faded, water logged." },
      { name: "Tail Lamp Right", status: "Normal", desc: "Cracked/broken, Faded, water logged." },
      { name: "Quarter Panel Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Running Board Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Right Door Rear", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "A Pillar Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "B Pillar Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "C Pillar Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Mirror Assembly Right", status: "Normal", desc: "Damaged/broken, shaken/vibration, Mirror missing." },
      { name: "Fender Right", status: "Normal", desc: "Major scratched, Minor dent, Major dent, Minor rust, Major rust, Paint faded, Repaired, Repainted, Replaced." },
      { name: "Power Window", status: "Normal", desc: "All Windows working normal, front right not working/switch broken,front left not working/switch broken, Rear right not working/switch broken, Rear left not working/switch broken." },
      { name: "normal Power Window Remarks", status: "Normal", desc: "Anti-pinch feature and master switch operates correctly." },
      { name: "ORVM Switch", status: "Normal", desc: "switch not working properly, not available, Damaged." }
    ]
  },
  {
    category: "Test Drive",
    items: [
      { name: "Airbags", status: "Normal", desc: "visual check normal, No airbags." },
      { name: "Instrument Cluster", status: "Normal", desc: "Visual check normal, Display damaged, Glass/lens cracked." },
      { name: "Music System", status: "Normal", desc: "Visual check normal, Display Damaged, Display faded, Speaker not working, steering mount button not working, audio system not working." },
      { name: "Music System Remarks", status: "Normal", desc: "Audio output is balanced across all premium cabin speakers." },
      { name: "Horn", status: "Normal", desc: "Not working, Weak." },
      { name: "Wipers", status: "Normal", desc: "Wiper not working, Wiper blades need to replace, Wiper motors not working." },
      { name: "All Exterior Lamps Working", status: "Normal", desc: "Lh headlamp not working, Rh headlamp not working, Lh fot lamp not working, Rh fog lamp not working." },
      { name: "Interior Seat Condition All seats", status: "Normal", desc: "seat cover damaged/tron, Seat cushions damaged, Seats dirty." },
      { name: "Sunroof", status: "Normal", desc: "Not avaiable, Noise while operating." },
      { name: "Steering Wheel Mount Buttons", status: "Normal", desc: "Not availabe, Not working, Damaged." },
      { name: "Rear Defogger Normal Reverse Camera and Sensor", status: "Normal", desc: "Not available, camera not working, Sensors not working." },
      { name: "Airconditioner System 5°c - 8°c ( Excellent )", status: "Normal", desc: "5c -8c (Excellent), 9c-12c (Normal), 13c - 16c (Below normal), Above 16c (Needs attention), Ac air flow low, Heater not working, Direction mode not working." },
      { name: "Clutch", status: "Normal", desc: "clutch hard, pickup low, weak need replace, Average." },
      { name: "Brakes", status: "Normal", desc: "Brake efficiency low, Brake noisy, Brake Master cylinder leak." },
      { name: "Anti-lock Braking System (ABS)", status: "Normal", desc: "Not available." },
      { name: "Acceleration", status: "Normal", desc: "RPM not raising, RPM fluctuations,." },
      { name: "Handbrake", status: "Normal", desc: "Handbrake loosen, Not working." },
      { name: "Gear Shifting", status: "Normal", desc: "Tight shifting, Gear struck up, Not engagging properly." },
      { name: "Gear Box Paddle Shifters", status: "Normal", desc: "Gear box oil leak, Repaired, Damaged." },
      { name: "Paddle Shifters", status: "Normal", desc: "Damaged, Not working, Not available" },
      { name: "Suspension", status: "Normal", desc: "Minor noise, weak, need attention, Average." },
      { name: "Engine Sound and Vibration", status: "Normal", desc: "Pully noise, Abnormal noise, Misfiring, Vibration high." },
      { name: "Turbo", status: "Normal", desc: "Not available, Not working, Oil leak from turbo, Oil leak from turbo hose, Whistling noise." },
      { name: "Pickup and Performance", status: "Normal", desc: "Pickup low, performance lagging." },
      { name: "General Noise", status: "Normal", desc: "no noise, Body noise, interior rattling noise, some abnormal noise." },
      { name: "All Wheel Bearing", status: "Normal", desc: "Noise found." },
      { name: "Back Compression", status: "Normal", desc: "oil split on 2000rpm, smoke on 2000rpm, oil and smoke in 2000rpm." },
      { name: "Exhaust Pipe and Smoke", status: "Normal", desc: "Damaged, pipe leak, Black smake, While smoke, Grey smoke, Blue smoke, Rusted minor." },
      { name: "Flood Effected / Water Logged", status: "Normal", desc: "Yes, No, Low level logged, Flood suspected." }
    ]
  }
];

const getCheckOptions = (itemName: string, itemDesc?: string) => {
  if (itemDesc) {
    const desc = itemDesc.trim();
    const descLower = desc.toLowerCase();
    // Only parse if it contains a comma and doesn't look like a standard full-sentence remark
    if (desc.includes(",") && 
        !descLower.includes("are present") && 
        !descLower.includes("operates correctly") &&
        !descLower.includes("shroud are secure")) {
      
      const parts = desc.split(",")
        .map(p => p.trim())
        .map(p => p.endsWith(".") ? p.slice(0, -1).trim() : p)
        .filter(p => p.length > 0 && p !== ".");
      
      if (parts.length > 0) {
        const hasNormal = parts.some(p => p.toLowerCase() === "normal");
        const options = hasNormal ? parts : ["Normal", ...parts];
        return options;
      }
    }
  }

  const name = itemName.trim().toLowerCase();

  if (name.includes("engine physical condition")) {
    return ["Normal", "Major Repaired", "Minor Repaired", "Damage Found"];
  }
  if (name.includes("engine oil condition")) {
    return ["Normal", "Dirty", "Low Level"];
  }
  if (name.includes("tail lamp") || name.includes("headlight") || name.includes("fog lamp")) {
    return ["Normal", "Cracked/Broken", "Faded", "Water Logged"];
  }
  if (name.includes("battery")) {
    return ["Normal", "Weak", "Dead", "Corroded Terminals"];
  }
  if (name.includes("coolant")) {
    return ["Normal", "Low Level", "Leaking", "Dirty/Contaminated"];
  }
  if (name.includes("windshield")) {
    return ["Normal", "Chipped", "Cracked", "Scratched"];
  }
  if (
    name.includes("bonnet") || name.includes("roof outer") || name.includes("door") ||
    name.includes("quarter panel") || name.includes("running board") || name.includes("fender")
  ) {
    return ["Normal", "Dented", "Scratched", "Repainted", "Rusted"];
  }
  if (name.includes("bumper")) {
    return ["Normal", "Scratched", "Dented", "Loose/Misaligned", "Cracked"];
  }
  if (name.includes("power window")) {
    return ["Normal", "Slow Operation", "Not Working", "Noisy"];
  }
  if (name.includes("sunroof")) {
    return ["Normal", "Not Opening/Closing", "Leaking", "Squeaking"];
  }
  if (name.includes("airbag")) {
    return ["Normal", "Deployed", "Fault Light On"];
  }
  if (name.includes("airconditioner") || name.includes("air conditioner")) {
    return ["Normal", "Poor Cooling", "No Cooling", "Odor Detected", "Noisy Compressor"];
  }
  if (name.includes("clutch") || name.includes("brake")) {
    return ["Normal", "Hard Clutch", "Slipping Clutch", "Spongy Brakes", "Low Brake Pads"];
  }
  if (name.includes("suspension")) {
    return ["Normal", "Stiff", "Leaking Shocks", "Noisy/Squeaking"];
  }
  if (name.includes("flood") || name.includes("water logged")) {
    return ["Normal", "Minor Dampness", "Severe Water Ingress"];
  }

  return ["Normal", "Warning", "Need Attention", "Damaged", "Replaced"];
};

function DashboardPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "staff" | "user" | null>(null);
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [users, setUsers] = useState<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile?: {
      phone_number?: string;
      city?: string;
      area?: string;
      pincode?: string;
      role?: string;
    };
  }[]>([]);

  // Staff Users State
  const [staffUsers, setStaffUsers] = useState<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile?: {
      phone_number: string;
      city: string;
      area?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
      role: string;
    };
  }[]>([]);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [sUsername, setSUsername] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sFirstName, setSFirstName] = useState("");
  const [sLastName, setSLastName] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sCity, setSCity] = useState("");
  const [sArea, setSArea] = useState("");
  const [sPincode, setSPincode] = useState("");
  const [sLatitude, setSLatitude] = useState("");
  const [sLongitude, setSLongitude] = useState("");
  const [isLocatingCreateStaff, setIsLocatingCreateStaff] = useState(false);

  // Staff Account Editing Sheet/Modal
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editSUsername, setEditSUsername] = useState("");
  const [editSEmail, setEditSEmail] = useState("");
  const [editSFirstName, setEditSFirstName] = useState("");
  const [editSLastName, setEditSLastName] = useState("");
  const [editSPassword, setEditSPassword] = useState("");
  const [editSPhone, setEditSPhone] = useState("");
  const [editSCity, setEditSCity] = useState("");
  const [editSArea, setEditSArea] = useState("");
  const [editSPincode, setEditSPincode] = useState("");
  const [editSLatitude, setEditSLatitude] = useState("");
  const [editSLongitude, setEditSLongitude] = useState("");
  const [isLocatingEditStaff, setIsLocatingEditStaff] = useState(false);

  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Customer Data State
  const [customerReport, setCustomerReport] = useState<InspectionReport | null>(null);

  // Dashboard navigation tab
  const [adminTab, setAdminTab] = useState<"bookings" | "reports" | "staff" | "revenue">("bookings");
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("read_notification_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);

  const markAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      const updated = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem("read_notification_ids", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = (ids: string[]) => {
    setReadNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...ids]));
      localStorage.setItem("read_notification_ids", JSON.stringify(updated));
      return updated;
    });
    toast.success("All notifications marked as read.");
  };

  // Close notifications popover on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notifications-container")) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showNotifications]);

  // Dynamic Notifications Derivation
  const activeNotifications = (() => {
    const storedUserId = localStorage.getItem("autoinspect_user_id");
    if (role === "admin") {
      const localNotifs = bookings
        .filter((b) => b.status === "Pending")
        .map((b) => ({
          id: `booking-${b.id}`,
          title: "New Booking Message",
          description: `${b.full_name} requested ${b.vehicle_model} inspection in ${b.city}.`,
          time: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recently",
          type: "booking",
          payload: b,
          read: readNotificationIds.includes(`booking-${b.id}`)
        }));

      const dbNotifsMapped = dbNotifications.map((n) => ({
        id: `db-${n.id}`,
        title: n.title,
        description: n.description,
        time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recently",
        type: "db-notification",
        payload: n,
        read: readNotificationIds.includes(`db-${n.id}`) || n.is_read
      }));

      return [...dbNotifsMapped, ...localNotifs];
    } else if (role === "staff") {
      return bookings
        .filter((b) => b.status === "Pending" && String(b.assigned_staff) === String(storedUserId))
        .map((b) => ({
          id: `booking-${b.id}`,
          title: "Assigned Inspection Booking",
          description: `${b.full_name} requested ${b.vehicle_model} inspection in ${b.city}. You are the assigned inspector.`,
          time: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recently",
          type: "booking",
          payload: b,
          read: readNotificationIds.includes(`booking-${b.id}`)
        }));
    } else if (role === "user" && customerReport) {
      return [
        {
          id: `report-${customerReport.id}`,
          title: "Diagnostics Report Published",
          description: `Your inspection report for ${customerReport.year} ${customerReport.vehicle_model} is ready with score ${customerReport.grade}/100!`,
          time: customerReport.created_at ? new Date(customerReport.created_at).toLocaleDateString() : "Recently",
          type: "report",
          payload: customerReport,
          read: readNotificationIds.includes(`report-${customerReport.id}`)
        }
      ];
    }
    return [];
  })();

  const unreadNotifications = activeNotifications.filter((n) => !n.read);

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({ is_read: true })
      });
      setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllDbNotificationsRead = async () => {
    const unreadDbNotifs = dbNotifications.filter(n => !n.is_read);
    for (const n of unreadDbNotifs) {
      await handleMarkNotificationRead(n.id);
    }
  };

  const handleNotificationClick = (item: any) => {
    markAsRead(item.id);
    setShowNotifications(false);
    if (item.type === "db-notification") {
      handleMarkNotificationRead(item.payload.id);
      toast.info(`Notification: ${item.title}`);
    } else if (item.type === "booking") {
      setAdminTab("bookings");
      toast.info("Navigated to Bookings tab.");
    } else if (item.type === "report") {
      handleDownloadPDF();
    }
  };

  const renderNotificationBell = () => {
    return (
      <div className="relative notifications-container">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-muted-foreground hover:text-foreground rounded-full border border-border bg-card transition cursor-pointer select-none"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-extrabold text-white items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                {unreadNotifications.length}
              </span>
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border/50 bg-white backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" /> Notifications
              </span>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={async () => {
                    markAllAsRead(activeNotifications.map((n) => n.id));
                    await handleMarkAllDbNotificationsRead();
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground hover:underline transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {activeNotifications.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground space-y-2">
                <BellOff className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs font-medium">All clear! No notifications</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {activeNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 rounded-xl border transition cursor-pointer select-none text-left relative overflow-hidden ${item.read
                      ? "bg-secondary/5 border-border/20 hover:bg-secondary/10"
                      : "bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-[inset_0_0_8px_rgba(225,29,72,0.05)]"
                      }`}
                  >
                    {!item.read && (
                      <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <h5 className={`text-xs font-bold ${item.read ? "text-muted-foreground" : "text-foreground"}`}>
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                      {item.description}
                    </p>
                    <span className="text-[9px] text-muted-foreground/60 mt-1.5 block">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);

  // Create User Form
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [uUsername, setUUsername] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uFirstName, setUFirstName] = useState("");
  const [uLastName, setULastName] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uCity, setUCity] = useState("");

  // Create Report Form
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [showFloatingRemarks, setShowFloatingRemarks] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [rChecks, setRChecks] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [rId, setRId] = useState("");
  const [rUser, setRUser] = useState("");
  const [rModel, setRModel] = useState("");
  const [rYear, setRYear] = useState(new Date().getFullYear());
  const [rGrade, setRGrade] = useState(90);
  const [rPackage, setRPackage] = useState("Premium");
  const [rCity, setRCity] = useState("Dubai");
  const [rSummary, setRSummary] = useState("");
  const [rObdStatus, setRObdStatus] = useState("Clean");
  const [rPaintStatus, setRPaintStatus] = useState("Original");
  const [rRemarks, setRRemarks] = useState("");
  const [rImages, setRImages] = useState<string[]>([]);
  const [rVideoLink, setRVideoLink] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [rOtherReferences, setROtherReferences] = useState<string[]>([]);
  const [isUploadingOtherReferences, setIsUploadingOtherReferences] = useState(false);
  const [rObdQrImages, setRObdQrImages] = useState<string[]>([]);
  const [isUploadingObdQrImages, setIsUploadingObdQrImages] = useState(false);
  const [rObdPdf, setRObdPdf] = useState("");
  const [isUploadingObdPdf, setIsUploadingObdPdf] = useState(false);
  const [rObdVideoUrl, setRObdVideoUrl] = useState("");
  const [isUploadingObdVideo, setIsUploadingObdVideo] = useState(false);
  const [categoryUploadingIndex, setCategoryUploadingIndex] = useState<number | null>(null);
  const [itemUploadingIndex, setItemUploadingIndex] = useState<{ catIdx: number; itemIdx: number } | null>(null);


  // New specifications & safety/structural attention areas states
  const [rCarMake, setRCarMake] = useState("");
  const [rRegNumber, setRRegNumber] = useState("");
  const [rVinNumber, setRVinNumber] = useState("");
  const [rOdometer, setROdometer] = useState("");
  const [rFuelType, setRFuelType] = useState("Petrol");
  const [rTransmission, setRTransmission] = useState("Automatic");
  const [rBodyStructural, setRBodyStructural] = useState("");
  const [rAccidentalHistory, setRAccidentalHistory] = useState("");
  const [rEngineGearbox, setREngineGearbox] = useState("");
  const [rObdErrors, setRObdErrors] = useState("");
  const [rWaterLogged, setRWaterLogged] = useState("");

  // 6 new specifications states
  const [rVariant, setRVariant] = useState("");
  const [rEngineNumber, setREngineNumber] = useState("");
  const [rInsuranceDetails, setRInsuranceDetails] = useState("");
  const [rCustomerAddress, setRCustomerAddress] = useState("");
  const [rBookingId, setRBookingId] = useState("");
  const [rTechnicianName, setRTechnicianName] = useState("");
  const [rHeaderImage, setRHeaderImage] = useState("");
  const [isUploadingHeaderImage, setIsUploadingHeaderImage] = useState(false);

  // Static PDF Upload
  const [selectedReportId, setSelectedReportId] = useState("");
  const [pdfUploadOpen, setPdfUploadOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Authenticate and load role-based data
  useEffect(() => {
    const auth = localStorage.getItem("autoinspect_auth");
    const storedRole = localStorage.getItem("autoinspect_role") as "admin" | "staff" | "user";
    const storedName = localStorage.getItem("autoinspect_user") || "";
    const storedToken = localStorage.getItem("autoinspect_token") || "";

    if (auth !== "true" || !storedRole) {
      toast.error("Unauthorized Access", {
        description: "Please sign in to access your dashboard.",
      });
      navigate({ to: "/login" });
      return;
    }

    setRole(storedRole);
    setUserName(storedName);
    setToken(storedToken);

    // Fetch initial datasets
    const loadData = async () => {
      setLoading(true);
      try {
        if (storedRole === "admin" || storedRole === "staff") {
          // 1. Fetch Bookings
          const bookingsRes = await fetch("http://localhost:8000/api/bookings", {
            headers: { "Authorization": `Token ${storedToken}` }
          });
          if (bookingsRes.ok) {
            const data = await bookingsRes.json();
            setBookings(data);
          }

          // 2. Fetch Reports
          const reportsRes = await fetch("http://localhost:8000/api/reports", {
            headers: { "Authorization": `Token ${storedToken}` }
          });
          if (reportsRes.ok) {
            const data = await reportsRes.json();
            setReports(data);
          }

          // 3. Fetch Users dynamically from the backend auth/users API endpoint
          const usersRes = await fetch("http://localhost:8000/api/auth/users", {
            headers: { "Authorization": `Token ${storedToken}` }
          });
          if (usersRes.ok) {
            const data = await usersRes.json();
            setUsers(data);
          }

          // 4. Fetch Staff accounts if Admin
          // 4. Fetch Staff accounts & notifications if Admin
          if (storedRole === "admin") {
            const staffRes = await fetch("http://localhost:8000/api/auth/staff", {
              headers: { "Authorization": `Token ${storedToken}` }
            });
            if (staffRes.ok) {
              const data = await staffRes.json();
              setStaffUsers(data);
            }

            const notificationsRes = await fetch("http://localhost:8000/api/notifications", {
              headers: { "Authorization": `Token ${storedToken}` }
            });
            if (notificationsRes.ok) {
              const notifsData = await notificationsRes.json();
              setDbNotifications(notifsData);
            }

            const revenueRes = await fetch("http://localhost:8000/api/payments/revenue-stats", {
              headers: { "Authorization": `Token ${storedToken}` }
            });
            if (revenueRes.ok) {
              const revData = await revenueRes.json();
              setRevenueStats(revData);
            }
          }

        } else {
          // Customer flow: fetch reports assigned to current user
          const customerRes = await fetch("http://localhost:8000/api/reports", {
            headers: { "Authorization": `Token ${storedToken}` }
          });
          if (customerRes.ok) {
            const data = await customerRes.json();
            if (data && data.length > 0) {
              setCustomerReport(data[0]); // Load the most recent report
            }
          }

          // Fetch bookings history for payment and status tracking
          const bookingsRes = await fetch("http://localhost:8000/api/bookings", {
            headers: { "Authorization": `Token ${storedToken}` }
          });
          if (bookingsRes.ok) {
            const data = await bookingsRes.json();
            setBookings(data);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Database connection warning", {
          description: "Could not synchronize directly with Django server."
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, refreshCount]);

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Signed Out", {
      description: "You have signed out of your account.",
    });
    navigate({ to: "/login" });
  };

  // ADMIN OPERATIONS

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus as any, updated_at: new Date().toISOString() } : b))
        );
        toast.success(`Booking status updated to ${newStatus}`);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAcceptInspection = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
        toast.success("Inspection Request Accepted successfully!");
        setRefreshCount(c => c + 1);
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to accept inspection request.");
      }
    } catch (err) {
      toast.error("Network error accepting request.");
    }
  };

  const handleRejectInspection = async (id: number) => {
    if (!confirm("Are you sure you want to reject this assigned inspection?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
        toast.success("Inspection Request Rejected and returned to pool.");
        setRefreshCount(c => c + 1);
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to reject inspection request.");
      }
    } catch (err) {
      toast.error("Network error rejecting request.");
    }
  };

  const handleStartTravel = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}/start-travel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
        toast.success("Transit status updated to Travelling!");
        setRefreshCount(c => c + 1);
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to start travel.");
      }
    } catch (err) {
      toast.error("Network error starting travel.");
    }
  };

  const handleReachedLocation = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}/reached-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });
      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b.id === id ? updatedBooking : b));
        toast.success("Arrival status logged successfully!");
        setRefreshCount(c => c + 1);
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to log location arrival.");
      }
    } catch (err) {
      toast.error("Network error logging location arrival.");
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inspection booking?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        toast.success("Booking record deleted successfully");
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/auth/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
          username: sUsername.trim(),
          email: sEmail.trim(),
          first_name: sFirstName.trim(),
          last_name: sLastName.trim(),
          password: sPassword,
          phone_number: sPhone,
          city: sCity,
          area: sArea.trim(),
          pincode: sPincode.trim(),
          latitude: sLatitude ? parseFloat(sLatitude) : null,
          longitude: sLongitude ? parseFloat(sLongitude) : null
        })
      });

      if (res.ok) {
        toast.success("Staff Account Registered Successfully!");
        setCreateStaffOpen(false);
        setRefreshCount(c => c + 1);

        // Reset fields
        setSUsername("");
        setSEmail("");
        setSFirstName("");
        setSLastName("");
        setSPassword("");
        setSPhone("");
        setSCity("");
        setSArea("");
        setSPincode("");
        setSLatitude("");
        setSLongitude("");
      } else {
        const err = await res.json();
        toast.error("Registration Failed", {
          description: Object.values(err).flat().join(" ")
        });
      }
    } catch (err) {
      toast.error("Failed to register staff account");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this staff member?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/auth/staff?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      if (res.ok) {
        toast.success("Staff account deleted successfully.");
        setRefreshCount(c => c + 1);
      } else {
        const err = await res.json();
        toast.error("Deletion failed", {
          description: err.detail || "Could not delete staff member."
        });
      }
    } catch (err) {
      toast.error("Error deleting staff account.");
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;

    try {
      const payload: any = {
        id: editingStaffId,
        username: editSUsername.trim(),
        email: editSEmail.trim(),
        first_name: editSFirstName.trim(),
        last_name: editSLastName.trim(),
        phone_number: editSPhone,
        city: editSCity,
        area: editSArea.trim(),
        pincode: editSPincode.trim(),
        latitude: editSLatitude ? parseFloat(editSLatitude) : null,
        longitude: editSLongitude ? parseFloat(editSLongitude) : null
      };

      if (editSPassword) {
        payload.password = editSPassword;
      }

      const res = await fetch("http://localhost:8000/api/auth/staff", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Staff Account Updated Successfully!");
        setEditStaffOpen(false);
        setEditingStaffId(null);
        setRefreshCount(c => c + 1);
      } else {
        const err = await res.json();
        toast.error("Update Failed", {
          description: Object.values(err).flat().join(" ")
        });
      }
    } catch (err) {
      toast.error("Failed to update staff account");
    }
  };

  const handleEditStaffClick = (staff: any) => {
    setEditingStaffId(staff.id);
    setEditSUsername(staff.username || "");
    setEditSEmail(staff.email || "");
    setEditSFirstName(staff.first_name || "");
    setEditSLastName(staff.last_name || "");
    setEditSPassword("");
    setEditSPhone(staff.profile?.phone_number || "");
    setEditSCity(staff.profile?.city || "");
    setEditSArea(staff.profile?.area || "");
    setEditSPincode(staff.profile?.pincode || "");
    setEditSLatitude(staff.profile?.latitude != null ? String(staff.profile.latitude) : "");
    setEditSLongitude(staff.profile?.longitude != null ? String(staff.profile.longitude) : "");
    setEditStaffOpen(true);
  };

  const handleSendEmail = (report: InspectionReport) => {
    const customerEmail = report.assigned_customer_email || "";
    if (!customerEmail) {
      toast.error("No valid email address associated with this customer profile.");
      return;
    }

    const subject = "Vehicle Inspection Report";
    const body = "Please find the inspection report.";
    // const mailtoUrl = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // window.location.href = mailtoUrl;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank");
    toast.success("Initiated customer email sending options!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImages(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setRImages(prev => [...prev, ...uploadedUrls]);
      toast.success("Images uploaded successfully!");
    }
    setIsUploadingImages(false);
    e.target.value = "";
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingHeaderImage(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setRHeaderImage(data.url);
        toast.success("Header image uploaded successfully!");
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (err) {
      toast.error(`Error uploading ${file.name}`);
    } finally {
      setIsUploadingHeaderImage(false);
      e.target.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingVideo(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setRVideoLink(data.url);
        toast.success("Video uploaded successfully!");
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (err) {
      toast.error(`Error uploading ${file.name}`);
    } finally {
      setIsUploadingVideo(false);
      e.target.value = "";
    }
  };

  const handleCategoryImagesUpload = async (catIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setCategoryUploadingIndex(catIdx);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setRChecks(prev => {
        return prev.map((cat, idx) => {
          if (idx === catIdx) {
            return {
              ...cat,
              images: [...(cat.images || []), ...uploadedUrls]
            };
          }
          return cat;
        });
      });
      toast.success("Category reference images uploaded successfully!");
    }
    setCategoryUploadingIndex(null);
    e.target.value = "";
  };

  const handleRemoveCategoryImage = (catIdx: number, imgIdx: number) => {
    setRChecks(prev => {
      return prev.map((cat, idx) => {
        if (idx === catIdx) {
          return {
            ...cat,
            images: (cat.images || []).filter((_: string, i: number) => i !== imgIdx)
          };
        }
        return cat;
      });
    });
  };

  const handleItemImagesUpload = async (catIdx: number, itemIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setItemUploadingIndex({ catIdx, itemIdx });
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setRChecks(prev => {
        return prev.map((cat, cIdx) => {
          if (cIdx === catIdx) {
            const updatedItems = cat.items.map((item: any, iIdx: number) => {
              if (iIdx === itemIdx) {
                const currentImages = item.images || [];
                return {
                  ...item,
                  images: [...currentImages, ...uploadedUrls]
                };
              }
              return item;
            });
            return {
              ...cat,
              items: updatedItems
            };
          }
          return cat;
        });
      });
      toast.success("Item images uploaded successfully!");
    }
    setItemUploadingIndex(null);
    e.target.value = "";
  };

  const handleRemoveItemImage = (catIdx: number, itemIdx: number, imgIdx: number) => {
    setRChecks(prev => {
      return prev.map((cat, cIdx) => {
        if (cIdx === catIdx) {
          const updatedItems = cat.items.map((item: any, iIdx: number) => {
            if (iIdx === itemIdx && item.images) {
              return {
                ...item,
                images: item.images.filter((_: string, idx: number) => idx !== imgIdx)
              };
            }
            return item;
          });
          return {
            ...cat,
            items: updatedItems
          };
        }
        return cat;
      });
    });
  };

  const handleOtherReferencesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingOtherReferences(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setROtherReferences(prev => [...prev, ...uploadedUrls]);
      toast.success("Other reference images uploaded successfully!");
    }
    setIsUploadingOtherReferences(false);
    e.target.value = "";
  };

  const handleRemoveOtherReference = (idx: number) => {
    setROtherReferences(prev => prev.filter((_, i) => i !== idx));
  };

  const handleObdQrImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingObdQrImages(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setRObdQrImages(prev => [...prev, ...uploadedUrls]);
      toast.success("OBD QR images uploaded successfully!");
    }
    setIsUploadingObdQrImages(false);
    e.target.value = "";
  };

  const handleRemoveObdQrImage = (idx: number) => {
    setRObdQrImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleObdPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingObdPdf(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setRObdPdf(data.url);
        toast.success("OBD PDF report uploaded successfully!");
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (err) {
      toast.error(`Error uploading ${file.name}`);
    } finally {
      setIsUploadingObdPdf(false);
      e.target.value = "";
    }
  };

  const handleObdVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingObdVideo(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Token ${localStorage.getItem("autoinspect_token") || token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setRObdVideoUrl(data.url);
        toast.success("OBD scan video uploaded successfully!");
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (err) {
      toast.error(`Error uploading ${file.name}`);
    } finally {
      setIsUploadingObdVideo(false);
      e.target.value = "";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Excellent":
      case "Good":
      case "Normal":
      case "Pass":
      case "No":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Warning":
      case "Need Attention":
      case "Attention":
      case "Low level logged":
      case "Flood suspected":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Damaged":
      case "Replaced":
      case "Fail":
      case "Yes":
      default:
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
  };

  const handleCheckStatusChange = (catIdx: number, itemIdx: number, newStatus: string) => {
    setRChecks(prev => {
      return prev.map((cat, cIdx) => {
        if (cIdx === catIdx) {
          const updatedItems = cat.items.map((item: any, iIdx: number) => {
            if (iIdx === itemIdx) {
              return { ...item, status: newStatus as any };
            }
            return item;
          });
          return { ...cat, items: updatedItems };
        }
        return cat;
      });
    });
  };

  const handleCheckDescChange = (catIdx: number, itemIdx: number, newDesc: string) => {
    setRChecks(prev => {
      return prev.map((cat, cIdx) => {
        if (cIdx === catIdx) {
          const updatedItems = cat.items.map((item: any, iIdx: number) => {
            if (iIdx === itemIdx) {
              return { ...item, desc: newDesc };
            }
            return item;
          });
          return { ...cat, items: updatedItems };
        }
        return cat;
      });
    });
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rUser) {
      toast.error("Please select a registered customer first.");
      return;
    }

    const paintPanels = [
      { name: "Hood", value: 112, original: true },
      { name: "Front Bumper", value: 108, original: true },
      { name: "Left Fender", value: 115, original: true },
      { name: "Right Fender", value: 110, original: true },
      { name: "Left Door", value: 118, original: true },
      { name: "Right Door", value: 114, original: true },
      { name: "Roof", value: 105, original: true },
      { name: "Rear Hatch", value: 111, original: true },
    ];

    const obdCodes = rObdStatus === "Clean" ? [] : [
      { code: "C1201", desc: "Engine Control System Malfunction (Secondary Wheel Speed Sensor)", severity: "Low" }
    ];

    const parsedImages = rImages;

    const checksToSave = rChecks && rChecks.length > 0
      ? rChecks
      : JSON.parse(JSON.stringify(defaultChecklist));

    const paintPanelsToSave = editingReportId
      ? (reports.find(r => r.id === editingReportId)?.paint_panels || paintPanels)
      : paintPanels;

    const obdCodesToSave = rObdStatus === "Clean" ? [] : (
      editingReportId
        ? (reports.find(r => r.id === editingReportId)?.obd_codes || obdCodes)
        : obdCodes
    );

    try {
      const url = editingReportId
        ? `http://localhost:8000/api/reports/${editingReportId}`
        : "http://localhost:8000/api/reports";
      const method = editingReportId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
          id: rId || `REP-${Math.floor(100000 + Math.random() * 900000)}`,
          user: parseInt(rUser),
          vehicle_model: rModel,
          year: rYear || new Date().getFullYear(),
          grade: rGrade || 0,
          package: rPackage,
          city: rCity,
          summary: rSummary || "Exceptional mechanical and cosmetic condition. The vehicle has been meticulously inspected, showing uniform original paint across all panels. High-speed test drive completed with perfect tracking, zero gearbox lag, and superb braking deceleration.",
          obd_status: rObdStatus,
          obd_codes: obdCodesToSave,
          paint_status: rPaintStatus,
          paint_panels: paintPanelsToSave,
          checks: checksToSave,
          technician_remarks: rRemarks || null,
          status: "Completed",
          video_link: rVideoLink.trim() || null,
          images: parsedImages,
          other_references: rOtherReferences,
          obd_qr_images: rObdQrImages,
          obd_pdf: rObdPdf.trim() || null,
          obd_video_url: rObdVideoUrl.trim() || null,
          car_make: rCarMake.trim() || null,
          registration_number: rRegNumber.trim() || null,
          vin_number: rVinNumber.trim() || null,
          odometer: rOdometer.trim() || null,
          fuel_type: rFuelType || null,
          transmission: rTransmission || null,
          body_structural: rBodyStructural.trim() || null,
          accidental_history: rAccidentalHistory.trim() || null,
          engine_gearbox: rEngineGearbox.trim() || null,
          water_logged: rWaterLogged.trim() || null,
          obd_errors: rObdErrors.trim() || null,
          variant: rVariant.trim() || null,
          engine_number: rEngineNumber.trim() || null,
          insurance_details: rInsuranceDetails.trim() || null,
          customer_address: rCustomerAddress.trim() || null,
          booking_id: rBookingId.trim() || null,
          technician_name: rTechnicianName.trim() || null,
          header_image: rHeaderImage || null
        })
      });

      if (res.ok) {
        toast.success(editingReportId ? "Inspection Report Updated Successfully!" : "Inspection Report Filed Successfully!");
        setCreateReportOpen(false);
        setEditingReportId(null);
        setRefreshCount(c => c + 1);

        // Reset
        setRId("");
        setRUser("");
        setRModel("");
        setRYear(new Date().getFullYear());
        setRGrade(90);
        setRPackage("Premium");
        setRCity("Dubai");
        setRSummary("");
        setRObdStatus("Clean");
        setRPaintStatus("Original");
        setRRemarks("");
        setRImages([]);
        setRVideoLink("");
        setROtherReferences([]);
        setRObdQrImages([]);
        setRObdPdf("");
        setRObdVideoUrl("");
        setRCarMake("");
        setRRegNumber("");
        setRVinNumber("");
        setROdometer("");
        setRFuelType("Petrol");
        setRTransmission("Automatic");
        setRBodyStructural("");
        setRAccidentalHistory("");
        setREngineGearbox("");
        setRObdErrors("");
        setRWaterLogged("");
        setRChecks([]);
        setRVariant("");
        setREngineNumber("");
        setRInsuranceDetails("");
        setRCustomerAddress("");
        setRBookingId("");
        setRTechnicianName("");
        setRHeaderImage("");
      } else {
        const err = await res.json();
        toast.error("Failed filing report", { description: Object.values(err).flat().join(" ") });
      }
    } catch (err) {
      toast.error(editingReportId ? "Error updating report" : "Error creating report");
    }
  };

  const getStatusStepIndex = (statusStr: string) => {
    const steps = [
      'Pending Assignment',
      'Assigned to Staff',
      'Accepted by Staff',
      'Staff Travelling',
      'Inspector Reached Location',
      'Inspection In Progress',
      'Report Generated'
    ];
    const idx = steps.indexOf(statusStr);
    return idx !== -1 ? idx : 0;
  };

  const getInspectionStatusBadgeClass = (statusStr: string) => {
    switch (statusStr) {
      case 'Pending Assignment':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Assigned to Staff':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Accepted by Staff':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Staff Travelling':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Inspector Reached Location':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Inspection In Progress':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20 animate-pulse';
      case 'Report Generated':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-secondary/15 text-muted-foreground border-border/20';
    }
  };

  const formatTimelineTime = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (" + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ")";
    } catch {
      return "";
    }
  };

  const handleStartInspection = (b: Booking) => {
    // Reset all checklist & form states
    setEditingReportId(null);
    setRId(`REP-${b.id}`);

    // Find customer matched user profile by phone or name
    const matchedUser = users.find(
      (u) =>
        (u.profile?.phone_number && u.profile.phone_number.replace(/\D/g, "") === b.whatsapp_number.replace(/\D/g, "")) ||
        (u.first_name && u.last_name && `${u.first_name} ${u.last_name}`.toLowerCase() === b.full_name.toLowerCase()) ||
        u.username.toLowerCase() === b.full_name.toLowerCase().replace(/\s+/g, "")
    );
    setRUser(matchedUser ? String(matchedUser.id) : "");
    setRModel(b.vehicle_model || "");
    setRYear(new Date().getFullYear());
    setRGrade(90);
    setRPackage(b.package || "Premium");
    setRCity(b.city || "Dubai");
    setRSummary("");
    setRObdStatus("Clean");
    setRPaintStatus("Original");
    setRRemarks("");
    setRImages([]);
    setROtherReferences([]);
    setRObdQrImages([]);
    setRObdPdf("");
    setRObdVideoUrl("");
    setRVideoLink("");
    setRCarMake("");
    setRRegNumber("");
    setRVinNumber("");
    setROdometer("");
    setRFuelType("Petrol");
    setRTransmission("Automatic");
    setRBodyStructural("");
    setRAccidentalHistory("");
    setREngineGearbox("");
    setRObdErrors("");
    setRWaterLogged("");

    // New fields
    setRVariant("");
    setREngineNumber("");
    setRInsuranceDetails("");
    setRCustomerAddress(b.inspection_location || "");
    setRBookingId(String(b.id));
    setRTechnicianName(userName || "");
    setRHeaderImage("");

    setRChecks(JSON.parse(JSON.stringify(defaultChecklist)));
    setCreateReportOpen(true);
  };

  const handleEditReport = (report: InspectionReport) => {
    setEditingReportId(report.id);
    setRId(report.id);
    setRUser(report.user.toString());
    setRModel(report.vehicle_model);
    setRYear(report.year);
    setRGrade(report.grade);
    setRPackage(report.package);
    setRCity(report.city);
    setRSummary(report.summary || "");
    setRObdStatus(report.obd_status || "Clean");
    setRPaintStatus(report.paint_status || "Original");
    setRRemarks(report.technician_remarks || "");
    setRImages(report.images || []);
    setROtherReferences(report.other_references || []);
    setRObdQrImages(report.obd_qr_images || []);
    setRObdPdf(report.obd_pdf || "");
    setRObdVideoUrl(report.obd_video_url || "");
    setRVideoLink(report.video_link || "");
    setRCarMake(report.car_make || "");
    setRRegNumber(report.registration_number || "");
    setRVinNumber(report.vin_number || "");
    setROdometer(report.odometer || "");
    setRFuelType(report.fuel_type || "Petrol");
    setRTransmission(report.transmission || "Automatic");
    setRBodyStructural(report.body_structural || "");
    setRAccidentalHistory(report.accidental_history || "");
    setREngineGearbox(report.engine_gearbox || "");
    setRObdErrors(report.obd_errors || "");
    setRWaterLogged(report.water_logged || "");
    setRChecks(report.checks || []);
    setRVariant(report.variant || "");
    setREngineNumber(report.engine_number || "");
    setRInsuranceDetails(report.insurance_details || "");
    setRCustomerAddress(report.customer_address || "");
    setRBookingId(report.booking_id || "");
    setRTechnicianName(report.technician_name || "");
    setRHeaderImage(report.header_image || "");

    setCreateReportOpen(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm(`Are you sure you want to permanently delete the inspection report ${reportId}?`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      if (res.ok) {
        toast.success("Inspection report deleted successfully.");
        setRefreshCount(c => c + 1);
      } else {
        toast.error("Failed to delete inspection report.");
      }
    } catch (err) {
      toast.error("Error deleting inspection report.");
    }
  };

  const handleSendWhatsApp = (report: InspectionReport) => {
    const rawPhone = report.assigned_customer_phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("No valid phone number associated with this customer profile.");
      return;
    }

    const waUrl = `https://wa.me/${cleanPhone}`;
    window.open(waUrl, "_blank");
    toast.success("WhatsApp chat initiated!");
  };

  const handleSendWhatsAppBooking = (booking: any) => {
    const rawPhone = booking.whatsapp_number || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("No valid phone number associated with this booking.");
      return;
    }
    const waUrl = `https://wa.me/${cleanPhone}`;
    window.open(waUrl, "_blank");
    toast.success("WhatsApp chat initiated!");
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !selectedReportId) {
      toast.error("Please choose a file and select a report ID.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", pdfFile);

    try {
      const res = await fetch(`http://localhost:8000/api/reports/${selectedReportId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Token ${token}`
        },
        body: formData
      });

      if (res.ok) {
        toast.success("Branded PDF Uploaded successfully!");
        setPdfUploadOpen(false);
        setRefreshCount(c => c + 1);
        setPdfFile(null);
      } else {
        toast.error("Failed uploading PDF.");
      }
    } catch (err) {
      toast.error("Error during upload.");
    }
  };

  // CUSTOMER OPERATIONS

  const handleDownloadPDF = () => {
    if (!customerReport) return;
    toast.info("Downloading certified A4 PDF Report...");

    // Trigger direct backend PDF render download
    window.open(`http://localhost:8000/api/reports/${customerReport.id}/pdf?auth_token=${token}`, "_blank");
  };

  // Filter computation
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.vehicle_model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.whatsapp_number || "").includes(searchTerm);
    const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCity = cityFilter === "all" || b.city.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesCity;
  });

  if (loading) {
    return (
      <div className="py-36 text-center space-y-4 bg-background">
        <RefreshCw className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading secure portal session...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN VIEW RENDER
  // ----------------------------------------------------
  if (role === "admin" || role === "staff") {
    return (
      <>
        <div className="border-b border-border/40 bg-secondary/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              {role === "admin" ? "Administrator" : "Staff"} Secure Session
            </span>
          </div>
          <div className="flex items-center gap-3">
            {renderNotificationBell()}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-foreground hover:bg-secondary transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        <PageHeader
          eyebrow={role === "admin" ? "Staff Control Center" : "Inspector Control Center"}
          title="Inspection Dashboard"
          subtitle={`Welcome back, ${userName}. Publish detailed vehicle inspection reports, track reservations, and manage diagnostic databases.`}
        />

        <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">

          {/* Admin Booking Notification Banner */}
          {bookings.filter(b => b.status === "Pending").length > 0 && (
            <div className="glass-card border-amber-500/30 bg-amber-500/5 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-amber-500">
                    <AlertTriangle className="h-4 w-4" /> Pending Booking Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You have <span className="font-bold text-foreground">{bookings.filter(b => b.status === "Pending").length}</span> pending vehicle inspection message(s) awaiting verification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdminTab("bookings")}
                className="rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-4 py-1.5 text-xs text-amber-400 font-semibold cursor-pointer transition select-none shrink-0 text-center"
              >
                Review Bookings
              </button>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="grid gap-4 md:grid-cols-3">
            {role === "admin" ? (
              <button
                onClick={() => setCreateStaffOpen(true)}
                className="glass-card rounded-2xl p-5 border text-left hover:scale-[1.01] transition flex items-center gap-4 cursor-pointer"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Register New Staff</h4>
                  <p className="text-xs text-muted-foreground">Create secure staff member credentials.</p>
                </div>
              </button>
            ) : (
              <div className="glass-card rounded-2xl p-5 border text-left flex items-center gap-4 bg-secondary/5 opacity-60">
                <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-muted-foreground text-sm">Staff Management</h4>
                  <p className="text-xs text-muted-foreground/60">Accessible by system administrators only.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                // If users is empty, let's warn
                if (users.length === 0) {
                  toast.warning("Register a customer first before creating a report.");
                }
                // Reset all report states to empty
                setEditingReportId(null);
                setRId("");
                setRUser("");
                setRModel("");
                setRYear(new Date().getFullYear());
                setRGrade(90);
                setRPackage("Premium");
                setRCity("Dubai");
                setRSummary("");
                setRObdStatus("Clean");
                setRPaintStatus("Original");
                setRRemarks("");
                setRImages([]);
                setROtherReferences([]);
                setRObdQrImages([]);
                setRVideoLink("");
                setRCarMake("");
                setRRegNumber("");
                setRVinNumber("");
                setROdometer("");
                setRFuelType("Petrol");
                setRTransmission("Automatic");
                setRBodyStructural("");
                setRAccidentalHistory("");
                setREngineGearbox("");
                setRObdErrors("");
                setRWaterLogged("");
                setRChecks(JSON.parse(JSON.stringify(defaultChecklist)));

                setCreateReportOpen(true);
              }}
              className="glass-card rounded-2xl p-5 border text-left hover:scale-[1.01] transition flex items-center gap-4 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">File Inspection Report</h4>
                <p className="text-xs text-muted-foreground">Add mechanical audits & obd scans to databases.</p>
              </div>
            </button>

            <button
              onClick={() => setPdfUploadOpen(true)}
              className="glass-card rounded-2xl p-5 border text-left hover:scale-[1.01] transition flex items-center gap-4 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Upload Static PDF Report</h4>
                <p className="text-xs text-muted-foreground">Bind a custom manual PDF report to an inspection.</p>
              </div>
            </button>
          </div>

          {/* Form Modal: Create Staff */}
          {createStaffOpen && role === "admin" && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-bold text-foreground">Register Staff Member</h3>
                <form onSubmit={handleCreateStaff} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Username</label>
                      <input
                        required
                        type="text"
                        value={sUsername}
                        onChange={e => setSUsername(e.target.value)}
                        placeholder="john_staff"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Password</label>
                      <input
                        required
                        type="password"
                        value={sPassword}
                        onChange={e => setSPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">First Name</label>
                      <input
                        required
                        type="text"
                        value={sFirstName}
                        onChange={e => setSFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Last Name</label>
                      <input
                        required
                        type="text"
                        value={sLastName}
                        onChange={e => setSLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={sEmail}
                      onChange={e => setSEmail(e.target.value)}
                      placeholder="john.doe@autoguardian.com"
                      className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Phone Number</label>
                      <input
                        required
                        type="text"
                        value={sPhone}
                        onChange={e => setSPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">City</label>
                      <input
                        required
                        type="text"
                        value={sCity}
                        onChange={e => setSCity(e.target.value)}
                        placeholder="Dubai"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Area / Neighborhood</label>
                      <input
                        required
                        type="text"
                        value={sArea}
                        onChange={e => setSArea(e.target.value)}
                        placeholder="Dubai Marina"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Pincode / Postal Code</label>
                      <input
                        required
                        type="text"
                        value={sPincode}
                        onChange={e => setSPincode(e.target.value)}
                        placeholder="00000"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="bg-secondary/5 border border-border/40 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Coordinates (Optional)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLocatingCreateStaff(true);
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setSLatitude(String(pos.coords.latitude));
                              setSLongitude(String(pos.coords.longitude));
                              setIsLocatingCreateStaff(false);
                              toast.success("GPS Coordinates retrieved successfully!");
                            },
                            (err) => {
                              setIsLocatingCreateStaff(false);
                              toast.error("Failed to retrieve GPS location. Please allow permissions.");
                            }
                          );
                        }}
                        className="rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 font-semibold flex items-center gap-1 transition cursor-pointer select-none"
                      >
                        {isLocatingCreateStaff ? "Locating..." : "Locate GPS"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase text-muted-foreground tracking-wider block mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={sLatitude}
                          onChange={e => setSLatitude(e.target.value)}
                          placeholder="25.077"
                          className="w-full bg-background border border-border rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase text-muted-foreground tracking-wider block mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={sLongitude}
                          onChange={e => setSLongitude(e.target.value)}
                          placeholder="55.131"
                          className="w-full bg-background border border-border rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setCreateStaffOpen(false)}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="neon-button rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
                    >
                      Register Staff
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Form Modal: Edit Staff */}
          {editStaffOpen && role === "admin" && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-bold text-foreground">Edit Staff Member Account</h3>
                <form onSubmit={handleUpdateStaff} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Username</label>
                      <input
                        required
                        type="text"
                        value={editSUsername}
                        onChange={e => setEditSUsername(e.target.value)}
                        placeholder="john_staff"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Password (Leave empty to keep current)</label>
                      <input
                        type="password"
                        value={editSPassword}
                        onChange={e => setEditSPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">First Name</label>
                      <input
                        required
                        type="text"
                        value={editSFirstName}
                        onChange={e => setEditSFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Last Name</label>
                      <input
                        required
                        type="text"
                        value={editSLastName}
                        onChange={e => setEditSLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={editSEmail}
                      onChange={e => setEditSEmail(e.target.value)}
                      placeholder="john.doe@autoguardian.com"
                      className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Phone Number</label>
                      <input
                        required
                        type="text"
                        value={editSPhone}
                        onChange={e => setEditSPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">City</label>
                      <input
                        required
                        type="text"
                        value={editSCity}
                        onChange={e => setEditSCity(e.target.value)}
                        placeholder="Dubai"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Area / Neighborhood</label>
                      <input
                        required
                        type="text"
                        value={editSArea}
                        onChange={e => setEditSArea(e.target.value)}
                        placeholder="Dubai Marina"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Pincode / Postal Code</label>
                      <input
                        required
                        type="text"
                        value={editSPincode}
                        onChange={e => setEditSPincode(e.target.value)}
                        placeholder="00000"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                  <div className="bg-secondary/5 border border-border/40 p-3 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">Coordinates (Optional)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLocatingEditStaff(true);
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setEditSLatitude(String(pos.coords.latitude));
                              setEditSLongitude(String(pos.coords.longitude));
                              setIsLocatingEditStaff(false);
                              toast.success("GPS Coordinates retrieved successfully!");
                            },
                            (err) => {
                              setIsLocatingEditStaff(false);
                              toast.error("Failed to retrieve GPS location. Please allow permissions.");
                            }
                          );
                        }}
                        className="rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 font-semibold flex items-center gap-1 transition cursor-pointer select-none"
                      >
                        {isLocatingEditStaff ? "Locating..." : "Locate GPS"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase text-muted-foreground tracking-wider block mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editSLatitude}
                          onChange={e => setEditSLatitude(e.target.value)}
                          placeholder="25.077"
                          className="w-full bg-background border border-border rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase text-muted-foreground tracking-wider block mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editSLongitude}
                          onChange={e => setEditSLongitude(e.target.value)}
                          placeholder="55.131"
                          className="w-full bg-background border border-border rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => {
                        setEditStaffOpen(false);
                        setEditingStaffId(null);
                      }}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="neon-button rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Form Modal: Create Report */}
          {createReportOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
              <div className="relative w-full max-w-lg">
                <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full space-y-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-lg font-bold text-foreground">{editingReportId ? `Edit Diagnostics Report — ${editingReportId}` : "File Vehicle Diagnostics Report"}</h3>
                  <form onSubmit={handleCreateReport} className="space-y-3.5">

                    <div className="border-b border-border/40 pb-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">1. Basic Vehicle Specifications</h4>
                    </div>

                    {/* Repositioned Gallery Images Upload Block */}
                    <div className="bg-secondary/10 border border-border/40 p-4 rounded-2xl space-y-3 mt-2 mb-3">
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block font-bold">Upload Inspection Photos (Gallery)</label>
                      <div className="space-y-3">
                        {/* Image Preview Grid */}
                        {rImages.length > 0 && (
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 border border-border/40 p-2.5 rounded-xl bg-background/50">
                            {rImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                                <img src={imgUrl} alt={`Uploaded preview ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setRImages(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up text-primary"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.81 0L14 15" /><path d="m14 8 .71-.71a1 1 0 0 1 1.4 0l.71.71" /><path d="m16 7 3-3 3 3" /><path d="M19 4v12" /><circle cx="9" cy="9" r="2" /></svg>
                            <span>{isUploadingImages ? "Uploading..." : "Upload Photo(s)"}</span>
                            <input
                              type="file"
                              multiple
                              accept="*/*"
                              onChange={handleImageUpload}
                              disabled={isUploadingImages}
                              className="hidden"
                            />
                          </label>
                          {isUploadingImages && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          )}
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {rImages.length} photo(s) selected
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Single Header Image Upload Block (Optional) */}
                    <div className="bg-secondary/10 border border-border/40 p-4 rounded-2xl space-y-3 mt-2 mb-3">
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block font-bold">Upload Header Image (Optional)</label>
                      <div className="space-y-3">
                        {/* Image Preview */}
                        {rHeaderImage && (
                          <div className="relative aspect-video max-h-36 rounded-xl overflow-hidden border border-border group w-full bg-background/50">
                            <img src={rHeaderImage} alt="Header Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setRHeaderImage("")}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up text-primary"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.81 0L14 15" /><path d="m14 8 .71-.71a1 1 0 0 1 1.4 0l.71.71" /><path d="m16 7 3-3 3 3" /><path d="M19 4v12" /><circle cx="9" cy="9" r="2" /></svg>
                            <span>{isUploadingHeaderImage ? "Uploading..." : "Upload Header Image"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeaderImageUpload}
                              disabled={isUploadingHeaderImage}
                              className="hidden"
                            />
                          </label>
                          {isUploadingHeaderImage && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          )}
                          {rHeaderImage ? (
                            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Header Image Selected
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              No header image selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Assigned Customer</label>
                      <select
                        required
                        value={rUser}
                        disabled={!!editingReportId}
                        onChange={e => setRUser(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground disabled:opacity-50"
                      >
                        <option value="">-- Choose Customer --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Car Make (Optional)</label>
                        <input
                          type="text"
                          value={rCarMake}
                          onChange={e => setRCarMake(e.target.value)}
                          placeholder="Porsche"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Vehicle Model</label>
                        <input

                          type="text"
                          value={rModel}
                          onChange={e => setRModel(e.target.value)}
                          placeholder="Porsche 911 GT3 (992)"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Year</label>
                        <input
                          required
                          type="number"
                          value={rYear}
                          onChange={e => setRYear(parseInt(e.target.value) || new Date().getFullYear())}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Car Registration (Optional)</label>
                        <input
                          type="text"
                          value={rRegNumber}
                          onChange={e => setRRegNumber(e.target.value)}
                          placeholder="K-9110"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">VIN Number (Optional)</label>
                        <input
                          type="text"
                          value={rVinNumber}
                          onChange={e => setRVinNumber(e.target.value)}
                          placeholder="WP0ZZZ99Z..."
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Odometer Reading (Optional)</label>
                        <input
                          type="text"
                          value={rOdometer}
                          onChange={e => setROdometer(e.target.value)}
                          placeholder="14,200 km"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Fuel Type</label>
                        <select
                          value={rFuelType}
                          onChange={e => setRFuelType(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Electric">Electric</option>
                          <option value="Other">Other / N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Transmission</label>
                        <select
                          value={rTransmission}
                          onChange={e => setRTransmission(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                        >
                          <option value="Automatic">Automatic</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Grade (0-100)</label>
                      <input
                        required
                        type="number"
                        value={rGrade}
                        onChange={e => setRGrade(parseInt(e.target.value) || 0)}
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                      />
                    </div> */}
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Package</label>
                        <select
                          value={rPackage}
                          onChange={e => setRPackage(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                        >
                          <option value="Premium">Premium</option>
                          <option value="Standard">Standard</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">City</label>
                        <input
                          required
                          type="text"
                          value={rCity}
                          onChange={e => setRCity(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Variant (e.g. GT3 RS)</label>
                        <input
                          type="text"
                          value={rVariant}
                          onChange={e => setRVariant(e.target.value)}
                          placeholder="GT3 RS"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Engine Number</label>
                        <input
                          type="text"
                          value={rEngineNumber}
                          onChange={e => setREngineNumber(e.target.value)}
                          placeholder="ENG-87654321"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Booking ID Reference</label>
                        <input
                          type="text"
                          value={rBookingId}
                          onChange={e => setRBookingId(e.target.value)}
                          placeholder="B-5432"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Assigned Inspector/Technician</label>
                        <input
                          type="text"
                          value={rTechnicianName}
                          onChange={e => setRTechnicianName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Insurance Details</label>
                      <input
                        type="text"
                        value={rInsuranceDetails}
                        onChange={e => setRInsuranceDetails(e.target.value)}
                        placeholder="AXA Comprehensive - Exp 12/2026"
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>
                    {/* <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Customer Address</label>
                    <textarea
                      value={rCustomerAddress}
                      onChange={e => setRCustomerAddress(e.target.value)}
                      placeholder="123 Marina Blvd, Dubai Marina, Dubai, UAE"
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none text-foreground"
                    />
                  </div> */}

                    <div className="border-b border-border/40 pb-2 pt-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">2. Safety & Structural Attention Areas (Optional)</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Body & Structural State</label>
                        <textarea
                          value={rBodyStructural}
                          onChange={e => setRBodyStructural(e.target.value)}
                          placeholder="Passed. Uniform body alignments."
                          rows={2}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Accidental History</label>
                        <textarea
                          value={rAccidentalHistory}
                          onChange={e => setRAccidentalHistory(e.target.value)}
                          placeholder="Clean title, factory original paint panels."
                          rows={2}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Engine & Gearbox Performance</label>
                        <textarea
                          value={rEngineGearbox}
                          onChange={e => setREngineGearbox(e.target.value)}
                          placeholder="No active powertrain codes. Gear shifts are crisp."
                          rows={2}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">OBD Scan Errors Details</label>
                        <textarea
                          value={rObdErrors}
                          onChange={e => setRObdErrors(e.target.value)}
                          placeholder="Zero logged diagnostic codes found."
                          rows={2}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Water Logged Status</label>
                      <textarea
                        value={rWaterLogged}
                        onChange={e => setRWaterLogged(e.target.value)}
                        placeholder="Passed. Footwells and trunk are completely dry."
                        rows={2}
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div className="border-b border-border/40 pb-2 pt-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">3. Mechanical Checklist (4 Verified Categories)</h4>
                    </div>

                    <div className="space-y-2 border border-border/30 rounded-2xl p-3 bg-secondary/5">
                      {rChecks && rChecks.length > 0 ? (
                        rChecks.map((cat, catIdx) => {
                          const isExpanded = expandedCategory === cat.category;
                          return (
                            <div key={cat.category} className="border border-border/20 rounded-xl overflow-hidden bg-card">
                              <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                                className="w-full bg-background/50 px-4 py-3 flex items-center justify-between text-xs font-bold text-foreground hover:bg-secondary/15 transition text-left"
                              >
                                <span>{cat.category}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                                  {cat.items.length} checks
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="p-3 bg-neutral-900/40 divide-y divide-border/20 space-y-3.5 pb-4">
                                  {cat.items.map((item: any, itemIdx: number) => (
                                    <div key={item.name} className="pt-3.5 first:pt-0 space-y-2 text-xs">
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-foreground">{item.name}</span>
                                        <select
                                          value={item.status}
                                          onChange={(e) => handleCheckStatusChange(catIdx, itemIdx, e.target.value)}
                                          className="bg-background border border-border rounded-lg py-1 px-2 text-[11px] outline-none text-foreground font-bold"
                                        >
                                          {getCheckOptions(item.name, item.desc).map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      {/* <input
                                        type="text"
                                        value={item.desc}
                                        onChange={(e) => handleCheckDescChange(catIdx, itemIdx, e.target.value)}
                                        placeholder="Diagnostic details..."
                                        className="w-full bg-background border border-border rounded-lg py-1.5 px-2.5 text-[11px] outline-none text-muted-foreground focus:border-primary"
                                      /> */}

                                      {/* Item-level images */}
                                      <div className="space-y-1.5 mt-1.5 pl-1">
                                        {(item.images || []).length > 0 && (
                                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1.5 border border-border/20 p-2 rounded-xl bg-background/30 mb-1.5">
                                            {(item.images || []).map((imgUrl: string, imgIdx: number) => (
                                              <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden border border-border/40 group">
                                                <img src={imgUrl} alt={`${item.name} preview`} className="w-full h-full object-cover" />
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemoveItemImage(catIdx, itemIdx, imgIdx)}
                                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150 cursor-pointer"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center justify-center gap-1.5 px-2.5 py-1 border border-dashed border-border/60 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-[10px] font-semibold select-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                            <span>
                                              {itemUploadingIndex?.catIdx === catIdx && itemUploadingIndex?.itemIdx === itemIdx
                                                ? "Uploading..."
                                                : "Add Photos"}
                                            </span>
                                            <input
                                              type="file"
                                              multiple
                                              accept="image/*"
                                              onChange={(e) => handleItemImagesUpload(catIdx, itemIdx, e)}
                                              disabled={itemUploadingIndex?.catIdx === catIdx && itemUploadingIndex?.itemIdx === itemIdx}
                                              className="hidden"
                                            />
                                          </label>
                                          {itemUploadingIndex?.catIdx === catIdx && itemUploadingIndex?.itemIdx === itemIdx && (
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                                          )}
                                          <span className="text-[9px] text-muted-foreground font-medium">
                                            {(item.images || []).length} photo(s) (optional)
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Category Reference Images */}
                                  <div className="pt-4 border-t border-border/20 space-y-2 text-xs">
                                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block font-bold">
                                      {cat.category} Reference Images
                                    </label>

                                    {(cat.images || []).length > 0 && (
                                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 border border-border/40 p-2.5 rounded-xl bg-background/50 mb-2">
                                        {(cat.images || []).map((imgUrl: string, imgIdx: number) => (
                                          <div key={imgIdx} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                                            <img src={imgUrl} alt="Category preview" className="w-full h-full object-cover" />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveCategoryImage(catIdx, imgIdx)}
                                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-[11px] font-semibold select-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                        <span>{categoryUploadingIndex === catIdx ? "Uploading..." : "Upload Image(s)"}</span>
                                        <input
                                          type="file"
                                          multiple
                                          accept="*/*"
                                          onChange={(e) => handleCategoryImagesUpload(catIdx, e)}
                                          disabled={categoryUploadingIndex === catIdx}
                                          className="hidden"
                                        />
                                      </label>
                                      {categoryUploadingIndex === catIdx && (
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                                      )}
                                      <span className="text-[10px] text-muted-foreground font-semibold">
                                        {(cat.images || []).length} reference image(s)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground py-2 text-center">No checklist data found. Checklist will auto-generate upon saving.</p>
                      )}
                    </div>

                    <div className="border-b border-border/40 pb-2 pt-2">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">4. Overall Assessment & Media Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">OBD-II Status</label>
                        <select
                          value={rObdStatus}
                          onChange={e => setRObdStatus(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                        >
                          <option value="Clean">Clean</option>
                          <option value="Faults Detected">Faults Detected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Paint Analyzer</label>
                        <select
                          value={rPaintStatus}
                          onChange={e => setRPaintStatus(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                        >
                          <option value="Original">Original</option>
                          <option value="Refinished Panel">Refinished Panel</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Inspector Verdict Summary</label>
                      <textarea
                        value={rSummary}
                        onChange={e => setRSummary(e.target.value)}
                        placeholder="Meticulously inspected, showing uniform factory paint. No active fault codes..."
                        rows={3}
                        className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                      />
                    </div>
                    {/* <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Inspector Remarks (Optional)</label>
                    <textarea
                      value={rRemarks}
                      onChange={e => setRRemarks(e.target.value)}
                      placeholder="Additional technician insights on structural integrity..."
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none"
                    />
                  </div> */}
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Walkaround Video</label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={rVideoLink}
                            onChange={e => setRVideoLink(e.target.value)}
                            placeholder="Paste video URL (YouTube/Loom) or upload below"
                            className="flex-1 bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                          />
                          {rVideoLink && (
                            <button
                              type="button"
                              onClick={() => setRVideoLink("")}
                              className="px-3 py-2 text-xs font-medium text-red-500 hover:text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video text-primary"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                            <span>{isUploadingVideo ? "Uploading..." : "Upload Video File"}</span>
                            <input
                              type="file"
                              accept="*/*"
                              onChange={handleVideoUpload}
                              disabled={isUploadingVideo}
                              className="hidden"
                            />
                          </label>
                          {isUploadingVideo && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          )}
                          {rVideoLink && !isUploadingVideo && (
                            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* OBD report (QR, PDF, Video) Upload Block */}
                    <div className="bg-secondary/10 border border-border/40 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase text-muted-foreground tracking-wider block font-bold">OBD Report & Attachments</label>
                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Diagnostic Hub</span>
                      </div>

                      {/* Section 1: OBD QR Images */}
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-semibold text-foreground/80 block">1. OBD QR Code Images</span>

                        {/* Image Preview Grid */}
                        {rObdQrImages.length > 0 && (
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 border border-border/40 p-2.5 rounded-xl bg-background/50">
                            {rObdQrImages.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                <img src={imgUrl} alt={`OBD QR preview ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveObdQrImage(idx)}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h4v4H7zm10 0h-4v4h4zM7 17h4v-4H7zm10-2v2h-2v-2h2zm-2-2v2h-2v-2h2zm2 0v2h2v-2h-2zm-4-4v2h2v-2h-2z" /></svg>
                            <span>{isUploadingObdQrImages ? "Uploading..." : "Upload OBD QR(s)"}</span>
                            <input
                              type="file"
                              multiple
                              accept="*/*"
                              onChange={handleObdQrImagesUpload}
                              disabled={isUploadingObdQrImages}
                              className="hidden"
                            />
                          </label>
                          {isUploadingObdQrImages && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          )}
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {rObdQrImages.length} QR code(s) selected
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/30 my-2" />

                      {/* Section 2: OBD Report PDF */}
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-semibold text-foreground/80 block">2. OBD Report PDF File</span>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={rObdPdf}
                              onChange={e => setRObdPdf(e.target.value)}
                              placeholder="Paste OBD PDF URL or upload a file below"
                              className="flex-1 bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                            />
                            {rObdPdf && (
                              <button
                                type="button"
                                onClick={() => setRObdPdf("")}
                                className="px-3 py-2 text-xs font-medium text-red-500 hover:text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                              <span>{isUploadingObdPdf ? "Uploading..." : "Upload OBD PDF"}</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleObdPdfUpload}
                                disabled={isUploadingObdPdf}
                                className="hidden"
                              />
                            </label>
                            {isUploadingObdPdf && (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                            )}
                            {rObdPdf && !isUploadingObdPdf && (
                              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                PDF Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/30 my-2" />

                      {/* Section 3: OBD Scan Video */}
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-semibold text-foreground/80 block">3. OBD Live Scan Video URL</span>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={rObdVideoUrl}
                              onChange={e => setRObdVideoUrl(e.target.value)}
                              placeholder="Paste OBD Video URL or upload a file below"
                              className="flex-1 bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
                            />
                            {rObdVideoUrl && (
                              <button
                                type="button"
                                onClick={() => setRObdVideoUrl("")}
                                className="px-3 py-2 text-xs font-medium text-red-500 hover:text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                              <span>{isUploadingObdVideo ? "Uploading..." : "Upload OBD Video File"}</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleObdVideoUpload}
                                disabled={isUploadingObdVideo}
                                className="hidden"
                              />
                            </label>
                            {isUploadingObdVideo && (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                            )}
                            {rObdVideoUrl && !isUploadingObdVideo && (
                              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                Video Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other References Upload Block */}
                    <div className="bg-secondary/10 border border-border/40 p-4 rounded-2xl space-y-3">
                      <label className="text-[10px] uppercase text-muted-foreground tracking-wider block font-bold">Other References</label>
                      <div className="space-y-3">
                        {/* Image Preview Grid */}
                        {rOtherReferences.length > 0 && (
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 border border-border/40 p-2.5 rounded-xl bg-background/50">
                            {rOtherReferences.map((imgUrl, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                                <img src={imgUrl} alt={`Other reference preview ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOtherReference(idx)}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border/80 rounded-xl bg-card hover:bg-secondary cursor-pointer transition text-xs font-semibold select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up text-primary"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.81 0L14 15" /><path d="m14 8 .71-.71a1 1 0 0 1 1.4 0l.71.71" /><path d="m16 7 3-3 3 3" /><path d="M19 4v12" /><circle cx="9" cy="9" r="2" /></svg>
                            <span>{isUploadingOtherReferences ? "Uploading..." : "Upload Other Reference(s)"}</span>
                            <input
                              type="file"
                              multiple
                              accept="*/*"
                              onChange={handleOtherReferencesUpload}
                              disabled={isUploadingOtherReferences}
                              className="hidden"
                            />
                          </label>
                          {isUploadingOtherReferences && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          )}
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {rOtherReferences.length} image(s) selected
                          </span>
                        </div>
                      </div>
                    </div>


                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateReportOpen(false);
                          setEditingReportId(null);
                        }}
                        className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="neon-button rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
                      >
                        {editingReportId ? "Update Report" : "Save & Publish Report"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Floating Inspector Remarks Panel (Active when creating/editing report, absolute to the card!) */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] flex flex-col items-end max-w-[calc(100vw-32px)]">
                  {showFloatingRemarks && (
                    <div className="mb-3 w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-250 select-none">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Point-by-Point Remarks
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFloatingRemarks(false)}
                          className="text-[10px] text-muted-foreground hover:text-foreground font-bold cursor-pointer transition"
                        >
                          Hide
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Type your remarks below. Every sentence (separated by a period or newline) will be automatically listed point-by-point in the downloaded A4 PDF report.
                      </p>
                      <textarea
                        value={rRemarks}
                        onChange={(e) => setRRemarks(e.target.value)}
                        placeholder="Tyre year expired, replacement recommended. Rear brake pads thin. Engine oil dirty..."
                        rows={4}
                        className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs outline-none focus:border-primary resize-none text-foreground"
                      />
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>{(rRemarks || "").split(/[.\n]/).filter(Boolean).length} bullet(s) ready</span>
                        <span className="font-semibold text-primary">Live PDF Sync Active</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowFloatingRemarks(!showFloatingRemarks)}
                    className={`p-3.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition duration-300 hover:scale-105 cursor-pointer border select-none relative ${showFloatingRemarks
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border hover:bg-secondary text-primary"
                      }`}
                    title="Open Quick Bullet Remarks"
                  >
                    {/* Pulsing indicator */}
                    {(!rRemarks || rRemarks.trim() === "") && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" x2="15" y1="10" y2="10" /><line x1="12" x2="12" y1="7" y2="13" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal: Upload PDF */}
          {pdfUploadOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="glass-card rounded-3xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-bold text-foreground">Upload Manual PDF Report</h3>
                <form onSubmit={handleUploadPdf} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Target Inspection ID</label>
                    <select
                      required
                      value={selectedReportId}
                      onChange={e => setSelectedReportId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs outline-none text-foreground"
                    >
                      <option value="">-- Choose Report --</option>
                      {reports.map(r => (
                        <option key={r.id} value={r.id}>{r.id} — {r.vehicle_model} ({r.assigned_customer_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider block mb-1">Report PDF File</label>
                    <input
                      required
                      type="file"
                      accept=".pdf"
                      onChange={e => setPdfFile(e.target.files?.[0] || null)}
                      className="w-full bg-background border border-border rounded-xl py-2 px-3 text-xs outline-none text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setPdfUploadOpen(false)}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-secondary cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="neon-button rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
                    >
                      Upload PDF
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Navigation Tab Header */}
          <div className="flex items-center gap-3 border-b border-border/40 pb-2">
            <button
              onClick={() => setAdminTab("bookings")}
              className={`pb-2 px-3 text-sm font-semibold transition cursor-pointer border-b-2 ${adminTab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Client Bookings
            </button>
            <button
              onClick={() => setAdminTab("reports")}
              className={`pb-2 px-3 text-sm font-semibold transition cursor-pointer border-b-2 ${adminTab === "reports" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Inspection Reports
            </button>
            {role === "admin" && (
              <button
                onClick={() => setAdminTab("staff")}
                className={`pb-2 px-3 text-sm font-semibold transition cursor-pointer border-b-2 ${adminTab === "staff" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Staff Accounts
              </button>
            )}
            {role === "admin" && (
              <button
                onClick={() => setAdminTab("revenue")}
                className={`pb-2 px-3 text-sm font-semibold transition cursor-pointer border-b-2 ${adminTab === "revenue" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Revenue & Payments
              </button>
            )}
          </div>

          {/* Tab Content: Bookings */}
          {adminTab === "bookings" && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search bookings by customer name or vehicle model..."
                    className="w-full rounded-xl border border-border bg-background/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-border bg-background/20 px-3 py-2 text-xs outline-none text-foreground"
                  >
                    <option className="bg-neutral-900" value="all">All Statuses</option>
                    <option className="bg-neutral-900" value="pending">Pending</option>
                    <option className="bg-neutral-900" value="confirmed">Confirmed</option>
                    <option className="bg-neutral-900" value="completed">Completed</option>
                    <option className="bg-neutral-900" value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => setRefreshCount(c => c + 1)}
                    className="p-2.5 rounded-xl border border-border bg-background/30 hover:bg-secondary text-foreground transition cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                {filteredBookings.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    No matching client bookings found in databases.
                  </div>
                ) : role === "staff" ? (
                  <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 bg-neutral-950/20">
                    {filteredBookings.map((b) => {
                      const currentIdx = getStatusStepIndex(b.inspection_status);
                      const existingReport = reports.find(r => String(r.booking_id) === String(b.id));
                      const currentUserId = localStorage.getItem("autoinspect_user_id");

                      return (
                        <div key={b.id} className="glass-card border border-border/40 hover:border-primary/30 transition-all duration-300 p-6 rounded-3xl space-y-6 flex flex-col justify-between bg-gradient-to-br from-card to-secondary/5 relative overflow-hidden group shadow-lg hover:shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
                          {/* Top accent glow */}
                          <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                          <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-primary tracking-wider px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                                  {b.package} Plan
                                </span>
                                <h3 className="font-bold text-foreground text-base mt-2 tracking-tight group-hover:text-primary transition duration-300">
                                  {b.vehicle_model}
                                </h3>
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getInspectionStatusBadgeClass(b.inspection_status || "Assigned to Staff")}`}>
                                {b.inspection_status || "Assigned to Staff"}
                              </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border/40 w-full" />

                            {/* Section: Customer Details */}
                            <div className="space-y-2.5 text-left">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Customer & Contact</span>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{b.full_name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{b.whatsapp_number}</p>
                                </div>
                                <button
                                  onClick={() => handleSendWhatsAppBooking(b)}
                                  className="h-9 w-9 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition border border-emerald-500/20 cursor-pointer"
                                  title="Chat on WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </button>
                              </div>
                            </div>

                            {/* Section: Location & Coordinates */}
                            <div className="space-y-2 text-left">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Inspection Venue</span>
                              <div className="space-y-1.5 bg-neutral-950/20 border border-border/30 p-3 rounded-2xl">
                                {b.inspection_location ? (
                                  <p className="text-xs text-foreground font-medium flex items-start gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                    <span>{b.inspection_location}</span>
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    No physical location provided
                                  </p>
                                )}
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 pl-5">
                                  <span className="font-bold text-[10px] text-foreground">{b.city}</span>
                                  {b.area && <span>• {b.area}</span>}
                                  {b.pincode && <span>• {b.pincode}</span>}
                                </p>
                                {b.latitude != null && b.longitude != null && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] font-mono text-primary font-bold hover:underline flex items-center gap-1 pl-5 mt-1"
                                    title="Open in Google Maps"
                                  >
                                    GPS Coordinates: {b.latitude.toFixed(5)}, {b.longitude.toFixed(5)}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Section: Special Notes */}
                            {b.notes && (
                              <div className="space-y-1 bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl text-left">
                                <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block">Special Notes</span>
                                <p className="text-xs text-muted-foreground leading-normal">{b.notes}</p>
                              </div>
                            )}

                            {/* Section: Workflow Timeline */}
                            <div className="space-y-3 pt-2 text-left">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block">Inspection Progress</span>
                              <div className="relative pl-4 space-y-3.5 border-l border-border/40 ml-1.5">
                                {(() => {
                                  const stepsList = [
                                    { name: "Assigned to Staff", label: "Assigned", time: b.created_at, idx: 1 },
                                    { name: "Accepted by Staff", label: "Accepted", time: b.accepted_at, idx: 2 },
                                    { name: "Staff Travelling", label: "Travelling", time: b.travel_started_at, idx: 3 },
                                    { name: "Inspector Reached Location", label: "Reached Venue", time: b.reached_location_at, idx: 4 },
                                    { name: "Inspection In Progress", label: "In Progress (Auditing)", time: null, idx: 5 },
                                    { name: "Report Generated", label: "Report Published", time: null, idx: 6 }
                                  ];

                                  return stepsList.map((step) => {
                                    const isDone = currentIdx >= step.idx;
                                    const isCurrent = b.inspection_status === step.name ||
                                      (step.name === "Assigned to Staff" && b.inspection_status === "Pending Assignment");

                                    return (
                                      <div key={step.idx} className="relative text-left">
                                        {/* Stepper node circle */}
                                        <span className={`absolute -left-[20.5px] top-0.5 rounded-full flex items-center justify-center transition-all ${isDone
                                          ? "h-3.5 w-3.5 bg-emerald-500 border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                          : isCurrent
                                            ? "h-3.5 w-3.5 bg-primary border-2 border-background animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                                            : "h-3 w-3 bg-neutral-900 border border-border"
                                          }`} />

                                        <div className="flex items-center justify-between">
                                          <p className={`text-xs font-semibold ${isDone ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground/60"
                                            }`}>
                                            {step.label}
                                          </p>
                                          {step.time && isDone && (
                                            <span className="text-[9px] font-mono text-muted-foreground/80">
                                              {formatTimelineTime(step.time)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Card Actions Footer */}
                          <div className="pt-4 border-t border-border/40 flex flex-col gap-2 mt-4">
                            {(() => {
                              const status = b.inspection_status || "Pending Assignment";
                              const isUnassigned = !b.assigned_staff;
                              const isAssignedToMe = String(b.assigned_staff) === String(currentUserId);

                              if (status === "Assigned to Staff" || status === "Pending Assignment" || status === "Pending") {
                                if (isUnassigned) {
                                  return (
                                    <button
                                      onClick={() => handleAcceptInspection(b.id)}
                                      className="w-full text-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 py-3 text-xs font-bold transition duration-200 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-[1.01]"
                                    >
                                      Claim & Accept Inspection
                                    </button>
                                  );
                                } else if (isAssignedToMe) {
                                  return (
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleAcceptInspection(b.id)}
                                        className="w-full text-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 py-2.5 text-xs font-bold text-emerald-400 hover:text-white transition duration-200 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectInspection(b.id)}
                                        className="w-full text-center rounded-xl bg-rose-500/5 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 py-2.5 text-xs font-bold text-rose-500 hover:text-white transition duration-200 cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="w-full bg-secondary/10 border border-border/30 rounded-xl py-3 text-center">
                                      <span className="text-xs font-bold text-muted-foreground uppercase">Assigned to another inspector</span>
                                    </div>
                                  );
                                }
                              } else if (status === "Accepted by Staff") {
                                return (
                                  <button
                                    onClick={() => handleStartTravel(b.id)}
                                    className="w-full text-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-3 text-xs font-bold transition duration-200 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)] hover:scale-[1.01]"
                                  >
                                    Start Travel
                                  </button>
                                );
                              } else if (status === "Staff Travelling") {
                                return (
                                  <button
                                    onClick={() => handleReachedLocation(b.id)}
                                    className="w-full text-center rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 py-3 text-xs font-bold transition duration-200 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.01]"
                                  >
                                    Reached Location
                                  </button>
                                );
                              } else if (status === "Inspector Reached Location" || status === "Inspection In Progress") {
                                const isInProgress = status === "Inspection In Progress";
                                return (
                                  <button
                                    onClick={() => {
                                      if (existingReport) {
                                        handleEditReport(existingReport);
                                      } else {
                                        handleStartInspection(b);
                                      }
                                    }}
                                    className={`w-full text-center rounded-xl py-3 text-xs font-bold transition duration-200 cursor-pointer hover:scale-[1.01] ${isInProgress
                                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.2)] animate-pulse"
                                      : "bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                      }`}
                                  >
                                    {existingReport ? (isInProgress ? "Continue Report Audit" : "Continue Inspection") : "Start Inspection"}
                                  </button>
                                );
                              } else if (status === "Report Generated") {
                                return (
                                  <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-3 text-center flex items-center justify-center gap-1.5 shadow-[inset_0_0_8px_rgba(16,185,129,0.1)]">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-500 tracking-wide uppercase">Inspection Completed</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/40 bg-secondary/15 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Customer Details</th>
                          <th className="px-6 py-4">Vehicle Model</th>
                          <th className="px-6 py-4">Inspection Address</th>
                          <th className="px-6 py-4">Staff Assignment</th>
                          <th className="px-6 py-4">Live Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {filteredBookings.map((b) => (
                          <Fragment key={b.id}>
                            <tr className="hover:bg-secondary/10 transition">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-semibold text-foreground text-sm">{b.full_name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <p className="text-xs text-muted-foreground">{b.whatsapp_number}</p>
                                  <button
                                    onClick={() => handleSendWhatsAppBooking(b)}
                                    className="text-emerald-500 hover:text-emerald-400 p-0.5 rounded transition hover:bg-emerald-500/10 inline-flex items-center justify-center cursor-pointer"
                                    title="Chat on WhatsApp"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square text-emerald-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-foreground text-sm">{b.vehicle_model}</p>
                                <span className="text-[10px] uppercase font-bold text-primary">{b.package} Plan</span>
                              </td>
                              <td className="px-6 py-4 text-xs space-y-1 text-muted-foreground">
                                {b.inspection_location ? (
                                  <p className="text-foreground font-medium">{b.inspection_location}</p>
                                ) : null}
                                <p className="flex items-center gap-1.5">
                                  <span className="font-bold text-[10px] text-foreground">{b.city}</span>
                                  {b.area && <span>• {b.area}</span>}
                                  {b.pincode && <span>• {b.pincode}</span>}
                                </p>
                                {b.latitude != null && b.longitude != null ? (
                                  <p className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                                    {b.latitude.toFixed(5)}, {b.longitude.toFixed(5)}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-6 py-4 text-sm text-foreground">
                                {role === "admin" ? (
                                  <select
                                    value={b.assigned_staff || ""}
                                    onChange={async (e) => {
                                      const val = e.target.value;
                                      const staffId = val ? parseInt(val) : null;
                                      try {
                                        const response = await fetch(`http://localhost:8000/api/bookings/${b.id}`, {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Token ${token}`
                                          },
                                          body: JSON.stringify({ assigned_staff: staffId }),
                                        });
                                        if (response.ok) {
                                          const updatedData = await response.json();
                                          setBookings((prev) =>
                                            prev.map((item) => (item.id === b.id ? {
                                              ...item,
                                              assigned_staff: staffId,
                                              assigned_staff_name: updatedData.assigned_staff_name,
                                              assigned_staff_email: updatedData.assigned_staff_email,
                                              inspection_status: updatedData.inspection_status || item.inspection_status
                                            } : item))
                                          );
                                          toast.success("Staff assignment manually updated!");
                                        } else {
                                          throw new Error();
                                        }
                                      } catch (err) {
                                        toast.error("Failed to update staff assignment");
                                      }
                                    }}
                                    className="w-full bg-background border border-border rounded-lg py-1 px-2 text-xs outline-none text-foreground font-semibold"
                                  >
                                    <option value="">Unassigned</option>
                                    {staffUsers.map((su) => (
                                      <option key={su.id} value={su.id}>
                                        {su.first_name} {su.last_name} ({su.profile?.city || "Any"})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div>
                                    <p className="font-semibold text-sm">{b.assigned_staff_name || "Unassigned"}</p>
                                    {b.assigned_staff_email && (
                                      <p className="text-[10px] text-muted-foreground">{b.assigned_staff_email}</p>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border w-fit ${getInspectionStatusBadgeClass(b.inspection_status || "Pending Assignment")}`}>
                                    {b.inspection_status || "Pending Assignment"}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-semibold">
                                    Resv: <span className="font-bold text-foreground">{b.status}</span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Info Accordion Trigger Button */}
                                  <button
                                    onClick={() => setExpandedBookingId(expandedBookingId === b.id ? null : b.id)}
                                    className={`p-1.5 rounded transition cursor-pointer ${expandedBookingId === b.id
                                      ? "text-primary bg-primary/15"
                                      : "text-muted-foreground hover:text-primary hover:bg-secondary"
                                      }`}
                                    title="View Live Workflow Timeline"
                                  >
                                    <Info className="h-4 w-4" />
                                  </button>
                                  {role === "admin" && (
                                    <>
                                      <select
                                        value={b.status}
                                        onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none"
                                      >
                                        <option className="bg-neutral-900" value="Pending">Pending</option>
                                        <option className="bg-neutral-900" value="Confirmed">Confirmed</option>
                                        <option className="bg-neutral-900" value="Completed">Completed</option>
                                        <option className="bg-neutral-900" value="Cancelled">Cancelled</option>
                                      </select>
                                      <button
                                        onClick={() => handleDeleteBooking(b.id)}
                                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded transition cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {/* Accordion timeline row */}
                            {expandedBookingId === b.id && (
                              <tr className="bg-secondary/5 border-b border-border/20">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="bg-neutral-950/45 rounded-2xl border border-border/40 p-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                                        <Activity className="h-3.5 w-3.5 text-primary animate-pulse" /> Live Inspection Tracker Timeline
                                      </h4>
                                      <span className="text-[10px] text-muted-foreground">
                                        Booking ID: <span className="font-mono text-primary font-bold">#{b.id}</span>
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                                      {(() => {
                                        const currentIdx = getStatusStepIndex(b.inspection_status);
                                        const timelineSteps = [
                                          { label: "Assigned", desc: "Inspection assigned", active: currentIdx >= 1, time: b.created_at },
                                          { label: "Accepted", desc: "Staff accepted", active: currentIdx >= 2, time: b.accepted_at },
                                          { label: "Travelling", desc: "Staff in transit", active: currentIdx >= 3, time: b.travel_started_at },
                                          { label: "Arrived", desc: "Arrived at venue", active: currentIdx >= 4, time: b.reached_location_at },
                                          { label: "Auditing", desc: "Inspection auditing", active: currentIdx >= 5, time: null },
                                          { label: "Completed", desc: "Report published", active: currentIdx >= 6, time: null }
                                        ];

                                        return timelineSteps.map((step, idx) => (
                                          <div
                                            key={idx}
                                            className={`relative p-3.5 rounded-xl border flex flex-col justify-between h-28 transition ${step.active
                                              ? "bg-primary/5 border-primary/20 shadow-[0_4px_12px_rgba(225,29,72,0.05)]"
                                              : "bg-secondary/5 border-border/10 opacity-40"
                                              }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className={`text-[10px] font-bold uppercase tracking-wider ${step.active ? "text-primary" : "text-muted-foreground"}`}>
                                                {step.label}
                                              </span>
                                              {step.active ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" />
                                              ) : (
                                                <div className="h-3 w-3 rounded-full border border-border" />
                                              )}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                              <p className="text-[10px] text-muted-foreground leading-normal font-medium">{step.desc}</p>
                                              {step.time && (
                                                <p className="text-[9px] font-mono text-primary font-bold mt-1">
                                                  {formatTimelineTime(step.time)}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Inspection Reports */}
          {adminTab === "reports" && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                {reports.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    No diagnostics reports filed yet. Click "File Inspection Report" to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/40 bg-secondary/15 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Report ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Vehicle Model</th>
                          <th className="px-6 py-4">Inspection Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {reports.map((r) => (
                          <tr key={r.id} className="hover:bg-secondary/10 transition">
                            <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{r.id}</td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-foreground text-sm">{r.assigned_customer_name}</p>
                              <p className="text-xs text-muted-foreground">{r.assigned_customer_email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-foreground text-sm">{r.year} {r.vehicle_model}</p>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">{r.package} Package</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{r.date}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`http://localhost:8000/api/reports/${r.id}/pdf?auth_token=${token}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-muted-foreground hover:text-indigo-400 rounded transition hover:bg-indigo-500/10 inline-flex items-center justify-center"
                                  title="Download Report PDF"
                                >
                                  <Download className="h-3.5 w-3.5 text-indigo-400" />
                                </a>
                                <button
                                  onClick={() => handleSendWhatsApp(r)}
                                  className="p-1.5 text-muted-foreground hover:text-emerald-500 rounded transition hover:bg-emerald-500/10 inline-flex items-center justify-center"
                                  title="Share to WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square text-emerald-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleSendEmail(r)}
                                  className="p-1.5 text-muted-foreground hover:text-orange-500 rounded transition hover:bg-orange-500/10 inline-flex items-center justify-center"
                                  title="Email Report to Customer"
                                >
                                  <Mail className="h-3.5 w-3.5 text-orange-500" />
                                </button>
                                <button
                                  onClick={() => handleEditReport(r)}
                                  className="p-1.5 text-muted-foreground hover:text-primary rounded transition hover:bg-primary/10 inline-flex items-center justify-center"
                                  title="Edit Report"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil text-primary"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(r.id)}
                                  className="p-1.5 text-muted-foreground hover:text-rose-500 rounded transition hover:bg-rose-500/10 inline-flex items-center justify-center"
                                  title="Delete Report"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Staff Accounts */}
          {adminTab === "staff" && role === "admin" && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-foreground text-sm">Register and Manage Employee Accounts</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Control systems permissions for car inspectors and desk agents.</p>
                </div>
                <button
                  onClick={() => setCreateStaffOpen(true)}
                  className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-semibold cursor-pointer transition select-none flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(225,29,72,0.25)]"
                >
                  <Plus className="h-4 w-4" /> Add Staff Member
                </button>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                {staffUsers.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    No staff member accounts registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/40 bg-secondary/15 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Name & Title</th>
                          <th className="px-6 py-4">Email Address</th>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">Territory/Location Scope</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {staffUsers.map((s) => (
                          <tr key={s.id} className="hover:bg-secondary/10 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-foreground text-sm">{s.first_name} {s.last_name}</p>
                              <span className="text-[9px] uppercase font-bold text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {s.profile?.role || "Staff"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">{s.email}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{s.profile?.phone_number || "Not Specified"}</td>
                            <td className="px-6 py-4 text-xs text-muted-foreground space-y-0.5">
                              <p className="font-semibold text-foreground">{s.profile?.city || "Not Specified"}</p>
                              {s.profile?.area || s.profile?.pincode ? (
                                <p className="text-[10px]">
                                  {s.profile?.area && `${s.profile.area}`}
                                  {s.profile?.pincode && ` (${s.profile.pincode})`}
                                </p>
                              ) : null}
                              {s.profile?.latitude != null && s.profile?.longitude != null ? (
                                <p className="text-[9px] font-mono text-muted-foreground/60">
                                  GPS: {s.profile.latitude.toFixed(5)}, {s.profile.longitude.toFixed(5)}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditStaffClick(s)}
                                  className="p-2 text-muted-foreground hover:text-primary rounded transition hover:bg-primary/10 inline-flex items-center justify-center"
                                  title="Edit Staff Member"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil text-primary"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(s.id)}
                                  className="p-2 text-muted-foreground hover:text-rose-500 rounded transition hover:bg-rose-500/10 inline-flex items-center justify-center"
                                  title="Delete Staff Member"
                                >
                                  <Trash2 className="h-4 w-4 text-rose-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {adminTab === "revenue" && role === "admin" && (
            <div className="space-y-6 text-left">
              {/* Stat Cards Container */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-card rounded-3xl p-6 border text-left flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-card to-emerald-500/5 relative overflow-hidden group shadow-lg border-border/40">
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition duration-300" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Gross Revenue</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight flex items-baseline">
                      <span className="text-emerald-500 mr-1.5 font-bold text-2xl">₹</span>
                      {revenueStats?.total_revenue ? revenueStats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-2">Total payments captured securely via Razorpay</p>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border text-left flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group shadow-lg border-border/40">
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-xl group-hover:bg-primary/20 transition duration-300" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Transactions</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">
                      {revenueStats?.total_transactions || 0}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-2">Successful checkouts processed & verified</p>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border text-left flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-card to-indigo-500/5 relative overflow-hidden group shadow-lg border-border/40">
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition duration-300" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Average Order Value</span>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight flex items-baseline">
                      <span className="text-indigo-400 mr-1.5 font-bold text-2xl">₹</span>
                      {revenueStats?.average_order_value ? revenueStats.average_order_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-2">Average gross value per booked inspection</p>
                  </div>
                </div>
              </div>

              {/* Package Distribution Metrics */}
              {revenueStats?.package_distribution && revenueStats.package_distribution.length > 0 && (
                <div className="glass-card rounded-3xl p-6 border text-left space-y-4 border-border/40">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Package Metrics & Popularity
                  </span>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                    {(() => {
                      const totalCount = revenueStats.package_distribution.reduce((acc: number, p: any) => acc + p.count, 0) || 1;
                      return revenueStats.package_distribution.map((dist: any) => {
                        const percent = Math.round((dist.count / totalCount) * 100);
                        return (
                          <div key={dist.package} className="p-4 rounded-2xl border border-border bg-background/30 flex flex-col justify-between min-h-[100px] hover:border-primary/45 transition">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{dist.package}</span>
                              <span className="text-xl font-bold block mt-1.5 text-foreground">{dist.count} Bookings</span>
                            </div>
                            <div className="w-full bg-secondary/15 h-1.5 rounded-full mt-3.5 overflow-hidden">
                              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1.5 block font-semibold text-right">{percent}% share</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Recent Payments Ledger */}
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-border/40">
                <div className="p-5 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Secure Payment History Ledger</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time audit log of all financial transactions verified by AutoInspect cryptographic signatures.</p>
                  </div>
                  <button
                    onClick={() => setRefreshCount(c => c + 1)}
                    className="p-2.5 rounded-xl border border-border bg-background/30 hover:bg-secondary text-foreground transition cursor-pointer"
                    title="Synchronize Payment History"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                {!revenueStats?.recent_payments || revenueStats.recent_payments.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    No transaction history logged yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border/40 bg-secondary/15 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Transaction Date</th>
                          <th className="px-6 py-4">Booking Ref</th>
                          <th className="px-6 py-4">Customer Details</th>
                          <th className="px-6 py-4">Razorpay Reference IDs</th>
                          <th className="px-6 py-4">Total Amount</th>
                          <th className="px-6 py-4 text-right">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {revenueStats.recent_payments.map((p: any) => (
                          <tr key={p.id} className="hover:bg-secondary/10 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs font-mono">
                              {p.transaction_date ? new Date(p.transaction_date).toLocaleString('en-IN', { hourCycle: 'h23', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-primary font-bold">
                              {p.booking_id || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-foreground text-xs sm:text-sm">{p.customer_name || "Anonymous Customer"}</p>
                            </td>
                            <td className="px-6 py-4 space-y-0.5 text-[10px] text-muted-foreground font-mono">
                              <p><span className="font-bold text-foreground/75">Order:</span> {p.razorpay_order_id || "N/A"}</p>
                              {p.razorpay_payment_id && <p><span className="font-bold text-foreground/75">Pay ID:</span> {p.razorpay_payment_id}</p>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground text-xs sm:text-sm">
                              {p.currency || "INR"} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                p.payment_status === "Paid"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : p.payment_status === "Pending"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }`}>
                                {p.payment_status === "Paid" ? <CheckCircle2 className="h-3 w-3" /> : null}
                                {p.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </section>
      </>
    );
  }

  // ----------------------------------------------------
  // CUSTOMER VIEW RENDER
  // ----------------------------------------------------
  return (
    <>
      <div className="border-b border-border/40 bg-secondary/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Secure Client Workspace
          </span>
        </div>
        <div className="flex items-center gap-3">
          {renderNotificationBell()}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <PageHeader
        eyebrow="My Account"
        title="Vehicle Inspection Portal"
        subtitle={`Welcome back, ${userName}. Track your vehicle inspection status, view live mechanical audits, and download diagnostic reports.`}
      />

      <section className="mx-auto max-w-7xl px-6 py-10 space-y-8">

        {/* Customer Bookings and Payments History */}
        {bookings && bookings.length > 0 && (
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Bookings & Payments Center
            </span>
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-background/25">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/10 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="px-5 py-3">Booking ID</th>
                    <th className="px-5 py-3">Vehicle Details</th>
                    <th className="px-5 py-3">Package</th>
                    <th className="px-5 py-3">Payment Status</th>
                    <th className="px-5 py-3">Inspection Status</th>
                    <th className="px-5 py-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-secondary/5 transition">
                      <td className="px-5 py-4 font-mono font-bold text-foreground">
                        {b.booking_id || `BKG-${b.id}`}
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">{b.vehicle_model}</td>
                      <td className="px-5 py-4 text-muted-foreground">{b.package}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.inspection_status === "Report Generated" || b.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                        }`}>
                          {b.inspection_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`http://localhost:8000/api/payments/download-invoice/${b.booking_id || `BKG-${b.id}`}?auth_token=${token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold transition hover:scale-[1.02] border border-primary/20 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Invoice PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Certified Report Completed Banner */}
        {customerReport && (
          <div className="glass-card border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-background/10 to-background/5 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Zap className="h-6 w-6 fill-emerald-500/10 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Certified Report Ready
                </span>
                <h4 className="font-bold text-foreground text-sm mt-0.5">
                  Your Diagnostics Verification Certificate is Complete!
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Technical audit for your <span className="font-semibold text-foreground">{customerReport.year} {customerReport.vehicle_model}</span> has been processed and signed off by our experts.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer transition select-none hover:scale-[1.02] active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)] shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Download Report PDF
            </button>
          </div>
        )}

        {!customerReport ? (
          <div className="glass-card rounded-3xl p-10 text-center space-y-4">
            <Clock className="mx-auto h-12 w-12 text-amber-500 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground">No inspection report published yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our technicians are currently preparing your vehicle diagnostic score, paint analysis and OBD logs. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_2.5fr]">

            {/* Left Sidebar Details */}
            <div className="space-y-6">

              {/* Inspection Timeline / Status tracker */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block border-b border-border/40 pb-2">
                  Inspection Process Tracker
                </span>

                <div className="relative pl-6 space-y-6">
                  {/* Vertical bar */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border/40" />

                  {[
                    { title: "Booking Received", desc: "Inspection details registered in core system.", checked: true },
                    { title: "Inspection in Progress", desc: "Technicians analyzing chassis, drivetrain & electricals.", checked: customerReport.status === "In Progress" || customerReport.status === "Completed" },
                    { title: "Completed & Verified", desc: "Certified report published. Digital PDF ready.", checked: customerReport.status === "Completed" }
                  ].map((step, idx) => (
                    <div key={step.title} className="relative flex gap-3">
                      <div className={`absolute -left-6 flex h-5.5 w-5.5 items-center justify-center rounded-full border text-[10px] font-bold ${step.checked ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40" : "bg-card text-muted-foreground border-border"
                        }`}>
                        {step.checked ? "✓" : idx + 1}
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${step.checked ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</h5>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Details Card */}
              <div className="glass-card rounded-3xl p-6 text-center space-y-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Vehicle Details
                </span>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{customerReport.year} {customerReport.vehicle_model}</h4>
                  <p className="text-xs text-muted-foreground mt-1">ID: {customerReport.id}</p>
                </div>
                <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-2 text-left text-xs">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-semibold text-foreground">{customerReport.city}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-semibold text-foreground">{customerReport.date}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground">Package:</span>
                    <p className="font-semibold text-primary">{customerReport.package} Plan</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-semibold text-emerald-500">{customerReport.status}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic PDF Download */}
              <div className="glass-card rounded-3xl p-5">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full neon-button flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-primary-foreground cursor-pointer hover:scale-[1.01] transition"
                >
                  <Download className="h-4 w-4" /> Download Certified A4 PDF
                </button>
              </div>

              {/* Dynamic Video Walkaround */}
              {customerReport.video_link && (
                <div className="glass-card rounded-3xl p-5 space-y-3 border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Play className="h-5 w-5 animate-pulse fill-primary/20" />
                    <h4 className="text-sm">Video Walkaround</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Watch our certified inspector conduct a comprehensive live walkaround audit of this vehicle.
                  </p>
                  <a
                    href={customerReport.video_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold text-foreground cursor-pointer hover:scale-[1.01] transition border border-border/60"
                  >
                    <Play className="h-3 w-3 fill-foreground" /> Watch Video Demonstration
                  </a>
                </div>
              )}

              {/* OBD Report (QR) for Customer */}
              {customerReport.obd_qr_images && customerReport.obd_qr_images.length > 0 && (
                <div className="glass-card rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h4v4H7zm10 0h-4v4h4zM7 17h4v-4H7zm10-2v2h-2v-2h2zm-2-2v2h-2v-2h2zm2 0v2h2v-2h-2zm-4-4v2h2v-2h-2z" /></svg>
                    <h4 className="text-sm">OBD Report (QR)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scan the QR codes below to view verified manufacturer OBD-II scan reports and real-time logs.
                  </p>
                  <div className="grid gap-2 grid-cols-2">
                    {customerReport.obd_qr_images.map((img: string, idx: number) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-border aspect-square relative group cursor-pointer hover:border-primary transition p-1 bg-white">
                        <img
                          src={img}
                          alt={`OBD QR code ${idx + 1}`}
                          className="w-full h-full object-contain"
                          onClick={() => window.open(img, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other References for Customer */}
              {customerReport.other_references && customerReport.other_references.length > 0 && (
                <div className="glass-card rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Info className="h-5 w-5" />
                    <h4 className="text-sm">Other References</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Additional reference documents and photos compiled during this inspection.
                  </p>
                  <div className="grid gap-2 grid-cols-3">
                    {customerReport.other_references.map((img: string, idx: number) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-border aspect-video relative group cursor-pointer hover:border-primary transition">
                        <img
                          src={img}
                          alt={`Other reference ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onClick={() => window.open(img, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OBD-II ECU Scan */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    OBD-II ECU Scan
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${customerReport.obd_status === "Clean" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                    {customerReport.obd_status}
                  </span>
                </div>
                {customerReport.obd_codes.length === 0 ? (
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>Zero active fault codes logged. Powertrain, HVAC, Airbags, and control loops are fully verified.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerReport.obd_codes.map((code) => (
                      <div key={code.code} className="p-2.5 rounded-xl border border-border bg-background/50 text-xs">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-amber-500 font-semibold">{code.code}</span>
                          <span className="text-[9px] uppercase font-bold text-rose-500">{code.severity}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">{code.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Detailed Report Section */}
            <div className="space-y-6">

              {/* Vehicle Specifications Block */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 text-foreground font-bold">
                  <Gauge className="h-5 w-5 text-primary animate-pulse" />
                  <h3>Vehicle Technical Specifications</h3>
                </div>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {[
                    { label: "Make", value: customerReport.car_make || "Porsche" },
                    { label: "Model", value: customerReport.vehicle_model },
                    { label: "Year", value: customerReport.year },
                    { label: "Registration", value: customerReport.registration_number || "Not Specified" },
                    { label: "VIN Number", value: customerReport.vin_number || "Not Specified", mono: true },
                    { label: "Odometer", value: customerReport.odometer || "Not Specified" },
                    { label: "Fuel Type", value: customerReport.fuel_type || "Petrol" },
                    { label: "Transmission", value: customerReport.transmission || "Automatic" }
                  ].map((spec) => (
                    <div key={spec.label} className="p-3 rounded-2xl border border-border bg-background/30 flex flex-col justify-between min-h-[65px]">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{spec.label}</span>
                      <span className={`text-xs font-semibold mt-1 text-foreground block truncate ${spec.mono ? 'font-mono' : ''}`} title={String(spec.value)}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict Summary Block */}
              <div className="glass-card rounded-3xl p-6 md:p-8 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="text-lg font-bold">Inspector Verdict</h3>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{customerReport.summary}</p>
              </div>

              {/* Expert Remarks Block */}
              <div className="glass-card rounded-3xl p-6 border-l-4 border-amber-500/80 bg-amber-500/5 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Inspection Expert Remarks</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-foreground/90 font-medium list-none pl-0">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">1.</span>
                    <span>Sometime late cranking once check battery and self motor condition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">2.</span>
                    <span>Rear Rh tyre damaged</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">3.</span>
                    <span>All tyres weak year expired need to replace condition</span>
                  </li>
                  {customerReport.technician_remarks && (
                    <li className="flex items-start gap-2 pt-2 border-t border-amber-500/20 mt-2">
                      <span className="text-primary font-bold">Additional remarks:</span>
                      <span>{customerReport.technician_remarks}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Paint Thickness Block */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3>Paint Thickness Analyzer</h3>
                  </div>
                  <span className={`text-xs uppercase px-2 py-0.5 rounded font-semibold ${customerReport.paint_status === "Original" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                    {customerReport.paint_status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Measured in micrometers (μm). Factory standard is 80μm-130μm. Readings higher than 200μm imply cosmetic respray or filler bodywork.
                </p>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {customerReport.paint_panels.map((p) => (
                    <div key={p.name} className="p-3 rounded-xl border border-border bg-background/30 text-center">
                      <span className="text-xs text-muted-foreground block truncate">{p.name}</span>
                      <span className="text-base font-bold block mt-0.5 text-foreground">{p.value} μm</span>
                      <span className={`inline-block text-[9px] font-bold mt-0.5 px-1.5 rounded ${p.original ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                        {p.original ? "Factory" : "Repainted"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety & Structural Diagnostics Block */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3 text-foreground font-bold">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <h3>Safety & Structural Diagnostics</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Body & Structural State", value: customerReport.body_structural },
                    { label: "Accidental History", value: customerReport.accidental_history },
                    { label: "Engine & Gearbox Performance", value: customerReport.engine_gearbox },
                    { label: "OBD Scan Errors (DTC)", value: customerReport.obd_errors },
                    { label: "Water Logged (Flooded)", value: customerReport.water_logged },
                    {
                      label: "OBD Scan Report",
                      value: customerReport.obd_status === "Clean"
                        ? "Clean"
                        : `Faults detected: ${customerReport.obd_codes?.length || 0} DTCs active`
                    },
                    { label: "OBD Pre-scan Report", value: "Clean" },
                    { label: "Background History Check", value: "Clean" },
                    { label: "Blacklist Status", value: "Clear" }
                  ].map((area) => {
                    const isDefectReported = area.value && area.value.trim() !== "" &&
                      area.value.trim().toLowerCase() !== "n/a" &&
                      area.value.trim().toLowerCase() !== "none" &&
                      area.value.trim().toLowerCase() !== "clean" &&
                      area.value.trim().toLowerCase() !== "clear" &&
                      area.value.trim().toLowerCase() !== "passed" &&
                      area.value.trim().toLowerCase() !== "pass" &&
                      area.value.trim().toLowerCase() !== "no issues" &&
                      area.value.trim().toLowerCase() !== "no damage";
                    return (
                      <div key={area.label} className={`p-4 rounded-2xl border transition hover:bg-secondary/15 ${isDefectReported ? "bg-rose-500/5 border-rose-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                        }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{area.label}</span>
                          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${isDefectReported ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                            {isDefectReported ? "Attention Needed" : "Passed"}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                          {area.value || "Passed inspection. Zero structural or safety anomalies logged."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <h3>Mechanical & Structural Audits</h3>
                </div>
                <div className="space-y-6">
                  {customerReport.checks.map((cat) => (
                    <div key={cat.category} className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-primary font-bold">
                        {cat.category}
                      </h4>
                      <div className="divide-y divide-border/20 border border-border/30 rounded-2xl overflow-hidden bg-background/20">
                        {cat.items.map((item: any) => (
                          <div key={item.name} className="p-4 flex flex-col hover:bg-secondary/10 transition space-y-3">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 text-sm">
                              <div className="space-y-1">
                                <span className="font-semibold text-foreground">{item.name}</span>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                              </div>
                              <span className={`inline-flex self-start items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(item.status)}`}>
                                {item.status}
                              </span>
                            </div>

                            {item.images && item.images.length > 0 && (
                              <div className="space-y-2 pl-1 pt-2 border-t border-border/10">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Checkpoint Photos</span>
                                <div className="grid gap-2 grid-cols-4 md:grid-cols-6">
                                  {item.images.map((img: string, idx: number) => (
                                    <div key={idx} className="rounded-lg overflow-hidden border border-border aspect-video relative group cursor-pointer hover:border-primary transition">
                                      <img
                                        src={img}
                                        alt={`${item.name} photo ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        onClick={() => window.open(img, "_blank")}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {cat.images && cat.images.length > 0 && (
                        <div className="space-y-2 mt-3 pl-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{cat.category} Reference Images</span>
                          <div className="grid gap-2 grid-cols-4 md:grid-cols-6">
                            {cat.images.map((img: string, idx: number) => (
                              <div key={idx} className="rounded-lg overflow-hidden border border-border aspect-video relative group cursor-pointer hover:border-primary transition">
                                <img
                                  src={img}
                                  alt={`${cat.category} reference ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  onClick={() => window.open(img, "_blank")}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Gallery Images */}
              {customerReport.images && customerReport.images.length > 0 && (
                <div className="glass-card rounded-3xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-foreground">Inspection Gallery</h4>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                    {customerReport.images.map((img, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-border aspect-video relative group">
                        <img
                          src={img}
                          alt={`Inspection checkpoint ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </section>
    </>
  );
}
