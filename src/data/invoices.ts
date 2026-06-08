export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue" | "void";

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  method: "check" | "ach" | "credit_card" | "wire";
  reference: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  companyName: string;
  contactName: string;
  projectId: string | null;
  projectName: string | null;
  issuedDate: string;
  dueDate: string;
  paymentTerms: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  payments: InvoicePayment[];
  notes: string;
}

export const INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-04812",
    status: "sent",
    companyName: "Quay Residential",
    contactName: "Theodore Fox",
    projectId: "p-3",
    projectName: "Quay — Smart Home Phase 2",
    issuedDate: "Jun 1, 2026",
    dueDate: "Jul 1, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-1-1", description: "Lutron Caseta Smart Dimmer (8-pack)", qty: 4, unitPrice: 320, total: 1280 },
      { id: "li-1-2", description: "Sonos Era 300 (pair)", qty: 2, unitPrice: 899, total: 1798 },
      { id: "li-1-3", description: "Apple TV 4K (3rd gen)", qty: 3, unitPrice: 129, total: 387 },
      { id: "li-1-4", description: "Control4 EA-1 Controller", qty: 1, unitPrice: 1200, total: 1200 },
      { id: "li-1-5", description: "Programming & Integration Labor", qty: 16, unitPrice: 145, total: 2320 },
      { id: "li-1-6", description: "Low-Voltage Installation Labor", qty: 28, unitPrice: 115, total: 3220 },
    ],
    subtotal: 10205,
    taxRate: 0.07,
    taxAmount: 714.35,
    total: 10919.35,
    amountPaid: 0,
    balanceDue: 10919.35,
    payments: [],
    notes: "Phase 2 of whole-home audio/lighting integration. Client approved scope on May 27.",
  },
  {
    id: "inv-2",
    number: "INV-04811",
    status: "partial",
    companyName: "Vertex Capital Partners",
    contactName: "Iris Wang",
    projectId: "p-1",
    projectName: "Vertex — Boardroom AV Refresh",
    issuedDate: "May 28, 2026",
    dueDate: "Jun 27, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-2-1", description: "Samsung 98\" QN900D Neo QLED", qty: 1, unitPrice: 14000, total: 14000 },
      { id: "li-2-2", description: "Crestron DM-NVX-D80 Network AV Decoder", qty: 2, unitPrice: 2100, total: 4200 },
      { id: "li-2-3", description: "Shure MXA920 Ceiling Array Mic", qty: 1, unitPrice: 2800, total: 2800 },
      { id: "li-2-4", description: "Biamp TesiraFORTÉ DSP", qty: 1, unitPrice: 3400, total: 3400 },
      { id: "li-2-5", description: "AV Systems Integration Labor", qty: 40, unitPrice: 145, total: 5800 },
      { id: "li-2-6", description: "Rack Build & Wiring Labor", qty: 12, unitPrice: 115, total: 1380 },
    ],
    subtotal: 31580,
    taxRate: 0.0625,
    taxAmount: 1973.75,
    total: 33553.75,
    amountPaid: 15000,
    balanceDue: 18553.75,
    payments: [
      { id: "pmt-2-1", date: "Jun 5, 2026", amount: 15000, method: "wire", reference: "VCP-WIRE-0605" },
    ],
    notes: "50% deposit received. Balance due upon punch-list sign-off.",
  },
  {
    id: "inv-3",
    number: "INV-04809",
    status: "paid",
    companyName: "Northbeam Architects",
    contactName: "Audrey Chen",
    projectId: null,
    projectName: null,
    issuedDate: "May 22, 2026",
    dueDate: "Jun 21, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-3-1", description: "Conference Room Display — Samsung 75\" QM75B", qty: 2, unitPrice: 3200, total: 6400 },
      { id: "li-3-2", description: "Logitech Rally Bar Mini (conference camera/mic)", qty: 2, unitPrice: 1299, total: 2598 },
      { id: "li-3-3", description: "HDMI 2.1 Active Cable 15ft", qty: 6, unitPrice: 48, total: 288 },
      { id: "li-3-4", description: "Ceiling-Recessed Speaker (pair)", qty: 2, unitPrice: 420, total: 840 },
      { id: "li-3-5", description: "Installation & Configuration Labor", qty: 24, unitPrice: 115, total: 2760 },
    ],
    subtotal: 12886,
    taxRate: 0.08,
    taxAmount: 1030.88,
    total: 13916.88,
    amountPaid: 13916.88,
    balanceDue: 0,
    payments: [
      { id: "pmt-3-1", date: "Jun 18, 2026", amount: 13916.88, method: "ach", reference: "NBA-ACH-0618" },
    ],
    notes: "",
  },
  {
    id: "inv-4",
    number: "INV-04806",
    status: "overdue",
    companyName: "Helio Health Systems",
    contactName: "Priya Anand",
    projectId: "p-2",
    projectName: "Helio — Surgical Center A/V Overhaul",
    issuedDate: "May 18, 2026",
    dueDate: "Jun 17, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-4-1", description: "LG 55\" Medical-Grade Display (DICOM)", qty: 4, unitPrice: 4200, total: 16800 },
      { id: "li-4-2", description: "Extron XTP CrossPoint 1600 Matrix", qty: 1, unitPrice: 18500, total: 18500 },
      { id: "li-4-3", description: "Biamp Devio SCX-20 (rooms A & B)", qty: 2, unitPrice: 2200, total: 4400 },
      { id: "li-4-4", description: "Rack Equipment & Cable Management", qty: 1, unitPrice: 1800, total: 1800 },
      { id: "li-4-5", description: "Engineering & Project Management", qty: 20, unitPrice: 165, total: 3300 },
      { id: "li-4-6", description: "Installation Labor", qty: 60, unitPrice: 115, total: 6900 },
    ],
    subtotal: 51700,
    taxRate: 0.029,
    taxAmount: 1499.3,
    total: 53199.3,
    amountPaid: 0,
    balanceDue: 53199.3,
    payments: [],
    notes: "AP contact: finance@heliohealth.org — PO# HHS-2026-0441 required on remittance.",
  },
  {
    id: "inv-5",
    number: "INV-04802",
    status: "paid",
    companyName: "Halcyon Public Schools",
    contactName: "Damon Reyes",
    projectId: "p-4",
    projectName: "Halcyon — District Security Upgrade",
    issuedDate: "May 12, 2026",
    dueDate: "Jun 11, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-5-1", description: "Axis P3245-V Fixed Dome Camera", qty: 12, unitPrice: 380, total: 4560 },
      { id: "li-5-2", description: "Verkada Door Access Controller (6-door)", qty: 3, unitPrice: 1400, total: 4200 },
      { id: "li-5-3", description: "Verkada Access Badge Reader", qty: 18, unitPrice: 220, total: 3960 },
      { id: "li-5-4", description: "Cat6A Cable Pull & Termination (per drop)", qty: 42, unitPrice: 85, total: 3570 },
      { id: "li-5-5", description: "Security System Labor & Commissioning", qty: 48, unitPrice: 115, total: 5520 },
    ],
    subtotal: 21810,
    taxRate: 0.0,
    taxAmount: 0,
    total: 21810,
    amountPaid: 21810,
    balanceDue: 0,
    payments: [
      { id: "pmt-5-1", date: "Jun 9, 2026", amount: 21810, method: "check", reference: "HPS-CHK-44219" },
    ],
    notes: "Tax exempt — Ed. institution. Exemption cert on file.",
  },
  {
    id: "inv-6",
    number: "INV-04799",
    status: "overdue",
    companyName: "Cinder & Oak Hospitality",
    contactName: "Hugo Albright",
    projectId: null,
    projectName: null,
    issuedDate: "May 4, 2026",
    dueDate: "Jun 3, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-6-1", description: "Sonos Amp (bar & patio zones)", qty: 4, unitPrice: 699, total: 2796 },
      { id: "li-6-2", description: "Sonos Era 100 (indoor zone speaker)", qty: 6, unitPrice: 249, total: 1494 },
      { id: "li-6-3", description: "TOA CS-304 Outdoor Ceiling Speaker (pair)", qty: 3, unitPrice: 480, total: 1440 },
      { id: "li-6-4", description: "Audio Zone Wiring & Installation", qty: 20, unitPrice: 115, total: 2300 },
    ],
    subtotal: 8030,
    taxRate: 0.0925,
    taxAmount: 742.78,
    total: 8772.78,
    amountPaid: 0,
    balanceDue: 8772.78,
    payments: [],
    notes: "Second reminder sent Jun 10. GM out of office, follow up with owner directly.",
  },
  {
    id: "inv-7",
    number: "INV-04795",
    status: "paid",
    companyName: "Arden & Loom Studios",
    contactName: "Lena Romero",
    projectId: null,
    projectName: null,
    issuedDate: "Apr 28, 2026",
    dueDate: "May 28, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-7-1", description: "Shure SM7dB Active Dynamic Mic", qty: 4, unitPrice: 499, total: 1996 },
      { id: "li-7-2", description: "Focusrite Scarlett 18i20 (3rd gen)", qty: 2, unitPrice: 499, total: 998 },
      { id: "li-7-3", description: "Yamaha DXS15mkII Subwoofer", qty: 2, unitPrice: 1100, total: 2200 },
      { id: "li-7-4", description: "Studio Wiring & Patching Labor", qty: 16, unitPrice: 115, total: 1840 },
    ],
    subtotal: 7034,
    taxRate: 0.1025,
    taxAmount: 720.99,
    total: 7754.99,
    amountPaid: 7754.99,
    balanceDue: 0,
    payments: [
      { id: "pmt-7-1", date: "May 22, 2026", amount: 7754.99, method: "credit_card", reference: "CC-STRIPE-7F2A9" },
    ],
    notes: "",
  },
  {
    id: "inv-8",
    number: "INV-04790",
    status: "paid",
    companyName: "Pinecrest Hospitality Group",
    contactName: "Marcus Bell",
    projectId: "p-5",
    projectName: "Pinecrest — Lobby Video Wall",
    issuedDate: "Apr 20, 2026",
    dueDate: "May 20, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-8-1", description: "Samsung IFR Series LED Cabinet (2×2 panel)", qty: 21, unitPrice: 3800, total: 79800 },
      { id: "li-8-2", description: "Novastar MCTRL4K LED Controller", qty: 1, unitPrice: 6200, total: 6200 },
      { id: "li-8-3", description: "Custom Structural Mounting Frame", qty: 1, unitPrice: 4500, total: 4500 },
      { id: "li-8-4", description: "Signal & Power Distribution", qty: 1, unitPrice: 2800, total: 2800 },
      { id: "li-8-5", description: "LED Wall Installation Labor", qty: 60, unitPrice: 145, total: 8700 },
    ],
    subtotal: 102000,
    taxRate: 0.0825,
    taxAmount: 8415,
    total: 110415,
    amountPaid: 110415,
    balanceDue: 0,
    payments: [
      { id: "pmt-8-1", date: "Apr 28, 2026", amount: 55207.5, method: "wire", reference: "PHG-WIRE-0428" },
      { id: "pmt-8-2", date: "May 16, 2026", amount: 55207.5, method: "wire", reference: "PHG-WIRE-0516" },
    ],
    notes: "Split into two wire payments per client's AP policy.",
  },
  {
    id: "inv-9",
    number: "INV-04815",
    status: "draft",
    companyName: "Vertex Capital Partners",
    contactName: "Noor Saleh",
    projectId: "p-6",
    projectName: "Vertex — IT Closet Network Build",
    issuedDate: "Jun 6, 2026",
    dueDate: "Jul 6, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-9-1", description: "Cisco Catalyst 9300-48P Switch", qty: 2, unitPrice: 5800, total: 11600 },
      { id: "li-9-2", description: "Cisco Catalyst 9200L-24P Switch", qty: 4, unitPrice: 2200, total: 8800 },
      { id: "li-9-3", description: "Ubiquiti UniFi AP U6 Pro", qty: 18, unitPrice: 179, total: 3222 },
      { id: "li-9-4", description: "Middle Atlantic WRK-44-27 Equipment Rack", qty: 2, unitPrice: 1100, total: 2200 },
      { id: "li-9-5", description: "Network Installation & Configuration", qty: 52, unitPrice: 145, total: 7540 },
    ],
    subtotal: 33362,
    taxRate: 0.0625,
    taxAmount: 2085.13,
    total: 35447.13,
    amountPaid: 0,
    balanceDue: 35447.13,
    payments: [],
    notes: "Draft — pending final scope sign-off from Noor.",
  },
  {
    id: "inv-10",
    number: "INV-04813",
    status: "sent",
    companyName: "Helio Health Systems",
    contactName: "Priya Anand",
    projectId: "p-2",
    projectName: "Helio — Surgical Center A/V Overhaul",
    issuedDate: "Jun 3, 2026",
    dueDate: "Jul 3, 2026",
    paymentTerms: "Net 30",
    lineItems: [
      { id: "li-10-1", description: "Crestron DM-MD6X6-CPU3 6×6 Matrix", qty: 1, unitPrice: 4800, total: 4800 },
      { id: "li-10-2", description: "Crestron TSW-770 7\" Wall Touchpanel", qty: 4, unitPrice: 1600, total: 6400 },
      { id: "li-10-3", description: "Overhead Projector — Epson EB-PU2220B", qty: 2, unitPrice: 9800, total: 19600 },
      { id: "li-10-4", description: "Draper Motorized Projection Screen 133\"", qty: 2, unitPrice: 2400, total: 4800 },
      { id: "li-10-5", description: "Control System Programming", qty: 32, unitPrice: 165, total: 5280 },
    ],
    subtotal: 40880,
    taxRate: 0.029,
    taxAmount: 1185.52,
    total: 42065.52,
    amountPaid: 0,
    balanceDue: 42065.52,
    payments: [],
    notes: "PO# HHS-2026-0448 required on remittance.",
  },
];
