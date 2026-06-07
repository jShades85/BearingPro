export type TicketStatus = "open" | "assigned" | "in-progress" | "pending-parts" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "medium" | "low";
export type TicketCategory = "Security" | "AV / Audio" | "Networking" | "Access Control" | "Surveillance" | "Smart Home";

export interface ServiceTicket {
  id: string;
  customer: string;
  contact: string;
  phone: string;
  siteAddress: string;
  category: TicketCategory;
  issue: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  onServicePlan: boolean;
  dateCreated: string;
  dateDue: string;
  notes: string;
  activity: { time: string; actor: string; text: string }[];
}

export const statusMeta: Record<TicketStatus, { label: string; cls: string }> = {
  "open":          { label: "Open",          cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  "assigned":      { label: "Assigned",      cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  "in-progress":   { label: "In Progress",   cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  "pending-parts": { label: "Pending Parts", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  "resolved":      { label: "Resolved",      cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  "closed":        { label: "Closed",        cls: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

export const priorityMeta: Record<TicketPriority, { label: string; cls: string; dot: string }> = {
  urgent: { label: "Urgent", cls: "text-red-600 dark:text-red-400",    dot: "bg-red-500" },
  high:   { label: "High",   cls: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  medium: { label: "Medium", cls: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" },
  low:    { label: "Low",    cls: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400" },
};

export const STATUS_ORDER: TicketStatus[] = ["open", "assigned", "in-progress", "pending-parts", "resolved", "closed"];
export const CATEGORY_OPTIONS: TicketCategory[] = ["Security", "AV / Audio", "Networking", "Access Control", "Surveillance", "Smart Home"];
export const PRIORITY_OPTIONS: TicketPriority[] = ["urgent", "high", "medium", "low"];

export const SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: "ST-2026-0061",
    customer: "Vertex Capital Partners",
    contact: "Iris Wang",
    phone: "(312) 555-9090",
    siteAddress: "200 W Madison St, Chicago, IL 60606",
    category: "Surveillance",
    issue: "IP camera offline — Floor 14 northwest corner",
    priority: "urgent",
    status: "in-progress",
    assignedTo: "RT",
    onServicePlan: true,
    dateCreated: "2026-06-06",
    dateDue: "2026-06-07",
    notes: "PoE switch port confirmed active. Suspect camera hardware failure. Replacement unit pulled from stock.",
    activity: [
      { time: "Jun 06, 8:42 AM",  actor: "EM", text: "Ticket opened — reported by Iris Wang via phone" },
      { time: "Jun 06, 9:00 AM",  actor: "EM", text: "Assigned to Ravi Tate — urgent SLA applies" },
      { time: "Jun 06, 10:15 AM", actor: "RT", text: "On site — confirmed camera offline, checking PoE switch" },
      { time: "Jun 06, 11:30 AM", actor: "RT", text: "Switch port healthy — camera hardware fault confirmed" },
      { time: "Jun 06, 1:00 PM",  actor: "RT", text: "Replacement unit pulled from stock — install scheduled for Jun 7" },
    ],
  },
  {
    id: "ST-2026-0060",
    customer: "Arden & Loom Studios",
    contact: "Lena Romero",
    phone: "(323) 555-7741",
    siteAddress: "5200 Lankershim Blvd, Los Angeles, CA 91601",
    category: "AV / Audio",
    issue: "DSP not recovering after power outage — all audio zones silent",
    priority: "urgent",
    status: "assigned",
    assignedTo: "AV",
    onServicePlan: true,
    dateCreated: "2026-06-07",
    dateDue: "2026-06-07",
    notes: "",
    activity: [
      { time: "Jun 07, 7:18 AM", actor: "SN", text: "Ticket opened — Lena Romero called in, no audio in any zone after overnight power outage" },
      { time: "Jun 07, 7:25 AM", actor: "SN", text: "Assigned to Aman Verma — remote triage in progress" },
    ],
  },
  {
    id: "ST-2026-0059",
    customer: "Pinecrest Hospitality Group",
    contact: "Marcus Bell",
    phone: "(512) 555-0911",
    siteAddress: "905 Congress Ave, Austin, TX 78701",
    category: "Access Control",
    issue: "Lobby entrance reader not unlocking — staff using override key",
    priority: "high",
    status: "open",
    assignedTo: "JK",
    onServicePlan: false,
    dateCreated: "2026-06-07",
    dateDue: "2026-06-09",
    notes: "",
    activity: [
      { time: "Jun 07, 8:55 AM", actor: "JK", text: "Ticket opened via email from Marcus Bell — reader stopped responding overnight" },
    ],
  },
  {
    id: "ST-2026-0058",
    customer: "Northbeam Architects",
    contact: "Audrey Chen",
    phone: "(718) 555-0142",
    siteAddress: "44 Berry St, Brooklyn, NY 11211",
    category: "AV / Audio",
    issue: "Conference room B projector not accepting HDMI input",
    priority: "high",
    status: "assigned",
    assignedTo: "MO",
    onServicePlan: true,
    dateCreated: "2026-06-05",
    dateDue: "2026-06-08",
    notes: "Tried alternate cable — issue persists. Likely EDID or HDMI handshake problem on the switcher.",
    activity: [
      { time: "Jun 05, 2:30 PM", actor: "MO", text: "Ticket opened — Audrey reported no signal on projector during client presentation" },
      { time: "Jun 05, 3:00 PM", actor: "MO", text: "Remote triage — alternate cable tested, issue persists" },
      { time: "Jun 06, 9:00 AM", actor: "MO", text: "Assigned for on-site visit Jun 8 AM" },
    ],
  },
  {
    id: "ST-2026-0057",
    customer: "Halcyon Public Schools",
    contact: "Damon Reyes",
    phone: "(503) 555-4422",
    siteAddress: "1010 SE Powell Blvd, Portland, OR 97202",
    category: "AV / Audio",
    issue: "Auditorium main display flickering intermittently",
    priority: "medium",
    status: "pending-parts",
    assignedTo: "MO",
    onServicePlan: false,
    dateCreated: "2026-06-03",
    dateDue: "2026-06-14",
    notes: "Display panel identified as defective. Warranty replacement ordered from Samsung — ETA Jun 13.",
    activity: [
      { time: "Jun 03, 10:00 AM", actor: "MO", text: "Ticket opened — reported by Damon Reyes via web form" },
      { time: "Jun 04, 1:00 PM",  actor: "MO", text: "On site — display panel confirmed defective, warranty claim filed" },
      { time: "Jun 04, 3:45 PM",  actor: "MO", text: "Samsung replacement ordered — ETA June 13" },
    ],
  },
  {
    id: "ST-2026-0056",
    customer: "Helio Health Systems",
    contact: "Priya Anand",
    phone: "(303) 555-2230",
    siteAddress: "1719 E 19th Ave, Denver, CO 80206",
    category: "AV / Audio",
    issue: "Wireless mic interference in surgical suite 3 during procedures",
    priority: "high",
    status: "in-progress",
    assignedTo: "AV",
    onServicePlan: true,
    dateCreated: "2026-06-04",
    dateDue: "2026-06-07",
    notes: "Interference correlating with another department's wireless system on adjacent frequency. Recoordinating mic frequencies.",
    activity: [
      { time: "Jun 04, 11:00 AM", actor: "RT", text: "Ticket opened — Priya Anand escalated via phone, active interference during procedures" },
      { time: "Jun 04, 11:30 AM", actor: "AV", text: "Remote analysis — frequency conflict identified with radiology dept wireless" },
      { time: "Jun 05, 9:00 AM",  actor: "AV", text: "On site — recoordinating mic frequencies, testing in progress" },
    ],
  },
  {
    id: "ST-2026-0055",
    customer: "Cinder & Oak Hospitality",
    contact: "Hugo Albright",
    phone: "(615) 555-3201",
    siteAddress: "112 3rd Ave S, Nashville, TN 37201",
    category: "AV / Audio",
    issue: "Background music dropping in bar zone 2 during peak hours",
    priority: "low",
    status: "open",
    assignedTo: "JK",
    onServicePlan: false,
    dateCreated: "2026-06-06",
    dateDue: "2026-06-13",
    notes: "",
    activity: [
      { time: "Jun 06, 5:30 PM", actor: "JK", text: "Ticket opened — Hugo reported intermittent audio drop via email" },
    ],
  },
  {
    id: "ST-2026-0053",
    customer: "Quay Residential",
    contact: "Theodore Fox",
    phone: "(305) 555-1108",
    siteAddress: "1408 Bayshore Dr, Miami, FL 33132",
    category: "Smart Home",
    issue: "Lutron lighting scenes not responding via app",
    priority: "medium",
    status: "resolved",
    assignedTo: "SN",
    onServicePlan: true,
    dateCreated: "2026-06-02",
    dateDue: "2026-06-05",
    notes: "RA3 repeater had lost its cloud connection after ISP outage. Re-paired and updated firmware.",
    activity: [
      { time: "Jun 02, 3:00 PM",  actor: "SN", text: "Ticket opened — Theodore reported app unresponsive for all lighting scenes" },
      { time: "Jun 02, 3:15 PM",  actor: "SN", text: "Remote check — RA3 repeater offline, ISP outage correlation confirmed" },
      { time: "Jun 03, 10:00 AM", actor: "SN", text: "Repeater back online after ISP restored — re-paired and firmware updated" },
      { time: "Jun 03, 10:30 AM", actor: "SN", text: "Confirmed all scenes responsive — ticket resolved" },
    ],
  },
];
