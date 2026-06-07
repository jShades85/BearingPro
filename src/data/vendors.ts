export type VendorStatus   = "preferred" | "active" | "inactive";
export type VendorCategory = "Security" | "AV" | "Networking" | "Cabling" | "Hardware" | "Specialty";

export interface VendorRecord {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  accountNumber: string | null;
  paymentTerms: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  repName: string | null;
  repPhone: string | null;
  repEmail: string | null;
  totalPOs: number;
  ytdSpend: number;
  activePOs: number;
  lastOrderDate: string | null;
  notes: string;
}

export const VENDORS: VendorRecord[] = [
  {
    id: "v-1",
    name: "ADI Global Distribution",
    category: "Hardware",
    status: "preferred",
    accountNumber: "PCSS-ADI-4412",
    paymentTerms: "Net 30",
    website: "adisecurity.com",
    phone: "(800) 233-6261",
    email: "orders@adisecurity.com",
    city: "Melville",
    state: "NY",
    repName: "Marcus Webb",
    repPhone: "(847) 555-0182",
    repEmail: "m.webb@adisecurity.com",
    totalPOs: 38,
    ytdSpend: 47200,
    activePOs: 2,
    lastOrderDate: "Jun 4, 2026",
    notes: "Primary hardware distributor. Net 30 terms locked in after first full year. Marcus is our rep — call him directly for backorder status.",
  },
  {
    id: "v-2",
    name: "Anixter / Wesco",
    category: "Cabling",
    status: "active",
    accountNumber: "PCSS-ANX-8870",
    paymentTerms: "Net 30",
    website: "wesco.com",
    phone: "(800) 323-8167",
    email: "customerservice@wesco.com",
    city: "Glenview",
    state: "IL",
    repName: "Diane Flores",
    repPhone: "(847) 555-0219",
    repEmail: "d.flores@wesco.com",
    totalPOs: 14,
    ytdSpend: 12400,
    activePOs: 0,
    lastOrderDate: "Mar 20, 2026",
    notes: "Use for bulk cable and conduit. Pricing beat ADI on Cat6 bulk runs last year. One cancelled PO — check pricing before reordering Biamp through them.",
  },
  {
    id: "v-3",
    name: "Axis Communications",
    category: "Security",
    status: "preferred",
    accountNumber: "PCSS-AXS-2201",
    paymentTerms: "Net 30",
    website: "axis.com",
    phone: "(800) 444-2947",
    email: "orders.us@axis.com",
    city: "Chelmsford",
    state: "MA",
    repName: "Tom Nakamura",
    repPhone: "(978) 555-0144",
    repEmail: "t.nakamura@axis.com",
    totalPOs: 22,
    ytdSpend: 38600,
    activePOs: 1,
    lastOrderDate: "May 29, 2026",
    notes: "Direct Axis partner account. Tom is our territory SE — loop him in on large camera specs for volume pricing.",
  },
  {
    id: "v-4",
    name: "Verkada",
    category: "Security",
    status: "preferred",
    accountNumber: "PCSS-VRK-0557",
    paymentTerms: "Net 15",
    website: "verkada.com",
    phone: "(415) 231-7277",
    email: "orders@verkada.com",
    city: "San Mateo",
    state: "CA",
    repName: "Priya Nair",
    repPhone: "(415) 555-0193",
    repEmail: "p.nair@verkada.com",
    totalPOs: 17,
    ytdSpend: 31400,
    activePOs: 2,
    lastOrderDate: "Jun 2, 2026",
    notes: "Verkada Cloud Managed reseller account. Priya handles NFR units and demo stock — coordinate with her before committing access control to a new project.",
  },
  {
    id: "v-5",
    name: "Biamp Systems",
    category: "AV",
    status: "active",
    accountNumber: "PCSS-BAP-3318",
    paymentTerms: "Net 45",
    website: "biamp.com",
    phone: "(503) 641-7287",
    email: "customerservice@biamp.com",
    city: "Beaverton",
    state: "OR",
    repName: "Carlos Estrada",
    repPhone: "(503) 555-0167",
    repEmail: "c.estrada@biamp.com",
    totalPOs: 9,
    ytdSpend: 18700,
    activePOs: 1,
    lastOrderDate: "Jun 6, 2026",
    notes: "Net 45 terms — plan cash flow accordingly on large AV projects. Carlos can usually get 5–8% project pricing on DSPs for jobs over $10K.",
  },
  {
    id: "v-6",
    name: "Leviton",
    category: "Networking",
    status: "active",
    accountNumber: "PCSS-LEV-7740",
    paymentTerms: "Net 30",
    website: "leviton.com",
    phone: "(800) 323-8920",
    email: "prosupport@leviton.com",
    city: "Little Neck",
    state: "NY",
    repName: null,
    repPhone: null,
    repEmail: null,
    totalPOs: 11,
    ytdSpend: 9800,
    activePOs: 1,
    lastOrderDate: "May 30, 2026",
    notes: "Order through distributor portal — no dedicated rep at this volume. Follow up directly with pro support for ETA on rack SKUs.",
  },
  {
    id: "v-7",
    name: "Middle Atlantic Products",
    category: "AV",
    status: "active",
    accountNumber: "PCSS-MAP-6629",
    paymentTerms: "Net 30",
    website: "middleatlantic.com",
    phone: "(800) 266-7255",
    email: "sales@middleatlantic.com",
    city: "Fairfield",
    state: "NJ",
    repName: "Jess Thornton",
    repPhone: "(973) 555-0208",
    repEmail: "j.thornton@middleatlantic.com",
    totalPOs: 6,
    ytdSpend: 7100,
    activePOs: 0,
    lastOrderDate: "Apr 15, 2026",
    notes: "Racks, enclosures, and power distribution. Jess can expedite rack builds if we spec early enough.",
  },
];
