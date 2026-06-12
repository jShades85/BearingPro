import { SC } from "@/lib/status-colors";

export type PlanStatus = "active" | "expiring" | "expired" | "cancelled" | "pending";
export type PlanTier = "Essential" | "Standard" | "Professional" | "Elite";
export type CoveredSystem = "Security" | "AV / Audio" | "Networking" | "Access Control" | "Surveillance" | "Smart Home";

export interface ServicePlan {
  id: string;
  customer: string;
  contact: string;
  phone: string;
  siteAddress: string;
  tier: PlanTier;
  coveredSystems: CoveredSystem[];
  mrr: number;
  billingCycle: "Monthly" | "Quarterly" | "Annual";
  slaResponse: string;
  visitsPerYear: number;
  visitsUsed: number;
  startDate: string;
  renewalDate: string;
  status: PlanStatus;
  accountManager: string;
  notes: string;
  activity: { time: string; actor: string; text: string }[];
}

export const statusMeta: Record<PlanStatus, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: SC.green },
  expiring:  { label: "Expiring",  cls: SC.amber },
  expired:   { label: "Expired",   cls: SC.red },
  cancelled: { label: "Cancelled", cls: SC.neutral },
  pending:   { label: "Pending",   cls: SC.blue },
};

export const tierMeta: Record<PlanTier, { cls: string; description: string }> = {
  Essential:    { cls: SC.neutral, description: "Annual inspection · Remote monitoring · NBD response" },
  Standard:     { cls: SC.blue,    description: "2 visits/yr · Remote monitoring · 8hr response" },
  Professional: { cls: SC.violet,  description: "4 visits/yr · Remote monitoring · 4hr response" },
  Elite:        { cls: SC.amber,   description: "Monthly visits · 24/7 monitoring · 2hr response" },
};

export const STATUS_ORDER: PlanStatus[] = ["active", "expiring", "expired", "pending", "cancelled"];

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: "SP-2026-008",
    customer: "Vertex Capital Partners",
    contact: "Iris Wang",
    phone: "(312) 555-9090",
    siteAddress: "200 W Madison St, Chicago, IL 60606",
    tier: "Elite",
    coveredSystems: ["Security", "Surveillance", "Networking"],
    mrr: 1850,
    billingCycle: "Monthly",
    slaResponse: "2 hours",
    visitsPerYear: 12,
    visitsUsed: 5,
    startDate: "2026-01-01",
    renewalDate: "2027-01-01",
    status: "active",
    accountManager: "EM",
    notes: "Key account — any visit requires 48hr notice to building security.",
    activity: [
      { time: "Jun 06, 10:00 AM", actor: "EM", text: "Monthly visit completed — all systems nominal" },
      { time: "May 06, 9:30 AM",  actor: "RT", text: "Monthly visit completed — camera firmware updated" },
      { time: "Jan 01, 8:00 AM",  actor: "EM", text: "Plan activated — Elite tier" },
    ],
  },
  {
    id: "SP-2026-007",
    customer: "Helio Health Systems",
    contact: "Priya Anand",
    phone: "(303) 555-2230",
    siteAddress: "1719 E 19th Ave, Denver, CO 80206",
    tier: "Elite",
    coveredSystems: ["AV / Audio", "Surveillance", "Networking"],
    mrr: 2100,
    billingCycle: "Monthly",
    slaResponse: "2 hours",
    visitsPerYear: 12,
    visitsUsed: 6,
    startDate: "2025-07-01",
    renewalDate: "2026-07-01",
    status: "active",
    accountManager: "RT",
    notes: "HIPAA-sensitive environment. All techs must sign visitor log. No personal devices in surgical suites.",
    activity: [
      { time: "Jun 01, 9:00 AM",  actor: "AV", text: "Monthly visit — wireless mic frequencies recoordinated" },
      { time: "May 01, 10:00 AM", actor: "RT", text: "Monthly visit — telehealth cart AV confirmed" },
    ],
  },
  {
    id: "SP-2026-006",
    customer: "Pinecrest Hospitality Group",
    contact: "Marcus Bell",
    phone: "(512) 555-0911",
    siteAddress: "905 Congress Ave, Austin, TX 78701",
    tier: "Professional",
    coveredSystems: ["AV / Audio", "Access Control"],
    mrr: 980,
    billingCycle: "Quarterly",
    slaResponse: "4 hours",
    visitsPerYear: 4,
    visitsUsed: 2,
    startDate: "2026-01-15",
    renewalDate: "2027-01-15",
    status: "active",
    accountManager: "JK",
    notes: "",
    activity: [
      { time: "Apr 15, 9:00 AM", actor: "JK", text: "Q2 visit completed — lobby AV and access control inspected" },
      { time: "Jan 15, 9:00 AM", actor: "JK", text: "Q1 visit completed — plan activated" },
    ],
  },
  {
    id: "SP-2026-005",
    customer: "Northbeam Architects",
    contact: "Audrey Chen",
    phone: "(718) 555-0142",
    siteAddress: "44 Berry St, Brooklyn, NY 11211",
    tier: "Professional",
    coveredSystems: ["AV / Audio"],
    mrr: 720,
    billingCycle: "Monthly",
    slaResponse: "4 hours",
    visitsPerYear: 4,
    visitsUsed: 2,
    startDate: "2025-07-01",
    renewalDate: "2026-07-01",
    status: "expiring",
    accountManager: "MO",
    notes: "Renewal discussion needed — Audrey hinted at upgrading to Elite given new penthouse project.",
    activity: [
      { time: "Jun 01, 2:00 PM", actor: "MO", text: "Renewal reminder sent — 30 days to expiry" },
      { time: "Apr 01, 9:00 AM", actor: "MO", text: "Q2 visit completed — conference room AV inspected" },
    ],
  },
  {
    id: "SP-2026-004",
    customer: "Arden & Loom Studios",
    contact: "Lena Romero",
    phone: "(323) 555-7741",
    siteAddress: "5200 Lankershim Blvd, Los Angeles, CA 91601",
    tier: "Professional",
    coveredSystems: ["AV / Audio", "Networking"],
    mrr: 860,
    billingCycle: "Monthly",
    slaResponse: "4 hours",
    visitsPerYear: 4,
    visitsUsed: 1,
    startDate: "2026-03-01",
    renewalDate: "2027-03-01",
    status: "active",
    accountManager: "AV",
    notes: "",
    activity: [
      { time: "Mar 01, 9:00 AM", actor: "AV", text: "Plan activated — Q1 visit completed, DSP baseline documented" },
    ],
  },
  {
    id: "SP-2026-003",
    customer: "Quay Residential",
    contact: "Theodore Fox",
    phone: "(305) 555-1108",
    siteAddress: "1408 Bayshore Dr, Miami, FL 33132",
    tier: "Standard",
    coveredSystems: ["Smart Home", "AV / Audio"],
    mrr: 290,
    billingCycle: "Monthly",
    slaResponse: "8 hours",
    visitsPerYear: 2,
    visitsUsed: 1,
    startDate: "2026-01-01",
    renewalDate: "2027-01-01",
    status: "active",
    accountManager: "SN",
    notes: "Residential client — schedule visits Tue–Thu only. Contact Theodore directly, not the property manager.",
    activity: [
      { time: "Apr 01, 10:00 AM", actor: "SN", text: "H1 visit completed — Lutron and Sonos systems checked" },
      { time: "Jan 01, 9:00 AM",  actor: "SN", text: "Plan activated" },
    ],
  },
  {
    id: "SP-2026-002",
    customer: "Halcyon Public Schools",
    contact: "Damon Reyes",
    phone: "(503) 555-4422",
    siteAddress: "1010 SE Powell Blvd, Portland, OR 97202",
    tier: "Standard",
    coveredSystems: ["AV / Audio"],
    mrr: 420,
    billingCycle: "Annual",
    slaResponse: "8 hours",
    visitsPerYear: 2,
    visitsUsed: 0,
    startDate: "2026-09-01",
    renewalDate: "2027-09-01",
    status: "pending",
    accountManager: "MO",
    notes: "Contract signed — plan starts Sep 1 with new school year. First visit scheduled for Sep 10.",
    activity: [
      { time: "Jun 05, 11:00 AM", actor: "MO", text: "Contract signed — plan created, pending start date Sep 1" },
    ],
  },
  {
    id: "SP-2025-011",
    customer: "Cinder & Oak Hospitality",
    contact: "Hugo Albright",
    phone: "(615) 555-3201",
    siteAddress: "112 3rd Ave S, Nashville, TN 37201",
    tier: "Essential",
    coveredSystems: ["AV / Audio"],
    mrr: 150,
    billingCycle: "Annual",
    slaResponse: "Next business day",
    visitsPerYear: 1,
    visitsUsed: 1,
    startDate: "2025-06-01",
    renewalDate: "2026-06-01",
    status: "expired",
    accountManager: "JK",
    notes: "Plan lapsed — Hugo was unresponsive to renewal outreach. Follow up Q3 2026.",
    activity: [
      { time: "Jun 01, 8:00 AM",  actor: "JK", text: "Plan expired — no renewal response" },
      { time: "May 15, 9:00 AM",  actor: "JK", text: "Renewal reminder sent — no reply" },
      { time: "May 01, 9:00 AM",  actor: "JK", text: "Second renewal notice sent" },
      { time: "Jun 01, 2025, 10:00 AM", actor: "JK", text: "Annual visit completed — plan activated" },
    ],
  },
];
