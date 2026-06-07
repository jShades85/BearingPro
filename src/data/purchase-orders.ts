export type POStatus = "draft" | "sent" | "partial" | "received" | "cancelled";

export interface POLineItem {
  id: string;
  catalogItemId: string | null;
  description: string;
  sku: string;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: POStatus;
  orderDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  vendorOrderNumber: string | null;
  trackingNumber: string | null;
  linkedJobId: string | null;
  notes: string;
  lineItems: POLineItem[];
}

export const VENDORS: Vendor[] = [
  { id: "v-1", name: "ADI Global Distribution" },
  { id: "v-2", name: "Anixter / Wesco" },
  { id: "v-3", name: "Axis Communications" },
  { id: "v-4", name: "Verkada" },
  { id: "v-5", name: "Biamp Systems" },
  { id: "v-6", name: "Leviton" },
  { id: "v-7", name: "Middle Atlantic Products" },
];

export const DEMO_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-1175",
    vendorId: "v-1",
    vendorName: "ADI Global Distribution",
    status: "received",
    orderDate: "Apr 2, 2026",
    expectedDate: "Apr 7, 2026",
    receivedDate: "Apr 5, 2026",
    vendorOrderNumber: "ADI-SO-247891",
    trackingNumber: "1ZAX175023456789",
    linkedJobId: null,
    notes: "Bulk networking and hardware restock.",
    lineItems: [
      { id: "li-1-1", catalogItemId: "ci-301", description: "Leviton GigaMax Cat5e QuickPort Jack", sku: "LV-5G108-RW5", qtyOrdered: 25, qtyReceived: 25, unitCost: 28 },
      { id: "li-1-2", catalogItemId: null,     description: "Single-Gang Low-Voltage Mounting Plate", sku: "MISC-SGMNT",    qtyOrdered: 50, qtyReceived: 50, unitCost: 3  },
    ],
  },
  {
    id: "po-2",
    poNumber: "PO-1176",
    vendorId: "v-1",
    vendorName: "ADI Global Distribution",
    status: "received",
    orderDate: "May 12, 2026",
    expectedDate: "May 17, 2026",
    receivedDate: "May 15, 2026",
    vendorOrderNumber: "ADI-SO-251334",
    trackingNumber: "1ZAX176034567890",
    linkedJobId: "pr6",
    notes: "",
    lineItems: [
      { id: "li-2-1", catalogItemId: "ci-103", description: "Axis M3106-L MkII Mini Dome",   sku: "AX-M3106L",    qtyOrdered: 10, qtyReceived: 10, unitCost: 180 },
      { id: "li-2-2", catalogItemId: null,     description: "Cat6 Cable 1000ft Bulk Box",    sku: "CAT6-BULK-1K", qtyOrdered: 5,  qtyReceived: 5,  unitCost: 110 },
    ],
  },
  {
    id: "po-3",
    poNumber: "PO-1177",
    vendorId: "v-4",
    vendorName: "Verkada",
    status: "received",
    orderDate: "May 25, 2026",
    expectedDate: "May 30, 2026",
    receivedDate: "May 28, 2026",
    vendorOrderNumber: "VRK-2026-04412",
    trackingNumber: "784177012345678",
    linkedJobId: "pr3",
    notes: "Verkada access control restock for Quay Residential project.",
    lineItems: [
      { id: "li-3-1", catalogItemId: "ci-202", description: "Verkada AD31 Access Controller", sku: "VK-AD31", qtyOrdered: 8, qtyReceived: 8, unitCost: 890 },
    ],
  },
  {
    id: "po-4",
    poNumber: "PO-1178",
    vendorId: "v-3",
    vendorName: "Axis Communications",
    status: "received",
    orderDate: "May 29, 2026",
    expectedDate: "Jun 3, 2026",
    receivedDate: "Jun 1, 2026",
    vendorOrderNumber: "AXS-ORD-789234",
    trackingNumber: "1ZAX178045678901",
    linkedJobId: "pr6",
    notes: "Camera restock for Halcyon Schools and Helio Health projects.",
    lineItems: [
      { id: "li-4-1", catalogItemId: "ci-101", description: "Axis P3245-V Fixed Dome Camera", sku: "AX-P3245-V", qtyOrdered: 24, qtyReceived: 24, unitCost: 420 },
    ],
  },
  {
    id: "po-5",
    poNumber: "PO-1179",
    vendorId: "v-4",
    vendorName: "Verkada",
    status: "received",
    orderDate: "Jun 2, 2026",
    expectedDate: "Jun 5, 2026",
    receivedDate: "Jun 3, 2026",
    vendorOrderNumber: "VRK-2026-04889",
    trackingNumber: "784179023456789",
    linkedJobId: "pr1",
    notes: "Verkada camera bulk order — Cinder & Oak and upcoming projects.",
    lineItems: [
      { id: "li-5-1", catalogItemId: "ci-201", description: "Verkada CD52 Indoor Dome Camera", sku: "VK-CD52", qtyOrdered: 12, qtyReceived: 12, unitCost: 590 },
    ],
  },
  {
    id: "po-6",
    poNumber: "PO-1180",
    vendorId: "v-1",
    vendorName: "ADI Global Distribution",
    status: "received",
    orderDate: "May 17, 2026",
    expectedDate: "May 22, 2026",
    receivedDate: "May 20, 2026",
    vendorOrderNumber: "ADI-SO-250107",
    trackingNumber: "1ZAX180056789012",
    linkedJobId: null,
    notes: "Leviton networking top-up.",
    lineItems: [
      { id: "li-6-1", catalogItemId: "ci-301", description: "Leviton GigaMax Cat5e QuickPort Jack", sku: "LV-5G108-RW5", qtyOrdered: 30, qtyReceived: 30, unitCost: 28 },
    ],
  },
  {
    id: "po-7",
    poNumber: "PO-1181",
    vendorId: "v-1",
    vendorName: "ADI Global Distribution",
    status: "partial",
    orderDate: "Jun 4, 2026",
    expectedDate: "Jun 9, 2026",
    receivedDate: null,
    vendorOrderNumber: "ADI-SO-253781",
    trackingNumber: "1ZAX181067890123",
    linkedJobId: "pr2",
    notes: "Partial receipt — Axis M3106 mini domes on backorder from ADI, ETA Jun 15.",
    lineItems: [
      { id: "li-7-1", catalogItemId: "ci-101", description: "Axis P3245-V Fixed Dome Camera",      sku: "AX-P3245-V", qtyOrdered: 8,  qtyReceived: 8,  unitCost: 420 },
      { id: "li-7-2", catalogItemId: "ci-103", description: "Axis M3106-L MkII Mini Dome",          sku: "AX-M3106L",  qtyOrdered: 12, qtyReceived: 0,  unitCost: 180 },
      { id: "li-7-3", catalogItemId: "ci-102", description: "Axis A1001 Network Door Controller",   sku: "AX-A1001",   qtyOrdered: 4,  qtyReceived: 4,  unitCost: 680 },
    ],
  },
  {
    id: "po-8",
    poNumber: "PO-1182",
    vendorId: "v-5",
    vendorName: "Biamp Systems",
    status: "sent",
    orderDate: "Jun 6, 2026",
    expectedDate: "Jun 12, 2026",
    receivedDate: null,
    vendorOrderNumber: "BAP-ORD-031245",
    trackingNumber: "784182034567891",
    linkedJobId: "pr1",
    notes: "Biamp restock for Northpoint Hotel conference rooms project.",
    lineItems: [
      { id: "li-8-1", catalogItemId: "ci-401", description: "Biamp Tesira Forte AVB VT4",   sku: "BA-TESIRA-VT4", qtyOrdered: 3, qtyReceived: 0, unitCost: 2240 },
      { id: "li-8-2", catalogItemId: "ci-402", description: "Biamp Parlé TCM-1 Ceiling Mic", sku: "BA-PARLE-TCM1", qtyOrdered: 6, qtyReceived: 0, unitCost: 890  },
    ],
  },
  {
    id: "po-9",
    poNumber: "PO-1183",
    vendorId: "v-4",
    vendorName: "Verkada",
    status: "draft",
    orderDate: "Jun 7, 2026",
    expectedDate: null,
    receivedDate: null,
    vendorOrderNumber: null,
    trackingNumber: null,
    linkedJobId: null,
    notes: "Quarterly Verkada restock — confirm quantities with PM before sending.",
    lineItems: [
      { id: "li-9-1", catalogItemId: "ci-201", description: "Verkada CD52 Indoor Dome Camera",  sku: "VK-CD52", qtyOrdered: 10, qtyReceived: 0, unitCost: 590 },
      { id: "li-9-2", catalogItemId: "ci-202", description: "Verkada AD31 Access Controller",   sku: "VK-AD31", qtyOrdered: 4,  qtyReceived: 0, unitCost: 890 },
    ],
  },
  {
    id: "po-10",
    poNumber: "PO-1184",
    vendorId: "v-6",
    vendorName: "Leviton",
    status: "sent",
    orderDate: "May 30, 2026",
    expectedDate: "Jun 5, 2026",
    receivedDate: null,
    vendorOrderNumber: "LV-PO-089234",
    trackingNumber: "1ZLV184078901234",
    linkedJobId: "pr4",
    notes: "Rack reorder — follow up with Leviton rep, shipment not yet received.",
    lineItems: [
      { id: "li-10-1", catalogItemId: "ci-302", description: 'Leviton 42" 2-Post Open Frame Rack', sku: "LV-47612-FR", qtyOrdered: 4, qtyReceived: 0, unitCost: 285 },
    ],
  },
  {
    id: "po-11",
    poNumber: "PO-1169",
    vendorId: "v-2",
    vendorName: "Anixter / Wesco",
    status: "cancelled",
    orderDate: "Mar 20, 2026",
    expectedDate: "Mar 28, 2026",
    receivedDate: null,
    vendorOrderNumber: null,
    trackingNumber: null,
    linkedJobId: null,
    notes: "Cancelled — quote came in over budget. Switched to ADI for better pricing on this SKU.",
    lineItems: [
      { id: "li-11-1", catalogItemId: "ci-401", description: "Biamp Tesira Forte AVB VT4", sku: "BA-TESIRA-VT4", qtyOrdered: 2, qtyReceived: 0, unitCost: 2450 },
    ],
  },
];
