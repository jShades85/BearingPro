export interface TradeTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

export const TRADE_TEMPLATES: TradeTemplate[] = [
  {
    id: "av",
    name: "Audio/Visual",
    description: "Conference rooms, displays, AV distribution, and control systems",
    categories: ["Displays & Projection", "Audio Equipment", "Video Distribution", "Control Systems", "Structured Cabling", "Labor"],
  },
  {
    id: "security",
    name: "Security",
    description: "Surveillance cameras, access control, and intrusion detection",
    categories: ["Cameras", "Access Control", "Intrusion Detection", "Video Management", "Intercoms & Gates", "Labor"],
  },
  {
    id: "hvac",
    name: "HVAC",
    description: "Heating, cooling, ventilation, and environmental controls",
    categories: ["Heating Equipment", "Cooling Equipment", "Controls & Thermostats", "Refrigerants", "Ductwork", "Labor"],
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Pipes, fixtures, water heaters, and pumps",
    categories: ["Pipes & Fittings", "Valves & Controls", "Fixtures & Trim", "Water Heaters", "Pumps", "Labor"],
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Wire, conduit, panels, fixtures, and devices",
    categories: ["Wire & Conduit", "Panels & Breakers", "Fixtures & Lighting", "Devices & Switches", "Labor"],
  },
  {
    id: "general",
    name: "General Contractor",
    description: "Framing, concrete, roofing, insulation, and finishes",
    categories: ["Lumber & Framing", "Concrete & Masonry", "Roofing", "Insulation", "Doors & Windows", "Labor"],
  },
];

export const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
];
