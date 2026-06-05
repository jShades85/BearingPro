// Demo data for AV-integrator CRM/Ops tool
export type DealStage = "lead" | "qualified" | "proposal" | "won" | "lost";
export type Priority = "urgent" | "high" | "med" | "low";

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  size: string;
  openValue: number;
  contacts: number;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  lastActivity: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  owner: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  priority: Priority;
  updated: string;
}

export interface Quote {
  id: string;
  number: string;
  project: string;
  company: string;
  total: number;
  margin: number;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired";
  sent: string;
}

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  vendor: string;
  cost: number;
  price: number;
  stock: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  company: string;
  pm: string;
  phase: "design" | "procurement" | "install" | "commission" | "closeout";
  progress: number;
  budget: number;
  spent: number;
  due: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  tech: string;
  start: string; // ISO
  end: string;
  type: "install" | "service" | "site-visit" | "training";
  priority: Priority;
  address: string;
}

export interface Invoice {
  id: string;
  number: string;
  company: string;
  amount: number;
  issued: string;
  due: string;
  status: "draft" | "sent" | "partial" | "paid" | "overdue";
}

export const owners = ["EM", "JK", "RT", "SN", "AV", "MO"];
export const ownerNames: Record<string, string> = {
  EM: "Eli Moreno", JK: "Jess Kim", RT: "Ravi Tate", SN: "Sofia Nakamura", AV: "Aman Verma", MO: "Maya Okafor",
};

export const companies: Company[] = [
  { id: "c1", name: "Northbeam Architects", industry: "Architecture", city: "Brooklyn, NY", size: "50–200", openValue: 184500, contacts: 4 },
  { id: "c2", name: "Pinecrest Hospitality Group", industry: "Hospitality", city: "Austin, TX", size: "200–1k", openValue: 612000, contacts: 7 },
  { id: "c3", name: "Helio Health Systems", industry: "Healthcare", city: "Denver, CO", size: "1k+", openValue: 248000, contacts: 9 },
  { id: "c4", name: "Quay Residential", industry: "Residential", city: "Miami, FL", size: "10–50", openValue: 96400, contacts: 3 },
  { id: "c5", name: "Arden & Loom Studios", industry: "Media", city: "Los Angeles, CA", size: "50–200", openValue: 142800, contacts: 5 },
  { id: "c6", name: "Halcyon Public Schools", industry: "Education", city: "Portland, OR", size: "1k+", openValue: 521000, contacts: 6 },
  { id: "c7", name: "Vertex Capital Partners", industry: "Finance", city: "Chicago, IL", size: "200–1k", openValue: 318900, contacts: 4 },
  { id: "c8", name: "Cinder & Oak Hospitality", industry: "Hospitality", city: "Nashville, TN", size: "50–200", openValue: 87600, contacts: 2 },
];

export const contacts: Contact[] = [
  { id: "p1", name: "Audrey Chen", title: "Principal Architect", company: "Northbeam Architects", email: "audrey@northbeam.co", phone: "(718) 555-0142", lastActivity: "2h" },
  { id: "p2", name: "Marcus Bell", title: "Director of IT", company: "Pinecrest Hospitality Group", email: "mbell@pinecrest.com", phone: "(512) 555-0911", lastActivity: "1d" },
  { id: "p3", name: "Priya Anand", title: "Facilities Manager", company: "Helio Health Systems", email: "panand@heliohealth.org", phone: "(303) 555-2230", lastActivity: "3d" },
  { id: "p4", name: "Theodore Fox", title: "Homeowner", company: "Quay Residential", email: "tfox@quay.dev", phone: "(305) 555-1108", lastActivity: "6h" },
  { id: "p5", name: "Lena Romero", title: "Head of Production", company: "Arden & Loom Studios", email: "lena@ardenloom.tv", phone: "(323) 555-7741", lastActivity: "4h" },
  { id: "p6", name: "Damon Reyes", title: "Superintendent", company: "Halcyon Public Schools", email: "dreyes@halcyon.k12.or.us", phone: "(503) 555-4422", lastActivity: "1w" },
  { id: "p7", name: "Iris Wang", title: "VP Operations", company: "Vertex Capital Partners", email: "iwang@vertexcap.io", phone: "(312) 555-9090", lastActivity: "30m" },
  { id: "p8", name: "Hugo Albright", title: "GM", company: "Cinder & Oak Hospitality", email: "hugo@cinderoak.co", phone: "(615) 555-3201", lastActivity: "5d" },
  { id: "p9", name: "Noor Saleh", title: "CTO", company: "Vertex Capital Partners", email: "nsaleh@vertexcap.io", phone: "(312) 555-9111", lastActivity: "2d" },
  { id: "p10", name: "Caleb Ortiz", title: "Project Architect", company: "Northbeam Architects", email: "caleb@northbeam.co", phone: "(718) 555-0188", lastActivity: "1h" },
];

export const deals: Deal[] = [
  { id: "AV-241", title: "Boardroom AV refresh — 14F", company: "Vertex Capital Partners", owner: "EM", value: 84500, stage: "proposal", probability: 65, closeDate: "Jun 24", priority: "high", updated: "2h" },
  { id: "AV-238", title: "Lobby video wall (7×3 LED)", company: "Pinecrest Hospitality Group", owner: "JK", value: 212000, stage: "qualified", probability: 40, closeDate: "Jul 12", priority: "high", updated: "1d" },
  { id: "AV-235", title: "Surgical center A/V overhaul", company: "Helio Health Systems", owner: "RT", value: 148000, stage: "proposal", probability: 55, closeDate: "Jul 02", priority: "urgent", updated: "5h" },
  { id: "AV-233", title: "Primary residence — full smart home", company: "Quay Residential", owner: "SN", value: 96400, stage: "won", probability: 100, closeDate: "May 28", priority: "med", updated: "3d" },
  { id: "AV-230", title: "Sound stage 3 — control room", company: "Arden & Loom Studios", owner: "AV", value: 142800, stage: "qualified", probability: 35, closeDate: "Aug 04", priority: "med", updated: "6h" },
  { id: "AV-229", title: "District-wide classroom standardization", company: "Halcyon Public Schools", owner: "EM", value: 521000, stage: "lead", probability: 15, closeDate: "Sep 30", priority: "high", updated: "12h" },
  { id: "AV-226", title: "Penthouse cinema build", company: "Northbeam Architects", owner: "MO", value: 184500, stage: "proposal", probability: 70, closeDate: "Jun 18", priority: "urgent", updated: "45m" },
  { id: "AV-222", title: "Restaurant POS + audio zones", company: "Cinder & Oak Hospitality", owner: "JK", value: 38400, stage: "lost", probability: 0, closeDate: "May 20", priority: "low", updated: "1w" },
  { id: "AV-218", title: "Trading floor latency upgrade", company: "Vertex Capital Partners", owner: "RT", value: 234400, stage: "lead", probability: 20, closeDate: "Aug 22", priority: "high", updated: "2d" },
  { id: "AV-214", title: "Outdoor cabana audio", company: "Quay Residential", owner: "SN", value: 12800, stage: "won", probability: 100, closeDate: "May 14", priority: "low", updated: "2w" },
  { id: "AV-212", title: "Auditorium projection + line array", company: "Halcyon Public Schools", owner: "MO", value: 96000, stage: "qualified", probability: 50, closeDate: "Jul 28", priority: "med", updated: "4d" },
  { id: "AV-210", title: "Telehealth carts (×24)", company: "Helio Health Systems", owner: "AV", value: 78000, stage: "lead", probability: 25, closeDate: "Aug 11", priority: "med", updated: "1d" },
];

export const stages: { id: DealStage; label: string; }[] = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export const quotes: Quote[] = [
  { id: "q1", number: "Q-2026-0418", project: "Boardroom AV refresh — 14F", company: "Vertex Capital Partners", total: 84500, margin: 32, status: "sent", sent: "Jun 02" },
  { id: "q2", number: "Q-2026-0417", project: "Lobby video wall", company: "Pinecrest Hospitality Group", total: 212000, margin: 28, status: "viewed", sent: "May 31" },
  { id: "q3", number: "Q-2026-0415", project: "Penthouse cinema build", company: "Northbeam Architects", total: 184500, margin: 41, status: "accepted", sent: "May 22" },
  { id: "q4", number: "Q-2026-0412", project: "Surgical center overhaul", company: "Helio Health Systems", total: 148000, margin: 26, status: "sent", sent: "May 18" },
  { id: "q5", number: "Q-2026-0410", project: "Sound stage 3 control room", company: "Arden & Loom Studios", total: 142800, margin: 34, status: "draft", sent: "—" },
  { id: "q6", number: "Q-2026-0407", project: "Trading floor latency upgrade", company: "Vertex Capital Partners", total: 234400, margin: 22, status: "draft", sent: "—" },
  { id: "q7", number: "Q-2026-0402", project: "Restaurant POS + audio zones", company: "Cinder & Oak Hospitality", total: 38400, margin: 30, status: "expired", sent: "Apr 28" },
];

export const catalog: CatalogItem[] = [
  { id: "k1", sku: "CRE-MX-150", name: "Crestron MX-150 Control Processor", category: "Control", vendor: "Crestron", cost: 1820, price: 2750, stock: 8 },
  { id: "k2", sku: "QSC-CX-Q8", name: "QSC CX-Q 8K8 Amplifier", category: "Audio", vendor: "QSC", cost: 3120, price: 4690, stock: 4 },
  { id: "k3", sku: "SAM-IFR-110", name: "Samsung The Wall 110\" 4K LED", category: "Video", vendor: "Samsung", cost: 38400, price: 56200, stock: 1 },
  { id: "k4", sku: "SHU-MXA920", name: "Shure MXA920 Ceiling Array Mic", category: "Audio", vendor: "Shure", cost: 4520, price: 6480, stock: 6 },
  { id: "k5", sku: "EXT-DTP3-T", name: "Extron DTP3 T 232 Twisted Pair TX", category: "Signal", vendor: "Extron", cost: 980, price: 1450, stock: 12 },
  { id: "k6", sku: "BIA-NPL-60", name: "Biamp Nexia PL-60 Conferencing", category: "DSP", vendor: "Biamp", cost: 2240, price: 3380, stock: 5 },
  { id: "k7", sku: "SON-ARC-G2", name: "Sonance Architectural Series IW", category: "Speakers", vendor: "Sonance", cost: 380, price: 590, stock: 24 },
  { id: "k8", sku: "LUT-RA3-HUB", name: "Lutron RA3 Main Repeater", category: "Lighting", vendor: "Lutron", cost: 1180, price: 1790, stock: 9 },
  { id: "k9", sku: "ATX-OMNI-21", name: "Atlona OmniStream 2.1 Encoder", category: "AVoIP", vendor: "Atlona", cost: 1640, price: 2480, stock: 11 },
  { id: "k10", sku: "MID-CAB-44U", name: "Middle Atlantic 44U AV Rack", category: "Racks", vendor: "Middle Atlantic", cost: 1820, price: 2690, stock: 3 },
  { id: "k11", sku: "POL-X70", name: "Poly Studio X70 Video Bar", category: "UC", vendor: "Poly", cost: 5980, price: 8240, stock: 7 },
  { id: "k12", sku: "LAB-LB-300", name: "Labor — AV Tech (per hour)", category: "Labor", vendor: "Internal", cost: 65, price: 145, stock: 999 },
];

export const projects: Project[] = [
  { id: "pr1", code: "AV-2026-014", name: "Penthouse cinema build", company: "Northbeam Architects", pm: "MO", phase: "install", progress: 62, budget: 184500, spent: 112400, due: "Jul 09" },
  { id: "pr2", code: "AV-2026-011", name: "Surgical center overhaul", company: "Helio Health Systems", pm: "RT", phase: "procurement", progress: 28, budget: 148000, spent: 41200, due: "Aug 21" },
  { id: "pr3", code: "AV-2026-009", name: "Smart home — Quay residence", company: "Quay Residential", pm: "SN", phase: "commission", progress: 88, budget: 96400, spent: 84800, due: "Jun 19" },
  { id: "pr4", code: "AV-2026-005", name: "Sound stage 3 control room", company: "Arden & Loom Studios", pm: "AV", phase: "design", progress: 12, budget: 142800, spent: 8400, due: "Oct 02" },
  { id: "pr5", code: "AV-2025-138", name: "Vertex 14F boardroom", company: "Vertex Capital Partners", pm: "EM", phase: "closeout", progress: 96, budget: 84500, spent: 79200, due: "Jun 12" },
  { id: "pr6", code: "AV-2025-132", name: "Auditorium AV — Halcyon HS", company: "Halcyon Public Schools", pm: "MO", phase: "install", progress: 54, budget: 96000, spent: 51800, due: "Aug 04" },
];

export const phaseLabels: Record<Project["phase"], string> = {
  design: "Design",
  procurement: "Procurement",
  install: "Install",
  commission: "Commission",
  closeout: "Closeout",
};

// Build a week of dispatch items
function iso(day: number, hour: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + day); // week starts Monday
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const workOrders: WorkOrder[] = [
  { id: "w1", title: "Vertex 14F — rack install", tech: "RT", start: iso(0, 8), end: iso(0, 12), type: "install", priority: "high", address: "200 W Madison, Chicago" },
  { id: "w2", title: "Quay residence — commissioning", tech: "SN", start: iso(0, 13), end: iso(0, 17), type: "service", priority: "med", address: "1408 Bayshore Dr, Miami" },
  { id: "w3", title: "Pinecrest — site survey", tech: "JK", start: iso(1, 9), end: iso(1, 11), type: "site-visit", priority: "med", address: "905 Congress Ave, Austin" },
  { id: "w4", title: "Northbeam — projector calibration", tech: "MO", start: iso(1, 14), end: iso(1, 16), type: "service", priority: "urgent", address: "44 Berry St, Brooklyn" },
  { id: "w5", title: "Helio — telehealth cart deploy", tech: "AV", start: iso(2, 8), end: iso(2, 15), type: "install", priority: "high", address: "1719 E 19th Ave, Denver" },
  { id: "w6", title: "Arden — DSP programming", tech: "EM", start: iso(2, 10), end: iso(2, 13), type: "service", priority: "med", address: "5200 Lankershim, LA" },
  { id: "w7", title: "Halcyon — auditorium punch list", tech: "MO", start: iso(3, 9), end: iso(3, 17), type: "install", priority: "high", address: "1010 SE Powell, Portland" },
  { id: "w8", title: "Cinder & Oak — training", tech: "JK", start: iso(4, 10), end: iso(4, 12), type: "training", priority: "low", address: "112 3rd Ave S, Nashville" },
  { id: "w9", title: "Vertex — closeout walkthrough", tech: "EM", start: iso(4, 14), end: iso(4, 16), type: "site-visit", priority: "med", address: "200 W Madison, Chicago" },
];

export const invoices: Invoice[] = [
  { id: "i1", number: "INV-04812", company: "Quay Residential", amount: 48200, issued: "Jun 01", due: "Jul 01", status: "sent" },
  { id: "i2", number: "INV-04811", company: "Vertex Capital Partners", amount: 42250, issued: "May 28", due: "Jun 27", status: "partial" },
  { id: "i3", number: "INV-04809", company: "Northbeam Architects", amount: 92250, issued: "May 22", due: "Jun 21", status: "paid" },
  { id: "i4", number: "INV-04806", company: "Helio Health Systems", amount: 74000, issued: "May 18", due: "Jun 17", status: "overdue" },
  { id: "i5", number: "INV-04802", company: "Halcyon Public Schools", amount: 48000, issued: "May 12", due: "Jun 11", status: "paid" },
  { id: "i6", number: "INV-04799", company: "Cinder & Oak Hospitality", amount: 19200, issued: "May 04", due: "Jun 03", status: "overdue" },
  { id: "i7", number: "INV-04795", company: "Arden & Loom Studios", amount: 35700, issued: "Apr 28", due: "May 28", status: "paid" },
  { id: "i8", number: "INV-04790", company: "Pinecrest Hospitality Group", amount: 106000, issued: "Apr 20", due: "May 20", status: "paid" },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
